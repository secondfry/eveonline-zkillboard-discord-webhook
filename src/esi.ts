import { z } from 'zod';

const UniverseName = z.object({
  category: z.string(),
  id: z.number(),
  name: z.string(),
});
type UniverseName = z.infer<typeof UniverseName>;

const UniverseNames = z.array(UniverseName);
type UniverseNames = z.infer<typeof UniverseNames>;

const esi = {
  universe: {
    names: {
      post: async (ids: number[]) => {
        const res = await fetch(
          'https://esi.evetech.net/latest/universe/names/?datasource=tranquility',
          {
            body: JSON.stringify(ids),
            method: 'POST',
            headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json',
              accept: 'application/json',
            },
          },
        );
        const data = (await res.json()) as unknown;
        return UniverseNames.parse(data);
      },
    },
  },
};

export { esi };
