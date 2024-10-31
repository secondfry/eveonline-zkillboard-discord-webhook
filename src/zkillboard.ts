import { config } from './config';
import { getDebug } from './log';
import { RedisQResponse, ZKBPackage } from './types';

type TransformResult = { message: string; raw: ZKBPackage };

const IGNORED_VICTIM_CORPORATIONS = [
  // NOTE(secondfry): Blood Raiders
  1000134,
  // NOTE(secondfry): Guristas
  1000127,
];

const fdebug = getDebug('zkillboard');

const endpoint = new URL('https://redisq.zkillboard.com/listen.php');
endpoint.searchParams.set('queueID', config.zkillboard.queueID);
fdebug('Endpoint: %s', String(endpoint));

const headers = {
  'User-Agent': `eveonline-zkillboard-discord-webhook, ${config.deployment.contactEmail}`,
};

const fetchNext = async () => {
  const debug = fdebug.extend('fetchNext');
  debug('Fetching next kill');
  const res = await fetch(endpoint, { headers });
  if (!res.ok) {
    console.error(res.status);
    const error = await res.text();
    throw new Error('Could not fetch next kill', { cause: error });
  }
  debug('Attemping to extract JSON');
  const unparsed = await res.json();
  try {
    debug('Validating raw JSON');
    const data = RedisQResponse.parse(unparsed);
    return data;
  } catch (cause) {
    console.error(unparsed);
    throw new Error('Could not parse RedisQ response', { cause });
  }
};

const isWatchedKillmail = (zkbPackage: ZKBPackage) => {
  const watchedByAttackers = zkbPackage.killmail.attackers.some(
    (attacker) =>
      config.notifications.characters.includes(attacker.character_id ?? 0) ||
      config.notifications.corporations.includes(
        attacker.corporation_id ?? 0,
      ) ||
      config.notifications.alliances.includes(attacker.alliance_id ?? 0),
  );
  if (watchedByAttackers) return true;

  const watchedByVictims =
    config.notifications.characters.includes(
      zkbPackage.killmail.victim.character_id ?? 0,
    ) ||
    config.notifications.corporations.includes(
      zkbPackage.killmail.victim.corporation_id ?? 0,
    ) ||
    config.notifications.alliances.includes(
      zkbPackage.killmail.victim.alliance_id ?? 0,
    );
  if (watchedByVictims) return true;

  return false;
};

const isOpportunityKillmail = (zkbPackage: ZKBPackage) => {
  if (!config.notifications.opportinities.enabled) return false;
  const debug = fdebug.extend('isOpportunityKillmail');

  const now = Date.now();
  const then = Date.parse(zkbPackage.killmail.killmail_time);
  const isRecentEnough =
    now - then < config.notifications.opportinities.threshold.time;
  if (!isRecentEnough) {
    debug('Wreck is too old');
    return false;
  }

  const isValuable =
    zkbPackage.zkb.droppedValue >
    config.notifications.opportinities.threshold.value;
  if (!isValuable) {
    debug(
      'Wreck is not valuable enough: %sM ISK',
      (zkbPackage.zkb.droppedValue / (1000 * 1000)).toFixed(2),
    );
    return false;
  }

  const isHighsec = zkbPackage.zkb.labels.includes('loc:highsec');
  const isLowsec = zkbPackage.zkb.labels.includes('loc:lowsec');
  if (!isHighsec && !isLowsec) {
    debug('Wreck is most probably too far away');
    return false;
  }

  const isNPCKillmail = zkbPackage.zkb.npc;
  if (!isNPCKillmail) {
    debug('NPC were not involved with this');
    return false;
  }

  const isIgnoredVictimCorporation = IGNORED_VICTIM_CORPORATIONS.includes(
    zkbPackage.killmail.victim.corporation_id,
  );
  if (isIgnoredVictimCorporation) {
    debug('Wreck victim corporation is ignored');
    return false;
  }

  return true;
};

const transform = (rawKill: RedisQResponse): TransformResult | undefined => {
  const debug = fdebug.extend('transform');
  if (!rawKill?.package) {
    debug('No kills found in last 10 seconds');
    return;
  }

  debug('Raw kill: %o', rawKill.package);

  debug('Transforming raw JSON to our data');
  return {
    message: `https://zkillboard.com/kill/${rawKill.package.killID}`,
    raw: rawKill.package,
  };
};

const filter = (data: TransformResult) => {
  const debug = fdebug.extend('filter');
  if (isWatchedKillmail(data.raw)) {
    debug('This killmail is watched');
    return {
      message: `Watched: https://zkillboard.com/kill/${data.raw.killID}`,
      raw: data.raw,
    };
  }

  if (isOpportunityKillmail(data.raw)) {
    debug('This killmail is an opportunity');
    return {
      message: `Opportunity: https://zkillboard.com/kill/${data.raw.killID}`,
      raw: data.raw,
    };
  }

  debug('Skipping this killmail');
  return;
};

const get = async () => {
  const data = await fetchNext();
  const transformed = transform(data);
  if (!transformed) return;
  const filtered = filter(transformed);
  if (!filtered) return;
  return filtered;
};

export { get };
