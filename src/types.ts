import { z } from 'zod';

const Alliances = z.array(z.coerce.number().positive().int()).catch([]);
type Alliances = z.infer<typeof Alliances>;

const Characters = z.array(z.coerce.number().positive().int()).catch([]);
type Characters = z.infer<typeof Characters>;

const Corporations = z.array(z.coerce.number().positive().int()).catch([]);
type Corporations = z.infer<typeof Corporations>;

const Attacker = z.object({
  alliance_id: z.number().optional(),
  character_id: z.number().optional(),
  corporation_id: z.number().optional(),
  damage_done: z.number(),
  final_blow: z.boolean(),
  security_status: z.number(),
  ship_type_id: z.number().optional(),
  weapon_type_id: z.number().optional(),
});
type Attacker = z.infer<typeof Attacker>;

const DroppedItem = z.object({
  flag: z.number(),
  item_type_id: z.number(),
  quantity_dropped: z.number(),
  singleton: z.number(),
});
type DroppedItem = z.infer<typeof DroppedItem>;

const DestroyedItem = z.object({
  flag: z.number(),
  item_type_id: z.number(),
  quantity_destroyed: z.number(),
  singleton: z.number(),
});
type DestroyedItem = z.infer<typeof DestroyedItem>;

const Killmail = z.object({
  attackers: z.array(Attacker),
  killmail_id: z.number(),
  killmail_time: z.string(),
  solar_system_id: z.number(),
  victim: z.object({
    alliance_id: z.number().optional(),
    character_id: z.number().optional(),
    corporation_id: z.number(),
    damage_taken: z.number(),
    items: z.array(z.union([DroppedItem, DestroyedItem])),
    position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
    ship_type_id: z.number(),
  }),
});
type Killmail = z.infer<typeof Killmail>;

const ZKBMetadata = z.object({
  locationID: z.number(),
  hash: z.string(),
  fittedValue: z.number(),
  droppedValue: z.number(),
  destroyedValue: z.number(),
  totalValue: z.number(),
  points: z.number(),
  npc: z.boolean(),
  solo: z.boolean(),
  awox: z.boolean(),
  labels: z.array(z.string()),
  href: z.string(),
});
type ZKBMetadata = z.infer<typeof ZKBMetadata>;

const ZKBPackage = z.object({
  killID: z.number(),
  killmail: Killmail,
  zkb: ZKBMetadata,
});
type ZKBPackage = z.infer<typeof ZKBPackage>;

const RedisQResponse = z.object({
  package: z.union([
    z.object({
      killID: z.number(),
      killmail: Killmail,
      zkb: ZKBMetadata,
    }),
    z.null(),
  ]),
});
type RedisQResponse = z.infer<typeof RedisQResponse>;

export {
  Alliances,
  Attacker,
  Characters,
  Corporations,
  DestroyedItem,
  DroppedItem,
  Killmail,
  RedisQResponse,
  ZKBMetadata,
  ZKBPackage,
};
