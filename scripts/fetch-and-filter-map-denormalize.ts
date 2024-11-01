import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { Locations, type Location, type SimpleLocation } from '../src/types';

const datapath = path.join(import.meta.dir, '..', 'data');
await mkdir(datapath, { recursive: true });

/**
 * Thank you, Squizz Caphinator - zKillboard.
 * Thank you, Steve Ronuken - Fuzzwork Enterprises.
 */
const _fetchData = async () => {
  const res = await fetch('https://sde.zzeve.com/mapDenormalize.json');
  const data = Locations.parse(await res.json());
  return data;
};

const fetchData = async () => {
  const filepath = path.join(datapath, 'mapDenormalize.json');
  try {
    return Locations.parse(JSON.parse(await readFile(filepath, 'utf8')));
  } catch (cause) {
    console.error(new Error('Could not read mapDenormalize.json', { cause }));
    const data = await _fetchData();
    await writeFile(filepath, JSON.stringify(data, null, 2));
    return data;
  }
};

const transform = (data: Location[]) =>
  data.map(({ itemID, itemName, solarSystemID }) => ({
    itemID,
    itemName,
    solarSystemID,
  }));

const write = async (data: SimpleLocation[]) => {
  const filepath = path.join(datapath, 'mapDenormalize.filtered.json');
  await writeFile(filepath, JSON.stringify(data, null, 2));
};

const run = async () => {
  const data = await fetchData();
  const transformed = transform(data);
  await write(transformed);
};

await run();
