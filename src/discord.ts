import { WebhookClient } from 'discord.js';

import { config } from './config';
import { getDebug } from './log';

const webhook = new WebhookClient({
  url: config.discord.webhookURL,
});

const debug = getDebug('discord');

const send = async (message = 'Hello via Bun!') => {
  debug('Sending');
  await webhook.send(message);
};

export { send };
