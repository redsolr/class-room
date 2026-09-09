/**
 * THE SHIPPED LEARNING PATHS — the guided foundation, checked in like
 * the pack catalog and synced by `scripts/seed-paths.ts` (which also
 * runs on every deploy, right after the packs).
 *
 * A path is an ORDER, not a gate. Every step is open from the first day;
 * the path's whole job is to answer "what should I do first", which the
 * app previously could not answer at all. A learner who wants to jump to
 * the sentences is not doing it wrong — but if they never come back, the
 * path should still be pointing at the foundation they skipped, which is
 * why `nextStep` finds the first INCOMPLETE step rather than the one
 * after the last completed one.
 *
 * ── The three limbs ────────────────────────────────────────────────
 *
 * `/path` draws these as a skill tree with three branches, and the
 * branch a step lands on is DERIVED FROM ITS KIND (see
 * `lib/study-path-tree.ts`) rather than declared here:
 *
 *   pack        → VOCABULARY
 *   sentences   → GRAMMAR
 *   chat/lesson → CONVERSATION
 *
 * So authoring a path is authoring three limbs at once, and the thing to
 * watch when editing this file is BALANCE: a path with six pack steps
 * and one chat step draws as a lopsided tree, which is an accurate
 * picture of a curriculum that would leave someone unable to speak.
 *
 * Steps deliberately mix card work with human work for that reason. A
 * path that is only flashcards teaches someone to recognise words they
 * have never once said out loud, and every learner who has done that
 * knows the feeling of freezing in a real conversation.
 *
 * ── A tree is only as full as this file ────────────────────────────
 *
 * The tree draws one node per step, so DENSITY LIVES HERE, not in the
 * geometry. The first cut of the Japanese path was eleven steps, and the
 * tree drew eleven circles in a canvas built for a hundred: correct, and
 * empty. What fixed it was not smaller nodes — it was admitting that
 * "learn the everyday core" is not one piece of work. It is eight words,
 * and then a finished book, and those are two different days.
 *
 * Two rules keep that from becoming padding:
 *
 *   1. A step is a threshold someone can actually reach today, against
 *      content that actually ships. `seed-paths.ts` fails on a target
 *      bigger than its book, so a node that can never light up cannot
 *      reach production.
 *   2. Steps may SHARE a counter — "learn eight of this book" and
 *      "finish it" both count words known from one book — and the limb's
 *      headline groups by (kind, book) so one word is never counted
 *      twice. Stacking thresholds is honest here in a way it would not
 *      be if the hub simply added targets up.
 *
 * `packSlug` must match a slug in `study-packs.ts`, and `target` must be
 * reachable from that pack's own word count — `seed-paths.ts` fails
 * loudly on either rather than shipping a node that can never light up.
 */

export type PathStepContent = {
  kind: "pack" | "sentences" | "chat" | "lesson";
  title: string;
  detail: string;
  /** The official book this step is about (pack + sentences steps). */
  packSlug?: string;
  /**
   * What counts as done, in the step's own unit — words known for a
   * pack, cards known for sentences, messages for a chat, lessons
   * attended for a lesson. Completion is derived from that evidence.
   *
   * For pack and sentence steps this must be ≤ the pack's word count:
   * a target of 20 against a 15-word book is a node the learner can
   * never complete, which is worse than no node at all. The seed
   * enforces it.
   */
  target: number;
};

export type PathContent = {
  slug: string;
  name: string;
  language: string;
  description: string;
  steps: PathStepContent[];
};

export const STUDY_PATH_CATALOG: PathContent[] = [
  {
    slug: "japanese-foundation",
    name: "Japanese from zero",
    language: "Japanese",
    description:
      "The first year, in the order that actually works: a core of words you will meet constantly, the same words inside sentences, and someone to say them to — repeated across every book we ship until none of it is new.",
    steps: [
      {
        kind: "pack",
        title: "Learn the everyday core",
        detail:
          "Anime essentials is the fastest honest start — these are the words that appear in almost everything, so every one you learn pays off immediately. Eight of them is one sitting.",
        packSlug: "anime-essentials-japanese",
        target: 8,
      },
      {
        kind: "sentences",
        title: "Put those words in sentences",
        detail:
          "Recognising a word is not knowing it. Cloze cards ask whether you can still supply it when a sentence needs it — which is the thing that transfers to speaking.",
        packSlug: "anime-essentials-japanese",
        target: 6,
      },
      {
        kind: "chat",
        title: "Say something, badly",
        detail:
          "Five messages. The point is not to be understood well, it is to break the habit of waiting until you are ready — which for most people means never.",
        target: 5,
      },
      {
        kind: "pack",
        title: "Finish the core book",
        detail:
          "All fifteen, including the four you have been quietly skipping. A book you half-know is the one that fails you mid-sentence.",
        packSlug: "anime-essentials-japanese",
        target: 15,
      },
      {
        kind: "sentences",
        title: "The same book, under pressure",
        detail:
          "A second pass over the same words, in sentences you have not seen. Nothing new is taught here; what is tested is whether the first pass survived the week.",
        packSlug: "anime-essentials-japanese",
        target: 12,
      },
      {
        kind: "chat",
        title: "Keep going past the first reply",
        detail:
          "Fifteen messages is roughly where a conversation stops being a script you prepared and starts being one you did not.",
        target: 15,
      },
      {
        kind: "pack",
        title: "Widen into what you actually watch",
        detail:
          "Dragon Ball's vocabulary is the shonen baseline — fights, training, shouting at the sky. Ten words in and the subtitles start feeling optional.",
        packSlug: "dragon-ball-japanese",
        target: 10,
      },
      {
        kind: "sentences",
        title: "Put the new ones to work",
        detail:
          "Fresh words are the ones most likely to evaporate. Sentence cards while they are still fresh is what stops that.",
        packSlug: "dragon-ball-japanese",
        target: 8,
      },
      {
        kind: "lesson",
        title: "Take one lesson with a person",
        detail:
          "One hour with a human being who can hear what you are actually doing to the vowels. The tutor chat cannot hear you, and it never will.",
        target: 1,
      },
      {
        kind: "pack",
        title: "Finish Dragon Ball",
        detail:
          "All nineteen. The last few words in any book are the ones that keep turning up in the episodes you had to pause.",
        packSlug: "dragon-ball-japanese",
        target: 19,
      },
      {
        kind: "pack",
        title: "Start a second series",
        detail:
          "One Piece, and the first ten words. A second book is where you find out how much of the first one was the book and how much was you.",
        packSlug: "one-piece-japanese",
        target: 10,
      },
      {
        kind: "sentences",
        title: "Sentences from the second book",
        detail:
          "Same drill, new material. Interleaving two books beats finishing one and then starting the other, however much worse it feels while you are doing it.",
        packSlug: "one-piece-japanese",
        target: 8,
      },
      {
        kind: "chat",
        title: "A conversation with no English in it",
        detail:
          "Thirty messages, and tell the tutor to refuse to translate. Working around a word you do not have is a skill, and it is only trainable when the escape hatch is shut.",
        target: 30,
      },
      {
        kind: "pack",
        title: "Finish One Piece",
        detail:
          "All eighteen. Two finished books is the point where the third gets noticeably easier.",
        packSlug: "one-piece-japanese",
        target: 18,
      },
      {
        kind: "lesson",
        title: "Go back to the same tutor",
        detail:
          "The second lesson is worth more than the first: someone now knows what you did last time, and can ask whether you actually did it.",
        target: 2,
      },
      {
        kind: "pack",
        title: "Naruto: the shonen staples",
        detail:
          "Twelve words that Dragon Ball and One Piece both assumed you already had. This is the book that fills the gaps the other two left.",
        packSlug: "naruto-japanese",
        target: 12,
      },
      {
        kind: "sentences",
        title: "Drill the staples",
        detail:
          "Ten cards from the words you have just met. A word you can only produce in the book you met it in is not yours yet.",
        packSlug: "naruto-japanese",
        target: 10,
      },
      {
        kind: "chat",
        title: "Sixty messages in",
        detail:
          "Long enough that the tutor has seen your habits twice over. Ask it what you keep getting wrong — it has the history, and it will tell you.",
        target: 60,
      },
      {
        kind: "pack",
        title: "Finish Naruto",
        detail:
          "All twenty-one, the longest book so far. Finishing a long one is how you find out that the hard part was never the size.",
        packSlug: "naruto-japanese",
        target: 21,
      },
      {
        kind: "pack",
        title: "Something written for adults",
        detail:
          "Death Note's vocabulary is colder and more abstract than anything above it — the first book here where the words are ideas rather than actions.",
        packSlug: "death-note-japanese",
        target: 10,
      },
      {
        kind: "sentences",
        title: "Abstract words, in context",
        detail:
          "Abstract vocabulary is where cloze cards earn their place: you can recognise a word like it all day and still not be able to put it in a sentence.",
        packSlug: "death-note-japanese",
        target: 8,
      },
      {
        kind: "lesson",
        title: "Make the lessons a habit",
        detail:
          "Four lessons, not one. The first tells you where you are; it is the fourth that changes how you sound, because by then someone knows your habits well enough to interrupt them.",
        target: 4,
      },
      {
        kind: "pack",
        title: "Finish Death Note",
        detail:
          "All eighteen. Four finished books, and the language has stopped arriving one word at a time.",
        packSlug: "death-note-japanese",
        target: 18,
      },
      {
        kind: "sentences",
        title: "Go back and finish Dragon Ball's sentences",
        detail:
          "Sixteen cards from a book you finished months ago. Coming back to old material after a long gap is the single most useful thing on this path, and the least popular.",
        packSlug: "dragon-ball-japanese",
        target: 16,
      },
      {
        kind: "pack",
        title: "The words games actually use",
        detail:
          "Menus, saves, items, damage. Eight of these and a Japanese-language game stops being a wall of unreadable buttons.",
        packSlug: "gaming-japanese",
        target: 8,
      },
      {
        kind: "sentences",
        title: "Read the menu without guessing",
        detail:
          "Game text is short, repetitive and unforgiving — which makes it the best sentence practice there is, once you have the nouns.",
        packSlug: "gaming-japanese",
        target: 8,
      },
      {
        kind: "chat",
        title: "A hundred messages",
        detail:
          "The point at which most people stop translating in their head for short sentences. It is not a milestone anyone hands you; it is just what the counter says when it happens.",
        target: 100,
      },
      {
        kind: "pack",
        title: "Finish the gaming book",
        detail:
          "All fifteen. A small book with disproportionate payoff — you will meet these every time you open anything.",
        packSlug: "gaming-japanese",
        target: 15,
      },
      {
        kind: "pack",
        title: "Persona 5",
        detail:
          "Twelve words of school, social life and the everyday register the shonen books never needed. This is the closest the catalog gets to how people actually talk.",
        packSlug: "persona-5-japanese",
        target: 12,
      },
      {
        kind: "sentences",
        title: "Everyday register, produced",
        detail:
          "Ten cards. Casual speech is the hardest thing to produce from a book and the easiest to recognise, which is exactly the gap a cloze card measures.",
        packSlug: "persona-5-japanese",
        target: 10,
      },
      {
        kind: "lesson",
        title: "Two months of lessons",
        detail:
          "Eight lessons. Somewhere in here a tutor stops correcting your grammar and starts arguing with your opinions, which is the actual goal.",
        target: 8,
      },
      {
        kind: "pack",
        title: "Finish Persona 5",
        detail:
          "All eighteen. Six finished books; the seventh is the first one you could probably have written yourself.",
        packSlug: "persona-5-japanese",
        target: 18,
      },
      {
        kind: "sentences",
        title: "Naruto, every word in a sentence",
        detail:
          "Eighteen cards from a book you finished long ago. If these still land, the vocabulary has moved somewhere that does not need this path any more.",
        packSlug: "naruto-japanese",
        target: 18,
      },
      {
        kind: "pack",
        title: "The long book",
        detail:
          "Final Fantasy VII, all twenty-two — the biggest in the catalog, and deliberately last. By now a twenty-two word book is a week, not a season.",
        packSlug: "final-fantasy-vii-japanese",
        target: 22,
      },
      {
        kind: "sentences",
        title: "Sentences from the long book",
        detail:
          "Twelve cards to close it out: the last sentence work on the path, on the last book on the path.",
        packSlug: "final-fantasy-vii-japanese",
        target: 12,
      },
      {
        kind: "chat",
        title: "A hundred and sixty messages",
        detail:
          "Not a target so much as a description of someone who now uses the tutor the way people use a language — to say something, rather than to practise saying something.",
        target: 160,
      },
      {
        kind: "lesson",
        title: "A year of showing up",
        detail:
          "Twelve lessons. Nothing on this path matters as much as the fact that you were still here for the twelfth one.",
        target: 12,
      },
    ],
  },
  {
    slug: "french-foundation",
    name: "French from zero",
    language: "French",
    description:
      "Enough French to hold a short conversation in a café and understand the answer — built in the order a beginner can actually follow.",
    steps: [
      {
        kind: "pack",
        title: "Learn the café survival set",
        detail:
          "The phrases you need before you need anything else. Small, concrete, and immediately usable — which is what makes the first week stick.",
        packSlug: "cafe-french",
        target: 6,
      },
      {
        kind: "sentences",
        title: "Drill them in context",
        detail:
          "French word order and liaison are where beginners come apart. Cloze cards make you produce the word inside a real sentence instead of recognising it alone.",
        packSlug: "cafe-french",
        target: 5,
      },
      {
        kind: "chat",
        title: "Order something, in French",
        detail:
          "Tell the tutor to be the waiter and to refuse to switch to English. Five messages of this is worth an hour of review.",
        target: 5,
      },
      {
        kind: "pack",
        title: "Finish the book",
        detail:
          "Every word in Café survival French, not just the ones that came easily. A book you half-know is the one that fails you at the counter.",
        packSlug: "cafe-french",
        target: 12,
      },
      {
        kind: "sentences",
        title: "Every word you own, in a sentence",
        detail:
          "The second pass over the same book. Same words, and the only thing being tested is whether you can supply them under a little pressure.",
        packSlug: "cafe-french",
        target: 12,
      },
      {
        kind: "chat",
        title: "Keep going past the first exchange",
        detail:
          "The hard part of a real café is not the order, it is the reply you did not plan for. Thirty messages is roughly where that stops being alarming.",
        target: 30,
      },
      {
        kind: "lesson",
        title: "Say it to a person",
        detail:
          "Book a lesson and have the same conversation with a human being. The gap between the two is the thing you are actually training away.",
        target: 1,
      },
      {
        kind: "lesson",
        title: "Come back a second time",
        detail:
          "One lesson is a test; two is a habit forming. The second is where a tutor can hold you to what you said you would do.",
        target: 2,
      },
    ],
  },
  {
    slug: "english-foundation",
    name: "English from zero",
    language: "English",
    description:
      "English for the working day, in the order it gets used: the verbs under every sentence, then the first minute of a conversation, then the office, email, the café and the way home — each book learned, drilled in sentences, and said to a person.",
    steps: [
      {
        kind: "pack",
        title: "Learn the verbs you use every hour",
        detail:
          "Everyday English verbs is the fastest honest start: get, make, take, give, go — half of every sentence you will ever hear. Eight of them is one sitting.",
        packSlug: "everyday-english-verbs",
        target: 8,
      },
      {
        kind: "sentences",
        title: "Put those verbs in sentences",
        detail:
          "Recognising 'send' is not knowing it. Cloze cards ask whether you can still supply it when the sentence needs it — which is the thing that transfers to speaking.",
        packSlug: "everyday-english-verbs",
        target: 6,
      },
      {
        kind: "chat",
        title: "Say something, badly",
        detail:
          "Five messages to the tutor, in English, mistakes included. The point is to break the habit of waiting until you are ready — which for most people means never.",
        target: 5,
      },
      {
        kind: "pack",
        title: "Finish the verbs",
        detail:
          "All twenty-four, including the ones you keep skipping because they look easy. A verb you half-know is the one that fails you mid-sentence.",
        packSlug: "everyday-english-verbs",
        target: 24,
      },
      {
        kind: "sentences",
        title: "The same verbs, under pressure",
        detail:
          "A second pass over the same words in sentences you have not seen. Nothing new is taught; what is tested is whether the first pass survived the week.",
        packSlug: "everyday-english-verbs",
        target: 12,
      },
      {
        kind: "pack",
        title: "The first minute of any conversation",
        detail:
          "Small talk is where a colleague decides you are easy to talk to. Eight phrases cover the greeting, the weekend and the weather — which is most of it.",
        packSlug: "small-talk-english",
        target: 8,
      },
      {
        kind: "chat",
        title: "Keep going past the first reply",
        detail:
          "Ask the tutor to make small talk with you and not to let it end. Fifteen messages is roughly where a conversation stops being a script you prepared.",
        target: 15,
      },
      {
        kind: "sentences",
        title: "Small talk in sentences",
        detail:
          "The phrases you can produce on demand are the ones that will come out when someone actually asks about your weekend.",
        packSlug: "small-talk-english",
        target: 8,
      },
      {
        kind: "pack",
        title: "Finish small talk",
        detail:
          "All eighteen. The goodbye phrases matter as much as the greetings: a conversation you cannot end is one you will avoid starting.",
        packSlug: "small-talk-english",
        target: 18,
      },
      {
        kind: "lesson",
        title: "Say it to a person",
        detail:
          "Book a lesson and have the same small talk with a human being. The gap between the tutor and a person is the thing you are actually training away.",
        target: 1,
      },
      {
        kind: "pack",
        title: "Learn the words of your workday",
        detail:
          "Meeting, deadline, schedule, follow up — the ten words you already hear every day and answer in Thai. Learn them in English and the room gets quieter.",
        packSlug: "office-english",
        target: 10,
      },
      {
        kind: "sentences",
        title: "Office words in office sentences",
        detail:
          "'Can we postpone the meeting?' is a sentence you will need on a Tuesday afternoon with no warning. Eight cloze cards make sure it is there.",
        packSlug: "office-english",
        target: 8,
      },
      {
        kind: "chat",
        title: "Talk about your actual work",
        detail:
          "Tell the tutor what you did today, in English, every day for a while. Thirty messages is about two weeks of that, and by then it stops being practice.",
        target: 30,
      },
      {
        kind: "pack",
        title: "Finish the office book",
        detail:
          "All twenty-four, down to 'double-check' and 'let me know'. These are the words that make you sound like you belong in the meeting rather than just attending it.",
        packSlug: "office-english",
        target: 24,
      },
      {
        kind: "pack",
        title: "Write an email that sounds right",
        detail:
          "Eight phrases write most work emails. The opening, the request, the attachment and the sign-off are the same in almost every message you will ever send.",
        packSlug: "email-english",
        target: 8,
      },
      {
        kind: "sentences",
        title: "Email phrases in real emails",
        detail:
          "Cloze cards on the phrases you will type, not read. 'Please find ___' has one right answer and it should come without thinking.",
        packSlug: "email-english",
        target: 8,
      },
      {
        kind: "lesson",
        title: "Three lessons in",
        detail:
          "By the third lesson a tutor knows which sounds you avoid and which words you reach for in Thai. That is worth more than any book on this path.",
        target: 3,
      },
      {
        kind: "pack",
        title: "Order lunch in English",
        detail:
          "Ten phrases between the door and the bill. Small, concrete, and immediately usable on the next work trip — which is what makes them stick.",
        packSlug: "cafe-english",
        target: 10,
      },
      {
        kind: "chat",
        title: "Fifty messages",
        detail:
          "Tell the tutor to be the waiter, the colleague, the client — and to refuse to switch to Thai. Fifty messages of this is worth several hours of review.",
        target: 50,
      },
      {
        kind: "pack",
        title: "Finish the café book",
        detail:
          "Every word, including 'allergic' and 'receipt' — the ones you only need once, which is exactly when you cannot look them up.",
        packSlug: "cafe-english",
        target: 18,
      },
      {
        kind: "sentences",
        title: "Café phrases under pressure",
        detail:
          "The second pass over the café book. The waiter will not wait while you remember; the cards make sure you do not have to.",
        packSlug: "cafe-english",
        target: 10,
      },
      {
        kind: "pack",
        title: "Find your way, and the way back",
        detail:
          "Directions, tickets, the airport. The whole book: being lost is the one situation where half a vocabulary is no vocabulary at all.",
        packSlug: "getting-around-english",
        target: 18,
      },
      {
        kind: "chat",
        title: "Eighty messages",
        detail:
          "Not a target so much as a description of someone who now uses the tutor the way people use a language — to say something, rather than to practise saying something.",
        target: 80,
      },
      {
        kind: "lesson",
        title: "Six lessons",
        detail:
          "Six lessons is a habit. Nothing on this path matters as much as the fact that you were still here for the sixth one.",
        target: 6,
      },
    ],
  },
];
