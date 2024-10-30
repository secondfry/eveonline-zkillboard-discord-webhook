import { send } from './src/discord';
import { getDebug } from './src/log';
import { get } from './src/zkillboard';

const debug = getDebug('main');

const run = async () => {
  while (true) {
    debug('Next cycle');
    const data = await get();
    if (!data) continue;
    await send(data.message);
  }
};

await run();
