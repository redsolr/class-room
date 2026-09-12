# Content sources — attribution and licences

These files are VENDORED copies of open datasets. `scripts/content/ingest.ts`
reads them and upserts the `content_*` tables, then builds the level books
and level paths from those tables. Re-download only to update; never edit a
vendored file by hand (fixes go in `overrides.json`, so they survive an update).

| File | What | Source | Licence | Attribution |
| --- | --- | --- | --- | --- |
| `jlpt-n5-vocab.csv`, `jlpt-n4-vocab.csv` | JLPT N5/N4 vocabulary (expression, reading, meaning) | https://github.com/jamsinclair/open-anki-jlpt-decks (`src/n5.csv`, `src/n4.csv`), derived from https://github.com/chyyran/jlpt-anki-decks, derived from Jonathan Waller's lists at http://www.tanos.co.uk/jlpt/ | Lists: **CC BY** (Jonathan Waller). Repository code: MIT | "JLPT vocabulary lists by Jonathan Waller (tanos.co.uk), CC BY" |
| `leeds-internet-jp-top20k.txt` | Japanese word frequency order (rank = line number), top 20,000 | https://github.com/hingston/japanese, from the University of Leeds internet corpus (`corpus.leeds.ac.uk/frqc/internet-jp.num`) | **CC BY 2.5** (Leeds) | "Frequency list from the Leeds Internet Corpus, Centre for Translation Studies, University of Leeds, CC BY 2.5" |
| `cefrj-vocabulary-profile-1.5.csv` | English vocabulary with CEFR-J levels (headword, pos, CEFR) | https://github.com/openlanguageprofiles/olp-en-cefrj | Free for research and commercial use **with citation** (Tono Laboratory, TUFS) | "The CEFR-J Wordlist Version 1.5, compiled by Yukio Tono, Tokyo University of Foreign Studies, http://www.cefr-j.org/download.html" |
| `cefrj-grammar-profile-20180315.csv` | English grammatical items with CEFR-J levels | same | same | "The CEFR-J Grammar Profile Version 20180315, Tono Laboratory, TUFS" |
| `ngsl-1.2-stats.csv` | English word frequency (NGSL 1.2, SFI rank) | https://www.newgeneralservicelist.com/new-general-service-list | **CC BY-SA 4.0** | "New General Service List by Browne, C., Culligan, B., and Phillips, J., CC BY-SA 4.0" |

**Not vendored yet** (next sessions): Tatoeba sentence pairs (CC BY 2.0 FR) for
level-graded example sentences and reading; KANJIDIC2 (CC BY-SA) for kanji.

**Authored here, not sourced**: `jlpt-grammar.json` — the N5/N4 grammar-point
inventory (the patterns themselves are a standard, uncopyrightable list; the
explanations and examples are ours and are marked `draft` until reviewed).
