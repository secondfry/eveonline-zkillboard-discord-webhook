import debugFactory from 'debug';

const debug = debugFactory('eveonline-zkillboard-discord-webhook');

const getDebug = (prefix?: string) => {
  if (prefix) return debug.extend(prefix);
  return debug;
};

export { getDebug };
