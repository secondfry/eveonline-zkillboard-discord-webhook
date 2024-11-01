import type { WebhookMessageCreateOptions } from 'discord.js';

import {
  getInvTypeName,
  getLocationName,
  getUniverseName,
  getUniverseNames,
} from './names';
import type { TransformedKillmail } from './types';

const valueToMISK = (value: number) => `${(value / (1000 * 1000)).toFixed(2)}`;

const getKillmailColor = (data: TransformedKillmail) => {
  if (data.isWatchedAsAttackers) return 0x00ff00; // green
  if (data.isWatchedAsVictims) return 0xff0000; // red
  if (data.isOpportunityKillmail) return 0x0000ff; // blue
  return 0xffffff; // white
};

const killmailToMessagePayload = async (
  data: TransformedKillmail,
): Promise<WebhookMessageCreateOptions> => {
  const kill = data.raw.killmail;
  const zkb = data.raw.zkb;

  const victim = kill.victim;
  const attacker = kill.attackers.find((x) => x.final_blow);

  await getUniverseNames([victim.character_id, attacker?.character_id]);
  const victimName = await getUniverseName(victim.character_id);
  const attackerName = await getUniverseName(
    attacker?.character_id,
    'non-capsuleer',
  );

  const victimShipName = getInvTypeName(victim.ship_type_id);
  const attackerShipName = getInvTypeName(attacker?.ship_type_id);

  const solarSystemName = getLocationName(kill.solar_system_id);
  const locationName = getLocationName(zkb.locationID);

  return {
    content: `https://zkillboard.com/kill/${kill.killmail_id}`,
    embeds: [
      {
        author: {
          icon_url: `https://images.evetech.net/characters/${victim.character_id}/portrait`,
          name: `${victimShipName} | ${victimName} | ${valueToMISK(zkb.totalValue)}/${valueToMISK(zkb.droppedValue)}M ISK`,
          url: `https://zkillboard.com/character/${victim.character_id}`,
        },
        color: getKillmailColor(data),
        fields: [
          {
            name: 'System',
            value: solarSystemName,
            inline: true,
          },
          {
            name: 'Location',
            value: locationName,
            inline: true,
          },
        ],
        footer: {
          text: `Last blow by ${attackerName} | ${attackerShipName}`,
          icon_url: `https://images.evetech.net/characters/${attacker?.character_id}/portrait`,
        },
        thumbnail: {
          url: `https://images.evetech.net/types/${victim.ship_type_id}/icon`,
        },
        timestamp: kill.killmail_time,
      },
    ],
  };
};

export { killmailToMessagePayload, valueToMISK };
