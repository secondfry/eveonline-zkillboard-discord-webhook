import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Jumps } from '../src/types';

const datapath = path.join(import.meta.dir, '..', 'data');
await mkdir(datapath, { recursive: true });

/**
 * Thank you, Squizz Caphinator - zKillboard.
 * Thank you, Steve Ronuken - Fuzzwork Enterprises.
 */
const _fetchData = async () => {
  const res = await fetch('https://sde.zzeve.com/mapJumps.json');
  const data = (await res.json()) as unknown;
  return data;
};

const fetchData = async () => {
  const filepath = path.join(datapath, 'mapJumps.json');
  try {
    const raw = JSON.parse(await readFile(filepath, 'utf8')) as unknown;
    return Jumps.parse(raw);
  } catch (cause) {
    console.error(new Error('Could not read mapJumps.json', { cause }));
    const data = await _fetchData();
    await writeFile(filepath, JSON.stringify(data, null, 2));
    return data;
  }
};

const run = async () => {
  await fetchData();
};

await run();
