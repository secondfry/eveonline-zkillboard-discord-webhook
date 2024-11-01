import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { esi } from './esi';
import { Jumps, SimpleInvTypes, SimpleLocations } from './types';

const datapath = path.join(import.meta.dir, '..', 'data');

const invTypeNames = new Map<number, string>();
const locationNames = new Map<number, string>();
const universeNames = new Map<number, string>();
const locationSolarSystems = new Map<number, number | null>();

const readInvTypeNames = async () => {
  const filepath = path.join(datapath, 'invTypes.filtered.json');
  const raw = JSON.parse(await readFile(filepath, 'utf8')) as unknown;
  const data = SimpleInvTypes.parse(raw);

  for (const { typeID, typeName } of data) {
    invTypeNames.set(typeID, typeName);
  }
};

const readLocationNames = async () => {
  {
    const filepath = path.join(datapath, 'mapDenormalize.filtered.json');
    const raw = JSON.parse(await readFile(filepath, 'utf8')) as unknown;
    const data = SimpleLocations.parse(raw);

    for (const { itemID, itemName, solarSystemID } of data) {
      locationNames.set(itemID, itemName ?? 'Unknown');
      locationSolarSystems.set(itemID, solarSystemID);
    }
  }

  {
    const filepath = path.join(datapath, 'mapJumps.json');
    const raw = JSON.parse(await readFile(filepath, 'utf8')) as unknown;
    const data = Jumps.parse(raw);

    for (const { destinationID, stargateID } of data) {
      const destinationSolarSystem = locationSolarSystems.get(destinationID);
      if (!destinationSolarSystem)
        throw new Error(`Could not find solar system for ${destinationID}`);
      locationNames.set(
        stargateID,
        `Stargate (${locationNames.get(destinationSolarSystem)})`,
      );
    }
  }
};

const init = async () =>
  await Promise.all([readInvTypeNames(), readLocationNames()]);

const getUniverseNames = async (_ids: Array<number | undefined>) => {
  const ids = _ids.filter(Boolean) as number[];
  const missingIDs = ids.filter((id) => !universeNames.has(id));

  if (missingIDs.length) {
    try {
      const data = await esi.universe.names.post(missingIDs);
      data.forEach((name) => universeNames.set(name.id, name.name));
    } catch (cause) {
      console.error(new Error('ESI did not return names', { cause }));
    }
  }

  return ids.reduce(
    (acc, id) => {
      const name = universeNames.get(id) ?? 'Unknown';
      acc[id] = name;
      return acc;
    },
    {} as Record<number, string>,
  );
};

const getUniverseName = async (id: number | undefined, def = 'Unknown') => {
  if (!id) return def;
  const names = await getUniverseNames([id]);
  return names[id] ?? def;
};

const getLocationName = (id: number | undefined, def = 'Unknown') => {
  if (!id) return def;
  return locationNames.get(id) ?? def;
};

const getInvTypeName = (id: number | undefined, def = 'Unknown') => {
  if (!id) return def;
  return invTypeNames.get(id) ?? def;
};

export {
  getInvTypeName,
  getLocationName,
  getUniverseName,
  getUniverseNames,
  init,
};
