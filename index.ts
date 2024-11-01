import { sendMessage } from './src/discord';
import { killmailToMessagePayload } from './src/formatters';
import { getDebug } from './src/log';
import { init as initNames } from './src/names';
import { get } from './src/zkillboard';

const debug = getDebug('main');

const run = async () => {
  await initNames();

  while (true) {
    debug('Next cycle');
    const killmail = await get().catch(console.error);
    if (!killmail) continue;
    const message = await killmailToMessagePayload(killmail);
    await sendMessage(message).catch(console.error);
  }
};

await run();
