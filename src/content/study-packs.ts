/**
 * The shipped curated-pack catalog — the single source of truth
 * `scripts/seed-packs.ts` syncs into `study_packs` (upsert by slug,
 * items replaced wholesale). Add a pack or item here, run
 * `npm run db:seed:packs` per environment, and it's live.
 */

export type PackItemContent = {
  term: string;
  reading?: string;
  meaning: string;
  category?: "Verb" | "Noun" | "Adjective" | "Adverb" | "Phrase" | "Expression" | "Grammar" | "Other";
  example?: string;
};

/**
 * The shelf a book belongs on.
 *
 * Editorial, and authored here beside the book itself — the same kind of
 * thing as its description. It exists so Home can group books into rows
 * that mean something ("From anime & manga") instead of one long
 * alphabetical wall, and so the grouping still holds as the catalog
 * grows.
 *
 * Deliberately NOT derived from the name or the description. Guessing a
 * theme from a string is the kind of signal that looks right across
 * today's nine books and is quietly wrong on the twentieth.
 */
export type PackTheme = "anime" | "games" | "everyday" | "work";

/** Fixed display order for the themed shelves. */
export const PACK_THEME_ORDER: PackTheme[] = [
  "anime",
  "games",
  "everyday",
  "work",
];

export const PACK_THEME_LABEL: Record<PackTheme, string> = {
  anime: "From anime & manga",
  games: "From games",
  everyday: "Out in the world",
  work: "At work",
};

export type PackContent = {
  slug: string;
  name: string;
  language: string;
  theme: PackTheme;
  description: string;
  items: PackItemContent[];
};

export const STUDY_PACK_CATALOG: PackContent[] = [
  {
    slug: "persona-5-japanese",
    name: "Persona 5 essentials",
    language: "Japanese",
    theme: "games",
    description:
      "The kanji and phrases you'll actually meet playing Persona 5 — palaces, phantom thieves, and Tokyo school life.",
    items: [
      { term: "怪盗", reading: "かいとう / kaitō", meaning: "phantom thief", category: "Noun" },
      { term: "心", reading: "こころ / kokoro", meaning: "heart; mind", category: "Noun" },
      { term: "改心", reading: "かいしん / kaishin", meaning: "change of heart", category: "Noun" },
      { term: "宮殿", reading: "きゅうでん / kyūden", meaning: "palace", category: "Noun" },
      { term: "認知", reading: "にんち / ninchi", meaning: "cognition", category: "Noun" },
      { term: "予告状", reading: "よこくじょう / yokokujō", meaning: "calling card (advance notice)", category: "Noun" },
      { term: "総攻撃", reading: "そうこうげき / sōkōgeki", meaning: "all-out attack", category: "Noun" },
      { term: "正義", reading: "せいぎ / seigi", meaning: "justice", category: "Noun" },
      { term: "反逆", reading: "はんぎゃく / hangyaku", meaning: "rebellion", category: "Noun" },
      { term: "絆", reading: "きずな / kizuna", meaning: "bonds; ties", category: "Noun" },
      { term: "先輩", reading: "せんぱい / senpai", meaning: "upperclassman; senior", category: "Noun" },
      { term: "放課後", reading: "ほうかご / hōkago", meaning: "after school", category: "Noun" },
      { term: "喫茶店", reading: "きっさてん / kissaten", meaning: "coffee shop; café", category: "Noun" },
      { term: "屋根裏", reading: "やねうら / yaneura", meaning: "attic", category: "Noun" },
      { term: "試験", reading: "しけん / shiken", meaning: "exam", category: "Noun" },
      { term: "盗む", reading: "ぬすむ / nusumu", meaning: "to steal", category: "Verb" },
      { term: "覚悟", reading: "かくご / kakugo", meaning: "resolve; readiness", category: "Noun" },
      { term: "オタカラ", reading: "otakara", meaning: "treasure (the palace's core desire)", category: "Noun" },
    ],
  },
  {
    slug: "dragon-ball-japanese",
    name: "Dragon Ball essentials",
    language: "Japanese",
    theme: "anime",
    description:
      "Ki, training arcs, and wish-granting dragons — the words Dragon Ball built a generation of shōnen vocabulary on.",
    items: [
      { term: "気", reading: "き / ki", meaning: "ki; life energy", category: "Noun" },
      { term: "戦闘力", reading: "せんとうりょく / sentōryoku", meaning: "power level (battle power)", category: "Noun" },
      { term: "スカウター", reading: "sukautā", meaning: "scouter (the power-level reader)", category: "Noun" },
      { term: "かめはめ波", reading: "かめはめは / kamehameha", meaning: "Kamehameha — the signature energy wave", category: "Noun" },
      { term: "元気玉", reading: "げんきだま / genkidama", meaning: "Spirit Bomb (lit. energy sphere)", category: "Noun" },
      { term: "界王拳", reading: "かいおうけん / kaiōken", meaning: "Kaiō-ken — the power-multiplying technique", category: "Noun" },
      { term: "超サイヤ人", reading: "スーパーサイヤじん / sūpā saiya-jin", meaning: "Super Saiyan", category: "Noun" },
      { term: "修行", reading: "しゅぎょう / shugyō", meaning: "training; ascetic practice", category: "Noun" },
      { term: "師匠", reading: "ししょう / shishō", meaning: "master; one's teacher", category: "Noun" },
      { term: "弟子", reading: "でし / deshi", meaning: "disciple; apprentice", category: "Noun" },
      { term: "仙豆", reading: "せんず / senzu", meaning: "senzu bean (the full-heal bean)", category: "Noun" },
      { term: "神龍", reading: "シェンロン / Shenron", meaning: "Shenron — the wish-granting dragon", category: "Noun" },
      { term: "願い", reading: "ねがい / negai", meaning: "wish", category: "Noun" },
      { term: "生き返る", reading: "いきかえる / ikikaeru", meaning: "to come back to life", category: "Verb" },
      { term: "集める", reading: "あつめる / atsumeru", meaning: "to collect; to gather", category: "Verb" },
      { term: "大猿", reading: "おおざる / ōzaru", meaning: "Great Ape (the full-moon transformation)", category: "Noun" },
      { term: "尻尾", reading: "しっぽ / shippo", meaning: "tail", category: "Noun" },
      { term: "天下一武道会", reading: "てんかいちぶどうかい / tenkaichi budōkai", meaning: "World Martial Arts Tournament", category: "Noun" },
      { term: "強敵", reading: "きょうてき / kyōteki", meaning: "formidable foe", category: "Noun" },
    ],
  },
  {
    slug: "death-note-japanese",
    name: "Death Note essentials",
    language: "Japanese",
    theme: "anime",
    description:
      "Death gods, criminal investigation, and the vocabulary of judgment — the darker, more adult register of shōnen.",
    items: [
      { term: "死神", reading: "しにがみ / shinigami", meaning: "death god; god of death", category: "Noun" },
      { term: "死神の目", reading: "しにがみのめ / shinigami no me", meaning: "the shinigami eyes (see a person's name and lifespan)", category: "Noun" },
      { term: "寿命", reading: "じゅみょう / jumyō", meaning: "lifespan", category: "Noun" },
      { term: "名前", reading: "なまえ / namae", meaning: "name", category: "Noun" },
      { term: "書く", reading: "かく / kaku", meaning: "to write", category: "Verb" },
      { term: "死因", reading: "しいん / shiin", meaning: "cause of death", category: "Noun" },
      { term: "心臓麻痺", reading: "しんぞうまひ / shinzō mahi", meaning: "cardiac arrest; heart failure", category: "Noun" },
      { term: "正義", reading: "せいぎ / seigi", meaning: "justice", category: "Noun" },
      { term: "裁く", reading: "さばく / sabaku", meaning: "to judge; to pass judgment on", category: "Verb" },
      { term: "犯罪者", reading: "はんざいしゃ / hanzaisha", meaning: "criminal", category: "Noun" },
      { term: "容疑者", reading: "ようぎしゃ / yōgisha", meaning: "suspect", category: "Noun" },
      { term: "捜査", reading: "そうさ / sōsa", meaning: "(criminal) investigation", category: "Noun" },
      { term: "探偵", reading: "たんてい / tantei", meaning: "detective", category: "Noun" },
      { term: "疑う", reading: "うたがう / utagau", meaning: "to doubt; to suspect", category: "Verb" },
      { term: "罠", reading: "わな / wana", meaning: "trap", category: "Noun" },
      { term: "計画", reading: "けいかく / keikaku", meaning: "plan; scheme", category: "Noun" },
      { term: "取引", reading: "とりひき / torihiki", meaning: "deal; bargain", category: "Noun" },
      { term: "支配", reading: "しはい / shihai", meaning: "rule; domination", category: "Noun" },
    ],
  },
  {
    slug: "one-piece-japanese",
    name: "One Piece essentials",
    language: "Japanese",
    theme: "anime",
    description:
      "Pirates, bounties, and Devil Fruits — the seafaring vocabulary of the best-selling manga ever printed.",
    items: [
      { term: "海賊", reading: "かいぞく / kaizoku", meaning: "pirate", category: "Noun" },
      { term: "海賊王", reading: "かいぞくおう / kaizokuō", meaning: "Pirate King", category: "Noun" },
      { term: "麦わら帽子", reading: "むぎわらぼうし / mugiwara bōshi", meaning: "straw hat", category: "Noun" },
      { term: "悪魔の実", reading: "あくまのみ / akuma no mi", meaning: "Devil Fruit", category: "Noun" },
      { term: "能力者", reading: "のうりょくしゃ / nōryokusha", meaning: "an ability user (Devil Fruit eater)", category: "Noun" },
      { term: "覇気", reading: "はき / haki", meaning: "Haki — force of will", category: "Noun" },
      { term: "船長", reading: "せんちょう / senchō", meaning: "captain (of a ship)", category: "Noun" },
      { term: "航海士", reading: "こうかいし / kōkaishi", meaning: "navigator", category: "Noun" },
      { term: "剣士", reading: "けんし / kenshi", meaning: "swordsman", category: "Noun" },
      { term: "賞金首", reading: "しょうきんくび / shōkinkubi", meaning: "wanted man (a head with a price)", category: "Noun" },
      { term: "懸賞金", reading: "けんしょうきん / kenshōkin", meaning: "bounty; reward money", category: "Noun" },
      { term: "海軍", reading: "かいぐん / kaigun", meaning: "the Navy; the Marines", category: "Noun" },
      { term: "偉大なる航路", reading: "いだいなるこうろ / idai naru kōro", meaning: "the Grand Line (lit. great sea route)", category: "Noun" },
      { term: "出航", reading: "しゅっこう / shukkō", meaning: "setting sail; departure", category: "Noun" },
      { term: "航海", reading: "こうかい / kōkai", meaning: "voyage; sea travel", category: "Noun" },
      { term: "島", reading: "しま / shima", meaning: "island", category: "Noun" },
      { term: "宝", reading: "たから / takara", meaning: "treasure", category: "Noun" },
      { term: "夢", reading: "ゆめ / yume", meaning: "dream; ambition", category: "Noun" },
    ],
  },
  {
    slug: "naruto-japanese",
    name: "Naruto essentials",
    language: "Japanese",
    theme: "anime",
    description:
      "Ninja ranks, hand seals, and hidden villages — the words that carry almost every shinobi story.",
    items: [
      { term: "忍者", reading: "にんじゃ / ninja", meaning: "ninja; shinobi", category: "Noun" },
      { term: "忍術", reading: "にんじゅつ / ninjutsu", meaning: "ninja technique", category: "Noun" },
      { term: "チャクラ", reading: "chakura", meaning: "chakra — the energy techniques run on", category: "Noun" },
      { term: "印", reading: "いん / in", meaning: "hand seal (formed to cast a technique)", category: "Noun" },
      { term: "影分身", reading: "かげぶんしん / kage bunshin", meaning: "shadow clone", category: "Noun" },
      { term: "火影", reading: "ほかげ / Hokage", meaning: "Hokage — the village leader (lit. Fire Shadow)", category: "Noun" },
      { term: "里", reading: "さと / sato", meaning: "village; home village", category: "Noun" },
      { term: "木ノ葉", reading: "このは / Konoha", meaning: "the Leaf (Village)", category: "Noun" },
      { term: "下忍", reading: "げにん / genin", meaning: "genin — novice ninja rank", category: "Noun" },
      { term: "上忍", reading: "じょうにん / jōnin", meaning: "jōnin — elite ninja rank", category: "Noun" },
      { term: "中忍試験", reading: "ちゅうにんしけん / chūnin shiken", meaning: "the Chūnin Exams", category: "Noun" },
      { term: "抜け忍", reading: "ぬけにん / nukenin", meaning: "rogue ninja; village deserter", category: "Noun" },
      { term: "任務", reading: "にんむ / ninmu", meaning: "mission; assignment", category: "Noun" },
      { term: "手裏剣", reading: "しゅりけん / shuriken", meaning: "shuriken; throwing star", category: "Noun" },
      { term: "苦無", reading: "くない / kunai", meaning: "kunai — the throwing knife", category: "Noun" },
      { term: "巻物", reading: "まきもの / makimono", meaning: "scroll", category: "Noun" },
      { term: "封印", reading: "ふういん / fūin", meaning: "sealing; a seal", category: "Noun" },
      { term: "尾獣", reading: "びじゅう / bijū", meaning: "tailed beast", category: "Noun" },
      { term: "写輪眼", reading: "しゃりんがん / Sharingan", meaning: "Sharingan — the copy-wheel eye", category: "Noun" },
      { term: "忍道", reading: "にんどう / nindō", meaning: "one's ninja way (personal creed)", category: "Noun" },
      { term: "根性", reading: "こんじょう / konjō", meaning: "guts; willpower", category: "Noun" },
    ],
  },
  {
    slug: "final-fantasy-vii-japanese",
    name: "Final Fantasy VII essentials",
    language: "Japanese",
    theme: "games",
    description:
      "Mako, Materia, and a planet worth saving — the vocabulary of Japan's most-quoted RPG, remake included.",
    items: [
      { term: "魔晄", reading: "まこう / makō", meaning: "Mako — the planet's drawn-up life energy", category: "Noun" },
      { term: "魔晄炉", reading: "まこうろ / makōro", meaning: "Mako reactor", category: "Noun" },
      { term: "マテリア", reading: "materia", meaning: "Materia — the orbs that grant magic", category: "Noun" },
      { term: "召喚獣", reading: "しょうかんじゅう / shōkanjū", meaning: "summon (summoned beast)", category: "Noun" },
      { term: "リミット技", reading: "リミットわざ / rimitto waza", meaning: "Limit Break", category: "Noun" },
      { term: "神羅", reading: "しんら / Shinra", meaning: "Shinra — the electric-power company", category: "Noun" },
      { term: "会社", reading: "かいしゃ / kaisha", meaning: "company; corporation", category: "Noun" },
      { term: "電力", reading: "でんりょく / denryoku", meaning: "electric power", category: "Noun" },
      { term: "反乱軍", reading: "はんらんぐん / hanrangun", meaning: "rebel army; insurgents", category: "Noun" },
      { term: "爆破", reading: "ばくは / bakuha", meaning: "blowing up; demolition", category: "Noun" },
      { term: "傭兵", reading: "ようへい / yōhei", meaning: "mercenary", category: "Noun" },
      { term: "兵士", reading: "へいし / heishi", meaning: "soldier", category: "Noun" },
      { term: "実験", reading: "じっけん / jikken", meaning: "experiment", category: "Noun" },
      { term: "記憶", reading: "きおく / kioku", meaning: "memory; recollection", category: "Noun" },
      { term: "正体", reading: "しょうたい / shōtai", meaning: "true identity", category: "Noun" },
      { term: "英雄", reading: "えいゆう / eiyū", meaning: "hero", category: "Noun" },
      { term: "復讐", reading: "ふくしゅう / fukushū", meaning: "revenge", category: "Noun" },
      { term: "罪", reading: "つみ / tsumi", meaning: "sin; guilt", category: "Noun" },
      { term: "故郷", reading: "ふるさと / furusato", meaning: "hometown; where one is from", category: "Noun" },
      { term: "星", reading: "ほし / hoshi", meaning: "the Planet; star", category: "Noun" },
      { term: "生命", reading: "せいめい / seimei", meaning: "life (as a force)", category: "Noun" },
      { term: "環境", reading: "かんきょう / kankyō", meaning: "the environment", category: "Noun" },
    ],
  },
  {
    slug: "anime-essentials-japanese",
    name: "Anime essentials",
    language: "Japanese",
    theme: "anime",
    description:
      "The vocabulary every anime keeps reusing — heroes, rivals, training arcs, and dramatic declarations.",
    items: [
      { term: "主人公", reading: "しゅじんこう / shujinkō", meaning: "protagonist; main character", category: "Noun" },
      { term: "悪役", reading: "あくやく / akuyaku", meaning: "villain", category: "Noun" },
      { term: "必殺技", reading: "ひっさつわざ / hissatsuwaza", meaning: "signature/finishing move", category: "Noun" },
      { term: "変身", reading: "へんしん / henshin", meaning: "transformation", category: "Noun" },
      { term: "修行", reading: "しゅぎょう / shugyō", meaning: "training (arc)", category: "Noun" },
      { term: "仲間", reading: "なかま / nakama", meaning: "comrades; companions", category: "Noun" },
      { term: "魔法", reading: "まほう / mahō", meaning: "magic", category: "Noun" },
      { term: "冒険", reading: "ぼうけん / bōken", meaning: "adventure", category: "Noun" },
      { term: "運命", reading: "うんめい / unmei", meaning: "fate; destiny", category: "Noun" },
      { term: "伝説", reading: "でんせつ / densetsu", meaning: "legend", category: "Noun" },
      { term: "約束", reading: "やくそく / yakusoku", meaning: "promise", category: "Noun" },
      { term: "諦めない", reading: "あきらめない / akiramenai", meaning: "to never give up", category: "Expression" },
      { term: "戦う", reading: "たたかう / tatakau", meaning: "to fight", category: "Verb" },
      { term: "守る", reading: "まもる / mamoru", meaning: "to protect", category: "Verb" },
      { term: "強くなる", reading: "つよくなる / tsuyoku naru", meaning: "to become strong", category: "Expression" },
    ],
  },
  {
    slug: "gaming-japanese",
    name: "Gaming Japanese",
    language: "Japanese",
    theme: "games",
    description:
      "Menu-screen and RPG vocabulary — read your equipment, quests, and boss fights without a guide.",
    items: [
      { term: "攻略", reading: "こうりゃく / kōryaku", meaning: "walkthrough; strategy", category: "Noun" },
      { term: "経験値", reading: "けいけんち / keikenchi", meaning: "experience points (XP)", category: "Noun" },
      { term: "装備", reading: "そうび / sōbi", meaning: "equipment; to equip", category: "Noun" },
      { term: "回復", reading: "かいふく / kaifuku", meaning: "recovery; healing", category: "Noun" },
      { term: "勇者", reading: "ゆうしゃ / yūsha", meaning: "hero (RPG)", category: "Noun" },
      { term: "魔王", reading: "まおう / maō", meaning: "demon lord", category: "Noun" },
      { term: "剣", reading: "けん / ken", meaning: "sword", category: "Noun" },
      { term: "盾", reading: "たて / tate", meaning: "shield", category: "Noun" },
      { term: "呪文", reading: "じゅもん / jumon", meaning: "spell; incantation", category: "Noun" },
      { term: "宝箱", reading: "たからばこ / takarabako", meaning: "treasure chest", category: "Noun" },
      { term: "隠しボス", reading: "かくしボス / kakushi bosu", meaning: "hidden boss", category: "Noun" },
      { term: "敵", reading: "てき / teki", meaning: "enemy", category: "Noun" },
      { term: "味方", reading: "みかた / mikata", meaning: "ally", category: "Noun" },
      { term: "続編", reading: "ぞくへん / zokuhen", meaning: "sequel", category: "Noun" },
      { term: "体験版", reading: "たいけんばん / taikenban", meaning: "demo version", category: "Noun" },
    ],
  },
  {
    slug: "cafe-french",
    name: "Café survival French",
    language: "French",
    theme: "everyday",
    description:
      "Order, pay, and small-talk your way through any Parisian café politely.",
    items: [
      { term: "un café allongé", meaning: "a long black / americano-style coffee", category: "Noun" },
      { term: "une noisette", meaning: "espresso with a dash of milk", category: "Noun" },
      { term: "un café crème", meaning: "coffee with steamed milk", category: "Noun" },
      { term: "l'addition", meaning: "the bill", category: "Noun", example: "L'addition, s'il vous plaît." },
      { term: "sur place", meaning: "for here", category: "Phrase" },
      { term: "à emporter", meaning: "to go / takeaway", category: "Phrase" },
      { term: "je voudrais", meaning: "I would like (polite)", category: "Phrase", example: "Je voudrais un croissant, s'il vous plaît." },
      { term: "commander", meaning: "to order", category: "Verb" },
      { term: "payer", meaning: "to pay", category: "Verb" },
      { term: "la monnaie", meaning: "change (money)", category: "Noun" },
      { term: "un pourboire", meaning: "a tip", category: "Noun" },
      { term: "Je vous dois combien ?", meaning: "How much do I owe you?", category: "Expression" },
    ],
  },

  // ── ENGLISH ──────────────────────────────────────────────────────────
  // Written for the first real learner outside the founder's own study:
  // a Thai-speaking colleague learning English for work (2026-09-09).
  // Meanings are a plain-English definition FIRST, then a Thai gloss
  // after " · " — the definition is what the tutor and the sentence
  // cards build on, the gloss is what makes a beginner's first week
  // possible. `reading` is a plain respelling with the stressed syllable
  // in CAPITALS (no IPA: a beginner cannot read it and it is one more
  // thing to learn before the word). The Thai glosses have NOT had a
  // native review yet — fix in place, this file is the source of truth.
  {
    slug: "everyday-english-verbs",
    name: "Everyday English verbs",
    language: "English",
    theme: "everyday",
    description:
      "The two dozen verbs that carry most English sentences. Learn these and half of every conversation is already yours.",
    items: [
      { term: "get", reading: "GET", meaning: "to receive, obtain, or become · ได้รับ / ไปเอา", category: "Verb", example: "Can you get me a coffee?" },
      { term: "make", reading: "MAYK", meaning: "to create or produce something · ทำ / สร้าง", category: "Verb", example: "I'll make a list before the meeting." },
      { term: "take", reading: "TAYK", meaning: "to carry something with you, or to accept · เอาไป / รับ", category: "Verb", example: "Take an umbrella, it might rain." },
      { term: "give", reading: "GIV", meaning: "to hand something to someone · ให้", category: "Verb", example: "Give me a minute, please." },
      { term: "go", reading: "GOH", meaning: "to move to another place · ไป", category: "Verb", example: "Let's go to lunch." },
      { term: "come", reading: "KUM", meaning: "to move towards the speaker · มา", category: "Verb", example: "Come to my desk when you're free." },
      { term: "see", reading: "SEE", meaning: "to notice with your eyes; to understand · เห็น / เข้าใจ", category: "Verb", example: "I see what you mean." },
      { term: "know", reading: "NOH", meaning: "to have information or be familiar with · รู้ / รู้จัก", category: "Verb", example: "Do you know his phone number?" },
      { term: "think", reading: "THINGK", meaning: "to have an opinion; to use your mind · คิด", category: "Verb", example: "I think we should start early." },
      { term: "want", reading: "WONT", meaning: "to wish for something · ต้องการ / อยาก", category: "Verb", example: "I want to improve my English." },
      { term: "need", reading: "NEED", meaning: "to require something · จำเป็นต้อง / ต้องการ", category: "Verb", example: "We need more time." },
      { term: "use", reading: "YOOZ", meaning: "to do something with a tool or object · ใช้", category: "Verb", example: "Use this template for the report." },
      { term: "find", reading: "FYND", meaning: "to discover something you were looking for · หา (เจอ) / พบ", category: "Verb", example: "I can't find the file." },
      { term: "tell", reading: "TEL", meaning: "to say something to a person · บอก", category: "Verb", example: "Tell me if you have any questions." },
      { term: "ask", reading: "AHSK", meaning: "to put a question to someone; to request · ถาม / ขอ", category: "Verb", example: "Ask the manager before you send it." },
      { term: "work", reading: "WURK", meaning: "to do a job; (of a machine) to function · ทำงาน / ใช้งานได้", category: "Verb", example: "The printer doesn't work." },
      { term: "try", reading: "TRY", meaning: "to attempt something · ลอง / พยายาม", category: "Verb", example: "Try restarting the computer." },
      { term: "leave", reading: "LEEV", meaning: "to go away from a place; to put something somewhere · ออกจาก / ทิ้งไว้", category: "Verb", example: "I leave the office at six." },
      { term: "call", reading: "KAWL", meaning: "to telephone someone; to name · โทร / เรียก", category: "Verb", example: "Call me when you arrive." },
      { term: "help", reading: "HELP", meaning: "to make something easier for someone · ช่วย", category: "Verb", example: "Can you help me with this?" },
      { term: "start", reading: "STAHRT", meaning: "to begin · เริ่ม", category: "Verb", example: "The meeting starts at ten." },
      { term: "finish", reading: "FIN-ish", meaning: "to complete; to end · เสร็จ / ทำให้เสร็จ", category: "Verb", example: "I'll finish the report today." },
      { term: "wait", reading: "WAYT", meaning: "to stay until something happens · รอ", category: "Verb", example: "Please wait here." },
      { term: "send", reading: "SEND", meaning: "to make something go to another place or person · ส่ง", category: "Verb", example: "Send me the link." },
    ],
  },
  {
    slug: "small-talk-english",
    name: "Small talk in English",
    language: "English",
    theme: "everyday",
    description:
      "The first minute of every conversation — greetings, weekends, weather, and how to keep it going without a plan.",
    items: [
      { term: "How's it going?", reading: "howz it GOH-ing", meaning: "a casual 'how are you' · เป็นยังไงบ้าง", category: "Expression", example: "Hey! How's it going?" },
      { term: "Not bad, thanks", reading: "not BAD thanks", meaning: "a relaxed 'I'm fine' · ก็ดีนะ ขอบคุณ", category: "Expression", example: "Not bad, thanks. And you?" },
      { term: "And you?", reading: "and YOO", meaning: "returning the question · แล้วคุณล่ะ", category: "Expression" },
      { term: "Nice to meet you", reading: "NYS to MEET yoo", meaning: "said when meeting someone for the first time · ยินดีที่ได้รู้จัก", category: "Expression" },
      { term: "weekend", reading: "WEEK-end", meaning: "Saturday and Sunday · วันหยุดสุดสัปดาห์", category: "Noun", example: "How was your weekend?" },
      { term: "busy", reading: "BIZ-ee", meaning: "having a lot to do · ยุ่ง", category: "Adjective", example: "It's been a busy week." },
      { term: "tired", reading: "TY-erd", meaning: "needing rest · เหนื่อย", category: "Adjective", example: "I'm a bit tired today." },
      { term: "weather", reading: "WEH-thur", meaning: "sun, rain, heat, cold · สภาพอากาศ", category: "Noun", example: "The weather is terrible today." },
      { term: "hot", reading: "HOT", meaning: "high temperature · ร้อน", category: "Adjective", example: "It's so hot outside." },
      { term: "rainy season", reading: "RAY-nee SEE-zun", meaning: "the months when it rains most · ฤดูฝน", category: "Noun" },
      { term: "hobby", reading: "HOB-ee", meaning: "something you do for fun in your free time · งานอดิเรก", category: "Noun", example: "Do you have any hobbies?" },
      { term: "What do you do?", reading: "wot doo yoo DOO", meaning: "asking about someone's job · คุณทำงานอะไร", category: "Expression" },
      { term: "I work in", reading: "eye WURK in", meaning: "naming your field or company · ฉันทำงานด้าน...", category: "Phrase", example: "I work in accounting." },
      { term: "Where are you from?", reading: "wair ar yoo FRUM", meaning: "asking someone's hometown or country · คุณมาจากไหน", category: "Expression" },
      { term: "Really?", reading: "REE-lee", meaning: "showing interest or surprise · จริงเหรอ", category: "Expression", example: "Really? I didn't know that." },
      { term: "Sounds good", reading: "sowndz GOOD", meaning: "agreeing to a plan · ฟังดูดี / ตกลง", category: "Expression" },
      { term: "See you later", reading: "see yoo LAY-tur", meaning: "a casual goodbye · แล้วเจอกัน", category: "Expression" },
      { term: "Have a good one", reading: "hav a GOOD wun", meaning: "a friendly goodbye ('have a good day') · ขอให้เป็นวันที่ดี", category: "Expression" },
    ],
  },
  {
    slug: "cafe-english",
    name: "Café & restaurant English",
    language: "English",
    theme: "everyday",
    description:
      "Order, ask, pay, and understand the reply — every phrase between the door and the bill.",
    items: [
      { term: "Can I get", reading: "kan eye GET", meaning: "the everyday way to order · ขอ... (สั่งอาหาร)", category: "Phrase", example: "Can I get a latte, please?" },
      { term: "I'd like", reading: "eyed LYK", meaning: "a polite way to order or request · ฉันอยากได้ / ขอ", category: "Phrase", example: "I'd like the chicken salad." },
      { term: "menu", reading: "MEN-yoo", meaning: "the list of food and drinks · เมนู", category: "Noun", example: "Could we see the menu?" },
      { term: "order", reading: "OR-dur", meaning: "to ask for food or drink · สั่ง", category: "Verb", example: "Are you ready to order?" },
      { term: "takeaway", reading: "TAYK-a-way", meaning: "food you take with you (US: to go) · ซื้อกลับบ้าน", category: "Noun", example: "Is that for here or takeaway?" },
      { term: "for here", reading: "for HEER", meaning: "eating in the café · ทานที่นี่", category: "Phrase" },
      { term: "the bill", reading: "the BIL", meaning: "the paper showing what you must pay (US: the check) · บิล / เช็คบิล", category: "Noun", example: "Could we have the bill, please?" },
      { term: "tip", reading: "TIP", meaning: "extra money you leave for the staff · ทิป", category: "Noun" },
      { term: "receipt", reading: "ri-SEET", meaning: "the printed proof that you paid · ใบเสร็จ", category: "Noun", example: "Can I have a receipt?" },
      { term: "by card", reading: "by KAHRD", meaning: "paying with a bank card · จ่ายด้วยบัตร", category: "Phrase", example: "Can I pay by card?" },
      { term: "spicy", reading: "SPY-see", meaning: "hot from chilli · เผ็ด", category: "Adjective", example: "Is this dish spicy?" },
      { term: "vegetarian", reading: "vej-e-TAIR-ee-an", meaning: "without meat · มังสวิรัติ", category: "Adjective" },
      { term: "allergic", reading: "a-LUR-jik", meaning: "made ill by a certain food · แพ้ (อาหาร)", category: "Adjective", example: "I'm allergic to peanuts." },
      { term: "table for two", reading: "TAY-bul for TOO", meaning: "asking for seats for two people · โต๊ะสำหรับสองคน", category: "Phrase" },
      { term: "Excuse me", reading: "ek-SKYOOZ mee", meaning: "getting someone's attention politely · ขอโทษครับ/ค่ะ (เรียก)", category: "Expression" },
      { term: "Could you", reading: "kood yoo", meaning: "a polite request · ช่วย...หน่อยได้ไหม", category: "Phrase", example: "Could you bring some water?" },
      { term: "That's all", reading: "thats AWL", meaning: "nothing more to order · แค่นี้ครับ/ค่ะ", category: "Expression" },
      { term: "Keep the change", reading: "keep the CHAYNJ", meaning: "letting the staff keep the extra money · ไม่ต้องทอน", category: "Expression" },
    ],
  },
  {
    slug: "office-english",
    name: "English at the office",
    language: "English",
    theme: "work",
    description:
      "Meetings, deadlines, and the words a workday is made of — for the colleague who understands the work but not yet the room.",
    items: [
      { term: "meeting", reading: "MEE-ting", meaning: "a planned time when people talk about work · การประชุม", category: "Noun", example: "We have a meeting at two." },
      { term: "deadline", reading: "DED-lyn", meaning: "the latest time something must be done · กำหนดส่ง / เส้นตาย", category: "Noun", example: "The deadline is Friday." },
      { term: "schedule", reading: "SKED-yool", meaning: "a plan of when things happen · ตารางเวลา / กำหนดการ", category: "Noun", example: "Let me check my schedule." },
      { term: "colleague", reading: "KOL-eeg", meaning: "a person you work with · เพื่อนร่วมงาน", category: "Noun" },
      { term: "manager", reading: "MAN-a-jur", meaning: "the person in charge of a team · ผู้จัดการ / หัวหน้า", category: "Noun" },
      { term: "agenda", reading: "a-JEN-da", meaning: "the list of things to discuss in a meeting · วาระการประชุม", category: "Noun", example: "Is that on the agenda?" },
      { term: "update", reading: "UP-dayt", meaning: "the newest information about something · ข้อมูลล่าสุด / อัปเดต", category: "Noun", example: "Can you give me an update on the project?" },
      { term: "follow up", reading: "FOL-oh UP", meaning: "to check on something again later · ติดตามผล", category: "Phrase", example: "I'll follow up with the client tomorrow." },
      { term: "in charge of", reading: "in CHAHRJ ov", meaning: "responsible for · รับผิดชอบ / ดูแล", category: "Phrase", example: "She's in charge of the budget." },
      { term: "task", reading: "TAHSK", meaning: "one piece of work to do · งาน (ชิ้นหนึ่ง)", category: "Noun" },
      { term: "report", reading: "ri-PORT", meaning: "a written account of work or results · รายงาน", category: "Noun", example: "The monthly report is ready." },
      { term: "budget", reading: "BUJ-it", meaning: "the money available for something · งบประมาณ", category: "Noun" },
      { term: "approve", reading: "a-PROOV", meaning: "to officially say yes to something · อนุมัติ", category: "Verb", example: "The manager approved the plan." },
      { term: "postpone", reading: "pohst-POHN", meaning: "to move something to a later time · เลื่อนออกไป", category: "Verb", example: "Can we postpone the meeting?" },
      { term: "on time", reading: "on TYM", meaning: "not late · ตรงเวลา", category: "Phrase" },
      { term: "as soon as possible", reading: "az SOON az POS-i-bul", meaning: "quickly, at the first chance (ASAP) · โดยเร็วที่สุด", category: "Phrase" },
      { term: "day off", reading: "DAY OF", meaning: "a day when you do not work · วันหยุด", category: "Noun", example: "I'm taking a day off on Monday." },
      { term: "overtime", reading: "OH-vur-tym", meaning: "extra hours worked beyond the normal day · ทำงานล่วงเวลา (โอที)", category: "Noun" },
      { term: "break", reading: "BRAYK", meaning: "a short rest from work · พัก", category: "Noun", example: "Let's take a ten-minute break." },
      { term: "client", reading: "KLY-ent", meaning: "a person or company you do work for · ลูกค้า", category: "Noun" },
      { term: "issue", reading: "ISH-oo", meaning: "a problem to deal with · ปัญหา / ประเด็น", category: "Noun", example: "There's an issue with the invoice." },
      { term: "solve", reading: "SOLV", meaning: "to find the answer to a problem · แก้ปัญหา", category: "Verb" },
      { term: "double-check", reading: "DUB-ul CHEK", meaning: "to check something a second time · ตรวจสอบอีกครั้ง", category: "Verb", example: "Please double-check the numbers." },
      { term: "Let me know", reading: "let mee NOH", meaning: "tell me (when you have the answer) · แจ้งให้ฉันทราบด้วย", category: "Expression", example: "Let me know if anything changes." },
    ],
  },
  {
    slug: "email-english",
    name: "Email English",
    language: "English",
    theme: "work",
    description:
      "Sixteen phrases that write most work emails — openings, requests, attachments, and the polite way to say no.",
    items: [
      { term: "I hope this email finds you well", reading: "eye HOHP this EE-mayl fyndz yoo WEL", meaning: "a polite opening line · หวังว่าคุณสบายดี (เปิดอีเมล)", category: "Expression" },
      { term: "I'm writing to", reading: "eyem RY-ting too", meaning: "stating why you are emailing · ฉันเขียนมาเพื่อ...", category: "Phrase", example: "I'm writing to confirm our meeting." },
      { term: "Please find attached", reading: "pleez fynd a-TACHT", meaning: "pointing at a file in the email · แนบไฟล์มาด้วย", category: "Expression", example: "Please find attached the invoice." },
      { term: "attachment", reading: "a-TACH-ment", meaning: "a file sent with an email · ไฟล์แนบ", category: "Noun" },
      { term: "Could you please", reading: "kood yoo PLEEZ", meaning: "a polite request · รบกวนช่วย...", category: "Phrase", example: "Could you please send the figures by Friday?" },
      { term: "Would it be possible to", reading: "wood it bee POS-i-bul too", meaning: "a very polite request · จะเป็นไปได้ไหมที่จะ...", category: "Phrase" },
      { term: "as discussed", reading: "az dis-KUST", meaning: "referring to an earlier conversation · ตามที่ได้คุยกันไว้", category: "Phrase", example: "As discussed, here is the updated plan." },
      { term: "Just a quick reminder", reading: "just a KWIK ri-MYN-dur", meaning: "a gentle way to remind someone · ขอเตือนสั้น ๆ", category: "Expression" },
      { term: "Thank you for your patience", reading: "THANGK yoo for yor PAY-shens", meaning: "said when something took a while · ขอบคุณที่รอ", category: "Expression" },
      { term: "I apologise for the delay", reading: "eye a-POL-o-jyz for the di-LAY", meaning: "saying sorry for being late · ขออภัยที่ล่าช้า", category: "Expression" },
      { term: "Unfortunately", reading: "un-FOR-chu-nat-lee", meaning: "the polite start of bad news · น่าเสียดายที่...", category: "Adverb", example: "Unfortunately, we can't make that date." },
      { term: "Looking forward to", reading: "LOOK-ing FOR-wurd too", meaning: "saying you are happy about a future thing · ตั้งตารอ", category: "Phrase", example: "Looking forward to hearing from you." },
      { term: "Please let me know", reading: "pleez let mee NOH", meaning: "asking for a reply · กรุณาแจ้งให้ทราบ", category: "Expression" },
      { term: "at your earliest convenience", reading: "at yor UR-lee-est kon-VEEN-yens", meaning: "as soon as it suits you (polite ASAP) · เมื่อสะดวกโดยเร็วที่สุด", category: "Phrase" },
      { term: "Kind regards", reading: "kynd ri-GAHRDZ", meaning: "a polite sign-off · ด้วยความนับถือ", category: "Expression" },
      { term: "Best", reading: "BEST", meaning: "a short friendly sign-off ('Best wishes') · (ลงท้ายอีเมลแบบเป็นกันเอง)", category: "Expression" },
    ],
  },
  {
    slug: "getting-around-english",
    name: "Getting around in English",
    language: "English",
    theme: "everyday",
    description:
      "Trains, taxis, directions, and the airport — enough to arrive somewhere new and ask the way back.",
    items: [
      { term: "How do I get to", reading: "how doo eye GET too", meaning: "asking for directions · ไป...ยังไง", category: "Phrase", example: "How do I get to the station?" },
      { term: "turn left", reading: "turn LEFT", meaning: "go to the left · เลี้ยวซ้าย", category: "Phrase" },
      { term: "turn right", reading: "turn RYT", meaning: "go to the right · เลี้ยวขวา", category: "Phrase" },
      { term: "straight ahead", reading: "strayt a-HED", meaning: "continue in the same direction · ตรงไป", category: "Phrase", example: "Go straight ahead for two blocks." },
      { term: "across from", reading: "a-KROS frum", meaning: "on the other side of the street from · ตรงข้ามกับ", category: "Phrase" },
      { term: "next to", reading: "NEKST too", meaning: "beside · ข้าง ๆ", category: "Phrase", example: "The bank is next to the pharmacy." },
      { term: "ticket", reading: "TIK-it", meaning: "the paper or card that lets you travel · ตั๋ว", category: "Noun" },
      { term: "platform", reading: "PLAT-form", meaning: "where you wait for a train · ชานชาลา", category: "Noun", example: "The train leaves from platform four." },
      { term: "return ticket", reading: "ri-TURN TIK-it", meaning: "a ticket there and back (US: round trip) · ตั๋วไป-กลับ", category: "Noun" },
      { term: "delayed", reading: "di-LAYD", meaning: "later than planned · ล่าช้า", category: "Adjective", example: "My flight is delayed by an hour." },
      { term: "gate", reading: "GAYT", meaning: "the door at the airport where you board · ประตูขึ้นเครื่อง", category: "Noun" },
      { term: "boarding pass", reading: "BOR-ding pahs", meaning: "the document that lets you onto the plane · บัตรขึ้นเครื่อง", category: "Noun" },
      { term: "luggage", reading: "LUG-ij", meaning: "the bags you travel with · กระเป๋าเดินทาง", category: "Noun" },
      { term: "taxi rank", reading: "TAK-see rangk", meaning: "where taxis wait for passengers (US: taxi stand) · จุดจอดแท็กซี่", category: "Noun" },
      { term: "How much is the fare?", reading: "how MUCH iz the FAIR", meaning: "asking the price of a journey · ค่าโดยสารเท่าไหร่", category: "Expression" },
      { term: "Drop me off here", reading: "DROP mee OF heer", meaning: "asking the driver to stop here · ส่งฉันตรงนี้", category: "Expression" },
      { term: "I'm lost", reading: "eyem LOST", meaning: "I don't know where I am · ฉันหลงทาง", category: "Expression" },
      { term: "Is it far?", reading: "iz it FAHR", meaning: "asking whether a place is a long way away · ไกลไหม", category: "Expression" },
    ],
  },
];
