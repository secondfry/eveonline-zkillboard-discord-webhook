import assert from 'node:assert';

import { z } from 'zod';

import { getDebug } from './log';
import { Alliances, Characters, Corporations } from './types';

type Config = {
  deployment: {
    contactEmail: string;
  };
  discord: {
    webhookURL: string;
  };
  notifications: {
    alliances: number[];
    characters: number[];
    corporations: number[];
    opportinities: {
      enabled: boolean;
      threshold: number;
    };
  };
  zkillboard: {
    queueID: string;
  };
};

declare module 'bun' {
  interface Env {
    DEPLOYMENT_CONTACT_EMAIL?: string;
    DISCORD_WEBHOOK_URL?: string;
    NOTIFICATIONS_ALLIANCES?: string;
    NOTIFICATIONS_CHARACTERS?: string;
    NOTIFICATIONS_CORPORATIONS?: string;
    OPPORTINITIES_ENABLED?: string;
    OPPORTINITIES_THRESHOLD?: string;
    ZKILLBOARD_QUEUEID?: string;
  }
}

const {
  DEPLOYMENT_CONTACT_EMAIL,
  DISCORD_WEBHOOK_URL,
  NOTIFICATIONS_ALLIANCES,
  NOTIFICATIONS_CHARACTERS,
  NOTIFICATIONS_CORPORATIONS,
  OPPORTINITIES_ENABLED,
  OPPORTINITIES_THRESHOLD = '100000000',
  ZKILLBOARD_QUEUEID,
} = process.env;
assert(DEPLOYMENT_CONTACT_EMAIL, 'Provide DEPLOYMENT_CONTACT_EMAIL');
assert(DISCORD_WEBHOOK_URL, 'Provide DISCORD_WEBHOOK_URL');
assert(ZKILLBOARD_QUEUEID, 'Provide ZKILLBOARD_QUEUEID');

// NOTE(secondfry): only use valid characters
const queueID = ZKILLBOARD_QUEUEID.replace(/[^a-zA-Z0-9\-]/g, '');
assert(queueID, 'Invalid ZKILLBOARD_QUEUEID');

const alliances = Alliances.parse(NOTIFICATIONS_ALLIANCES?.split(','));
const characters = Characters.parse(NOTIFICATIONS_CHARACTERS?.split(','));
const corporations = Corporations.parse(NOTIFICATIONS_CORPORATIONS?.split(','));
assert(
  alliances.length || characters.length || corporations.length,
  'No notifications provided, provide at least one of NOTIFICATIONS_ALLIANCES, NOTIFICATIONS_CHARACTERS, NOTIFICATIONS_CORPORATIONS',
);

const opportinitiesEnabled = z.coerce.boolean().parse(OPPORTINITIES_ENABLED);
const opportinitiesThreshold = z.coerce.number().parse(OPPORTINITIES_THRESHOLD);

const debug = getDebug('config');

const config = {
  deployment: {
    contactEmail: DEPLOYMENT_CONTACT_EMAIL,
  },
  discord: {
    webhookURL: DISCORD_WEBHOOK_URL,
  },
  notifications: {
    alliances,
    characters,
    corporations,
    opportinities: {
      enabled: opportinitiesEnabled,
      threshold: opportinitiesThreshold,
    },
  },
  zkillboard: {
    queueID,
  },
} satisfies Config;

debug('Current config: %o', { ...config, discord: { webhookURL: '***' } });

export { config };
