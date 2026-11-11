// Shared word lookup for reading tests (practice mode).
// - Finds the dictionary form of a word ("workers" → worker, "was" → be)
// - Uses the sentence to guess the part of speech and shows the matching
//   meaning first, with up to two more so the learner can choose
// - Prefers the passage's own glossary when a page provides one
// - Tells "no entry" apart from "no internet connection"
(() => {
  "use strict";
  const API = "https://api.dictionaryapi.dev/api/v2/entries/en/";
  const cache = new Map();      // form -> entries array | null (not found)
  let lastWordElement = null;

  // Remember which word was tapped so we can read its sentence.
  document.addEventListener("click", e => {
    const el = e.target && e.target.closest ? e.target.closest(".vocab-word") : null;
    if (el) lastWordElement = el;
  }, true);

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const IRREGULAR = {
    am: "be", is: "be", are: "be", was: "be", were: "be", been: "be", being: "be",
    has: "have", had: "have", having: "have", does: "do", did: "do", done: "do",
    went: "go", gone: "go", goes: "go", made: "make", took: "take", taken: "take", gave: "give", given: "give",
    came: "come", saw: "see", seen: "see", found: "find", thought: "think", brought: "bring", bought: "buy",
    built: "build", began: "begin", begun: "begin", became: "become", kept: "keep", left: "leave", felt: "feel",
    held: "hold", knew: "know", known: "know", led: "lead", meant: "mean", met: "meet", paid: "pay",
    ran: "run", said: "say", sent: "send", spent: "spend", stood: "stand", taught: "teach", told: "tell",
    understood: "understand", won: "win", wrote: "write", written: "write", grew: "grow", grown: "grow",
    fell: "fall", fallen: "fall", chose: "choose", chosen: "choose", drove: "drive", driven: "drive",
    ate: "eat", eaten: "eat", fought: "fight", caught: "catch", sought: "seek", lost: "lose", sold: "sell",
    rose: "rise", risen: "rise", spoke: "speak", spoken: "speak", wore: "wear", worn: "wear", drew: "draw",
    drawn: "draw", threw: "throw", thrown: "throw", flew: "fly", flown: "fly", shook: "shake", shaken: "shake",
    struck: "strike", stuck: "stick", swept: "sweep", slept: "sleep", fed: "feed", fled: "flee", bred: "breed",
    lay: "lie", lain: "lie", laid: "lay", dug: "dig", hung: "hang", hid: "hide", hidden: "hide", bore: "bear",
    borne: "bear", born: "bear", forgot: "forget", forgotten: "forget", froze: "freeze", frozen: "freeze",
    children: "child", people: "person", men: "man", women: "woman", feet: "foot", teeth: "tooth",
    mice: "mouse", geese: "goose", lives: "life", leaves: "leaf", wives: "wife", knives: "knife",
    halves: "half", selves: "self", wolves: "wolf", shelves: "shelf", thieves: "thief", phenomena: "phenomenon",
    criteria: "criterion", data: "datum", analyses: "analysis", crises: "crisis", bases: "basis",
    better: "good", best: "good", worse: "bad", worst: "bad", further: "far", farther: "far",
    an: "a", its: "it", their: "they", them: "they", his: "he", her: "she", him: "he", our: "we", us: "we"
  };
  const VOWEL = /[aeiou]/;
  const IRREG_NOUN = new Set("child person man woman foot tooth mouse goose life leaf wife knife half self wolf shelf thief phenomenon criterion datum analysis crisis basis".split(" "));
  const IRREG_ADJ = new Set("good bad far".split(" "));
  // Part of speech implied by the word's form, e.g. "went" is a verb, "children" a noun.
  function formHint(word) {
    const w = word.toLowerCase(), base = IRREGULAR[w];
    if (!base || base === "a" || /^(it|they|he|she|we)$/.test(base)) return "";
    return IRREG_NOUN.has(base) ? "noun" : IRREG_ADJ.has(base) ? "adjective" : "verb";
  }
  function pointerHint(def) {
    if (/plural/i.test(def)) return "noun";
    if (/past|participle|third-person|present/i.test(def)) return "verb";
    if (/comparative|superlative/i.test(def)) return "adjective";
    return "";
  }

  // Possible dictionary forms, most likely first (the word itself is tried first).
  function forms(raw) {
    let w = raw.toLowerCase().replace(/[’']s$/, "").replace(/[’']$/, "");
    const out = [];
    const add = f => { if (f && f.length > 1 && !out.includes(f)) out.push(f); };
    add(w);
    if (IRREGULAR[w]) add(IRREGULAR[w]);
    if (w.includes("-")) add(w.split("-").pop());
    const stem = (s, n) => s.slice(0, s.length - n);
    if (/ies$/.test(w)) add(stem(w, 3) + "y");
    if (/ied$/.test(w)) add(stem(w, 3) + "y");
    if (/(ches|shes|sses|xes|zes|oes)$/.test(w)) add(stem(w, 2));
    if (/s$/.test(w) && !/ss$/.test(w)) add(stem(w, 1));
    if (/ed$/.test(w)) {
      const b = stem(w, 2);
      if (/(.)\1$/.test(b) && !/(ll|ss|ff|zz)$/.test(b)) add(b.slice(0, -1));
      add(b + "e"); add(b); add(stem(w, 1));
    }
    if (/ing$/.test(w)) {
      const b = stem(w, 3);
      if (/(.)\1$/.test(b) && !/(ll|ss|ff|zz)$/.test(b)) add(b.slice(0, -1));
      add(b); add(b + "e");
    }
    if (/ier$|iest$/.test(w)) add(w.replace(/i(er|est)$/, "y"));
    if (/(er|est)$/.test(w) && VOWEL.test(stem(w, 3))) { const b = w.replace(/(er|est)$/, ""); add(b); add(b + "e"); }
    if (/ly$/.test(w) && w.length > 5) add(w.replace(/ily$/, "y").replace(/ly$/, ""));
    return out.slice(0, 6);
  }

  // Guess the part of speech from the neighbouring words.
  const DET = new Set("a an the this that these those my your his her its our their some many few several much more most each every another any no such of 's".split(" "));
  const VERB_BEFORE = new Set("to will would can could should must may might do does did not cannot often also never always i you we they he she it who which".split(" "));
  const ADJ_BEFORE = new Set("is are was were be been being become became becomes seem seems seemed very so too quite rather extremely really fairly less".split(" "));
  const LY_NOT_ADVERB = new Set("family only early daily likely unlikely fly reply supply apply july italy ally rely assembly holy silly friendly lovely lonely ugly elderly costly deadly weekly monthly yearly lively orderly monopoly anomaly".split(" "));
  function guessPOS(word, context) {
    const w = word.toLowerCase();
    const tokens = String(context || "").toLowerCase().match(/[\p{L}’'-]+/gu) || [];
    const i = tokens.findIndex(t => t === w || t.replace(/[’']s$/, "") === w);
    const prev = i > 0 ? tokens[i - 1] : "";
    if (/ly$/.test(w) && !LY_NOT_ADVERB.has(w)) return ["adverb", "adjective"];
    if (DET.has(prev)) return ["noun", "adjective"];
    if (ADJ_BEFORE.has(prev)) return /ing$|ed$/.test(w) ? ["verb", "adjective"] : ["adjective", "noun"];
    if (VERB_BEFORE.has(prev)) return ["verb", "noun"];
    if (/(ing|ed)$/.test(w)) return ["verb", "adjective", "noun"];
    if (/(tion|sion|ment|ness|ity|ism|ance|ence|ship|hood)s?$/.test(w)) return ["noun"];
    if (/(ous|ful|ive|able|ible|al|ic|less)$/.test(w)) return ["adjective"];
    if (/s$/.test(w)) return ["noun", "verb"];
    return [];
  }

  function sentenceAround(word) {
    const el = lastWordElement && lastWordElement.dataset && lastWordElement.dataset.word === word ? lastWordElement : null;
    const block = el ? el.closest("p, li, td, label, div") : null;
    const text = block ? block.innerText || block.textContent || "" : "";
    const sentences = text.split(/(?<=[.!?])\s+/);
    const re = new RegExp("(^|[^\\p{L}])" + word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^\\p{L}]|$)", "iu");
    return sentences.find(s => re.test(s)) || text.slice(0, 300);
  }

  // Dictionary lines that only point to another form, e.g. "plural of worker",
  // "first-person singular simple past indicative of be". Followed to the base word.
  const POINTER = /^[^.;]{0,80}?\b(?:plural|participle|simple past|past tense|singular|comparative|superlative|alternative (?:form|spelling)|obsolete (?:form|spelling)|archaic (?:form|spelling)|nonstandard (?:form|spelling)|misspelling|inflection)\b[^.;]*?\bof ([\p{L}-]+)\s*(?:\([^)]*\))?\.?$/iu;
  const OBSCURE = /^\(?\s*(obsolete|archaic|dialect|dialectal|rare|historical|slang|vulgar|nautical slang|uk dialect)\b/i;

  async function fetchEntries(form) {
    if (cache.has(form)) return cache.get(form);
    const res = await fetch(API + encodeURIComponent(form));
    if (res.status === 404) { cache.set(form, null); return null; }
    if (!res.ok) throw new Error("http " + res.status);
    const data = await res.json();
    const entries = Array.isArray(data) && data.length ? data : null;
    cache.set(form, entries);
    return entries;
  }

  function senses(entries) {
    const list = [];
    entries.forEach(e => (e.meanings || []).forEach(m => (m.definitions || []).forEach(d => {
      if (d && d.definition) list.push({ pos: (m.partOfSpeech || "").toLowerCase(), def: d.definition.trim(), example: d.example || "" });
    })));
    return list;
  }

  // Resolve a word to useful senses, following "plural of X" style pointers.
  async function resolve(word) {
    let networkFailed = false, triedAny = false, hint = formHint(word);
    const queue = forms(word), seen = new Set();
    while (queue.length) {
      const form = queue.shift();
      if (seen.has(form)) continue;
      seen.add(form);
      let entries;
      try { entries = await fetchEntries(form); triedAny = true; } catch (e) { networkFailed = true; break; }
      if (!entries) continue;
      const all = senses(entries);
      const real = all.filter(s => !POINTER.test(s.def));
      if (!real.length) {
        const pointer = all.find(s => POINTER.test(s.def));
        const target = pointer && pointer.def.match(POINTER)[1];
        if (target) { queue.unshift(target.toLowerCase()); hint = hint || pointerHint(pointer.def); }
        continue;
      }
      return { form, senses: real, hint };
    }
    return { form: null, senses: [], networkFailed: networkFailed && !triedAny ? true : networkFailed };
  }

  function choose(list, preferred) {
    const usable = list.filter(s => !OBSCURE.test(s.def));
    const pool = usable.length ? usable : list;
    const rank = s => { const i = preferred.indexOf(s.pos); return i === -1 ? preferred.length : i; };
    const sorted = pool.map((s, i) => ({ s, i })).sort((a, b) => rank(a.s) - rank(b.s) || a.i - b.i).map(x => x.s);
    const picked = [], perPos = {};
    for (const s of sorted) {
      perPos[s.pos] = (perPos[s.pos] || 0) + 1;
      if (perPos[s.pos] > 2) continue;
      picked.push(s);
      if (picked.length === 3) break;
    }
    return picked;
  }

  function place(popup, x, y) {
    popup.classList.add("show");
    const w = popup.offsetWidth || 320, h = popup.offsetHeight || 160;
    const left = Math.max(12, Math.min(innerWidth - w - 12, x));
    let top = y;
    if (top + h > innerHeight - 12) top = Math.max(12, innerHeight - h - 12);
    popup.style.left = left + "px";
    popup.style.top = top + "px";
  }

  const style = document.createElement("style");
  style.textContent = ".vocab-popup{max-height:min(60vh,420px);overflow:auto}.elk-pos{display:inline-block;margin:6px 0 2px;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#2f6b57}.elk-def{margin:0 0 4px}.elk-ex{margin:0 0 6px;color:#5d6b7c;font-style:italic;font-size:13px}.elk-note{margin:6px 0 0;color:#6b7a88;font-size:12px}.elk-base{color:#5d6b7c;font-size:13px;font-weight:600}.elk-local{margin:4px 0 8px;padding:8px 10px;border-radius:8px;background:#eef6f0}html[data-theme=\"dark\"] .elk-pos{color:#a7d9b7}html[data-theme=\"dark\"] .elk-local{background:#203a32}";
  document.head.append(style);

  async function show(popup, word, x, y, context, isCurrent, local) {
    if (!popup || !word) return;
    const current = typeof isCurrent === "function" ? isCurrent : () => true;
    const ctx = context || sentenceAround(word);
    const key = word.toLowerCase().replace(/[’']s$/, "");
    const heading = "<strong>" + esc(word) + "</strong>";
    const localDef = local && (local[key] || forms(word).map(f => local[f]).find(Boolean));
    popup.innerHTML = heading + (localDef ? "<p class='elk-local'><b>In this passage:</b> " + esc(localDef) + "</p>" : "") + "<span class='vocab-context-label'>Looking up meaning…</span>";
    place(popup, x, y);

    const result = await resolve(word);
    if (!current()) return;
    let html = heading;
    if (localDef) html += "<p class='elk-local'><b>In this passage:</b> " + esc(localDef) + "</p>";
    if (result.senses.length) {
      const base = result.form && result.form !== key ? " <span class='elk-base'>(from “" + esc(result.form) + "”)</span>" : "";
      if (base) html = html.replace("</strong>", "</strong>" + base);
      const guess = guessPOS(word, ctx);
      const preferred = result.hint ? [result.hint, ...guess.filter(p => p !== result.hint)] : guess;
      const picked = choose(result.senses, preferred);
      picked.forEach((s, i) => {
        html += "<span class='elk-pos'>" + esc(s.pos || "meaning") + "</span><p class='elk-def'>" + (picked.length > 1 ? (i + 1) + ". " : "") + esc(s.def) + "</p>" + (s.example ? "<p class='elk-ex'>“" + esc(s.example) + "”</p>" : "");
      });
      if (picked.length > 1) html += "<p class='elk-note'>Choose the meaning that fits the sentence.</p>";
    } else if (!localDef) {
      const capitalised = /^\p{Lu}/u.test(word) && !/^(I|A)$/.test(word);
      if (result.networkFailed) html += "<p class='elk-def'>Could not reach the dictionary. Check your internet connection and tap the word again.</p>";
      else if (capitalised) html += "<p class='elk-def'>This looks like a name (a person, place or organisation), so it may not be in the dictionary. Use the sentence around it to understand who or what it is.</p>";
      else html += "<p class='elk-def'>No dictionary entry was found for this word. Try to guess its meaning from the sentence.</p>";
    }
    popup.innerHTML = html;
    place(popup, x, y);
  }

  window.EnglisityLookup = { show, forms, guessPOS, _choose: choose, _resolve: resolve };
})();
