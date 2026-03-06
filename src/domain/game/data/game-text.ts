import type { GameLocale } from "../../../shared/contracts/game.ts";

/**
 * Locale-indexed game strings for dialogue and labels.
 */
export interface GameTextCatalog {
  readonly scenes: {
    readonly "scene.teaHouse.title": string;
  };
  readonly npcs: {
    readonly [key: string]: string;
  };
  readonly progression: {
    readonly levelNames: readonly string[];
  };
}

/**
 * English and Chinese game copy used by owned game engine and UI.
 */
export const gameTextByLocale: Record<GameLocale, GameTextCatalog> = {
  "en-US": {
    scenes: {
      "scene.teaHouse.title": "Yangtze Tea House",
    },
    npcs: {
      "npc.teaMonk.label": "Tea Monk",
      "npc.teaMonk.lines.wood-cycle":
        "The five teas are the five elements. Each brew carries the memory of the leaf.",
      "npc.teaMonk.lines.overcome":
        "Wood grows into Fire. Fire settles into Earth. Learn the cycle, and you master the stance.",
      "npc.teaMonk.greet": "Ah, a student of the leaf. Come closer.",
      "npc.merchant.label": "Silk Merchant",
      "npc.merchant.lines.quality":
        "Finest oolong from the southern slopes! Triple-roasted, corruption-free — I guarantee it.",
      "npc.merchant.lines.routes":
        "The Wei patrols have tightened the northern routes. Prices will climb before the moon wanes.",
      "npc.merchant.lines.shipment":
        "Between us — a shipment of white silver needle is arriving at midnight. Interested?",
      "npc.merchant.greet": "Interested in something fine, traveller?",
      "npc.riverPilot.label": "Tea Oracle",
      "npc.riverPilot.lines.oracle-intro":
        "I read the leaves for those brave enough to listen. Speak, and the tea shall answer.",
      "npc.riverPilot.lines.oracle-quote":
        "The five elements never lie. Let me consult them for you...",
      "npc.riverPilot.greet": "The leaves stir... someone approaches.",
    },
    progression: {
      levelNames: [
        "Tea Novice",
        "Leaf Reader",
        "Brew Adept",
        "Steam Whisperer",
        "Caravan Scout",
        "Ritual Tactician",
        "Tea General",
        "Ledger Keeper",
      ],
    },
  },
  "zh-CN": {
    scenes: {
      "scene.teaHouse.title": "长江茶馆",
    },
    npcs: {
      "npc.teaMonk.label": "茶僧",
      "npc.teaMonk.lines.wood-cycle": "五茶即五行。每一壶都承载茶叶的记忆。",
      "npc.teaMonk.lines.overcome": "木生火，火克金，木能生火，学习五行，便掌握阵势。",
      "npc.teaMonk.greet": "善哉，茶道有缘者，请上前来。",
      "npc.merchant.label": "丝商",
      "npc.merchant.lines.quality": "南方坡茶，最精致的乌龙，三烤无杂，保证不掺腐败。",
      "npc.merchant.lines.routes": "北岸戒严，魏军巡逻已加重。望月前货价必涨。",
      "npc.merchant.lines.shipment": "我私下告诉你，午夜会有一批白毫银针到港，有意再来。",
      "npc.merchant.greet": "喜欢些不一样的茶吗，旅人？",
      "npc.riverPilot.label": "茶仙",
      "npc.riverPilot.lines.oracle-intro": "只要有胆识，便可让茶叶为你解梦：说出来，让叶子回答吧。",
      "npc.riverPilot.lines.oracle-quote": "五行不欺。先让叶阵替你占一下。",
      "npc.riverPilot.greet": "叶片微动——有人靠近了。",
    },
    progression: {
      levelNames: [
        "茶道新手",
        "读叶者",
        "泡茶熟手",
        "闻香使",
        "茶队侦察",
        "茶道谋士",
        "茶将",
        "掌柜",
      ],
    },
  },
} as const;

/**
 * Resolves a localized game string key.
 *
 * @param locale Active locale.
 * @param key Message key.
 * @param fallback Fallback locale.
 * @returns localized label.
 */
export const resolveGameText = (locale: GameLocale, key: string): string => {
  const localeCatalog = gameTextByLocale[locale] ?? gameTextByLocale["en-US"];
  return (
    localeCatalog.npcs[key] ?? localeCatalog.scenes[key as keyof typeof localeCatalog.scenes] ?? key
  );
};
