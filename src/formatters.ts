import type { WebhookMessageCreateOptions } from 'discord.js';

import type { TransformedKillmail } from './types';

const valueToMISK = (value: number) =>
  `${(value / (1000 * 1000)).toFixed(2)}M ISK`;

const getKillmailColor = (data: TransformedKillmail) => {
  if (data.isWatchedAsAttackers) return 0x00ff00; // green
  if (data.isWatchedAsVictims) return 0xff0000; // red
  if (data.isOpportunityKillmail) return 0x0000ff; // blue
  return 0xffffff; // white
};

const killmailToMessagePayload = (
  data: TransformedKillmail,
): WebhookMessageCreateOptions => {
  const kill = data.raw.killmail;
  const zkb = data.raw.zkb;

  const victim = kill.victim;
  const victimName = victim.character_id?.toString() ?? 'Unknown';
  const victimShipName = victim.ship_type_id?.toString() ?? 'Unknown';

  const attacker = kill.attackers.find((x) => x.final_blow);
  const attackerName = attacker?.character_id?.toString() ?? 'non-capsuleer';
  const attackerShipName = attacker?.ship_type_id?.toString() ?? 'Unknown';

  return {
    embeds: [
      {
        author: {
          icon_url: `https://images.evetech.net/characters/${victim.character_id}/portrait`,
          name: `${victimShipName} | ${victimName}`,
          url: `https://zkillboard.com/character/${victim.character_id}`,
        },
        color: getKillmailColor(data),
        footer: {
          text: `Last blow by ${attackerName} | ${attackerShipName}`,
          icon_url: `https://images.evetech.net/characters/${attacker?.character_id}/portrait`,
        },
        thumbnail: {
          url: `https://images.evetech.net/types/${victim.ship_type_id}/icon`,
        },
        timestamp: kill.killmail_time,
        title: `${valueToMISK(zkb.droppedValue)} | ${zkb.locationID}`,
        url: `https://zkillboard.com/kill/${kill.killmail_id}`,
      },
    ],
  };
};

export { killmailToMessagePayload, valueToMISK };
