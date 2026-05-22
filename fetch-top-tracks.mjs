#!/usr/bin/env node
// Build-time only. Fills `top:[...]` (3 Spotify track IDs) into each INFO
// entry of index.html, via the Spotify Web API client-credentials flow.
//
// Run:
//   SPOTIFY_CLIENT_ID=xxx SPOTIFY_CLIENT_SECRET=yyy node fetch-top-tracks.mjs
//
// Credentials come from a free Spotify dev app (developer.spotify.com).
// They are read from env only — never written to index.html or committed.

import { readFile, writeFile } from 'node:fs/promises';

const FILE = new URL('./index.html', import.meta.url);
const MARKET = 'FR';
const N = 3;

const id = process.env.SPOTIFY_CLIENT_ID;
const secret = process.env.SPOTIFY_CLIENT_SECRET;
if (!id || !secret) {
  console.error('Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET env vars.');
  process.exit(1);
}

async function getToken() {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error(`token ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(token, url) {
  for (;;) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.status === 429) {
      const wait = (Number(res.headers.get('retry-after')) || 2) * 1000;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  }
}

// Spotify blocks /artists/{id}/top-tracks for dev-mode apps (403), so derive
// a top-tracks proxy from /search: tracks credited to this exact artist id,
// ranked by popularity, deduped by base title.
async function topTracks(token, artistId, name) {
  const q = encodeURIComponent(`artist:"${name}"`);
  const data = await api(token, `https://api.spotify.com/v1/search?q=${q}&type=track&market=${MARKET}&limit=10`);
  const items = data.tracks.items;
  const own = items.filter(t => t.artists.some(a => a.id === artistId));
  const pool = (own.length ? own : items).slice().sort((a, b) => b.popularity - a.popularity);
  const byTitle = new Map();
  for (const t of pool) {
    const key = t.name.toLowerCase().replace(/\s*[([-].*$/, '').trim();
    if (!byTitle.has(key)) byTitle.set(key, t.id);
    if (byTitle.size >= N) break;
  }
  return [...byTitle.values()].slice(0, N);
}

async function artistName(token, artistId) {
  const data = await api(token, `https://api.spotify.com/v1/artists/${artistId}`);
  return data.name;
}

let html = await readFile(FILE, 'utf8');

// Unique artist IDs already present as Spotify URLs, skipping ones that
// already carry a `top:` array (idempotent re-runs).
const re = /sp:'https:\/\/open\.spotify\.com\/artist\/([A-Za-z0-9]{22})'(\s*,\s*top:)?/g;
const ids = new Set();
for (const m of html.matchAll(re)) if (!m[2]) ids.add(m[1]);

console.error(`${ids.size} artists to fetch...`);
const token = await getToken();
const idList = [...ids];

const map = new Map();
let i = 0;
for (const artistId of idList) {
  let name;
  try {
    name = await artistName(token, artistId);
    map.set(artistId, await topTracks(token, artistId, name));
  } catch (e) {
    console.error(`  skip ${artistId} (${name || '?'}): ${e.message}`);
  }
  if (++i % 20 === 0) console.error(`  ${i}/${ids.size}`);
  await new Promise(r => setTimeout(r, 120)); // gentle pacing
}

let injected = 0;
html = html.replace(re, (full, artistId, hasTop) => {
  if (hasTop) return full; // already done
  const tracks = map.get(artistId);
  if (!tracks || !tracks.length) return full;
  injected++;
  return `sp:'https://open.spotify.com/artist/${artistId}', top:[${tracks.map(t => `'${t}'`).join(',')}]`;
});

await writeFile(FILE, html);
console.error(`Injected top tracks into ${injected} entries.`);
