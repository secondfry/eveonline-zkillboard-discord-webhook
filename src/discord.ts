import { WebhookClient, type WebhookMessageCreateOptions } from 'discord.js';

import { config } from './config';
import { getDebug } from './log';

const webhook = new WebhookClient({
  url: config.discord.webhookURL,
});

const debug = getDebug('discord');

const sendString = async (message = 'Hello via Bun!') => {
  debug('Sending simple string');
  await webhook.send(message);
};

const sendMessage = async (message: WebhookMessageCreateOptions) => {
  debug('Sending MessagePayload');
  await webhook.send(message);
};

export { sendMessage, sendString };
