import { sendMessage } from './src/discord';
import { killmailToMessagePayload } from './src/formatters';
import { getDebug } from './src/log';
import { get } from './src/zkillboard';

const debug = getDebug('main');

const run = async () => {
  while (true) {
    debug('Next cycle');
    const killmail = await get().catch(console.error);
    if (!killmail) continue;
    const message = killmailToMessagePayload(killmail);
    await sendMessage(message).catch(console.error);
  }
};

await run();
