import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { InvTypes, type InvType, type SimpleInvType } from '../src/types';

const datapath = path.join(import.meta.dir, '..', 'data');
await mkdir(datapath, { recursive: true });

/**
 * Thank you, Squizz Caphinator - zKillboard.
 * Thank you, Steve Ronuken - Fuzzwork Enterprises.
 */
const _fetchData = async () => {
  const res = await fetch('https://sde.zzeve.com/invTypes.json');
  const data = InvTypes.parse(await res.json());
  return data;
};

const fetchData = async () => {
  const filepath = path.join(datapath, 'invTypes.json');
  try {
    return InvTypes.parse(JSON.parse(await readFile(filepath, 'utf8')));
  } catch (cause) {
    console.error(new Error('Could not read invTypes.json', { cause }));
    const data = await _fetchData();
    await writeFile(filepath, JSON.stringify(data, null, 2));
    return data;
  }
};

const transform = (data: InvType[]) =>
  data.map(({ typeID, typeName }) => ({ typeID, typeName }));

const write = async (data: SimpleInvType[]) => {
  const filepath = path.join(datapath, 'invTypes.filtered.json');
  await writeFile(filepath, JSON.stringify(data, null, 2));
};

const run = async () => {
  const data = await fetchData();
  const transformed = transform(data);
  await write(transformed);
};

await run();
