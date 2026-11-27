// Full mock tests: every section page saves its result here, and pages/mock-tests.html reads it to
// show progress, "Resume" and the estimated band. Stored only on this device (localStorage).
(function () {
  const KEY = "englisity-mock-results-v1";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; } };
  const write = d => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  // Academic conversion tables (raw score out of 40 → band), as a guide only.
  const LISTENING = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
  const READING = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5], [0, 0]];
  const fromRaw = (table, s) => table.find(([min]) => s >= min)[1];
  const roundBand = v => Math.floor(v * 2 + 0.5) / 2;   // IELTS rounding: .25 up to .5, .75 up to the next band
  const SECTIONS = ["listening", "reading", "writing", "speaking"];
  window.EnglisityMock = {
    SECTIONS,
    all: read,
    get: test => read()[test] || {},
    save(test, section, data) {
      const d = read();
      d[test] = d[test] || {};
      d[test][section] = Object.assign({ at: Date.now() }, data);
      write(d);
      try { window.EnglisityTrack && window.EnglisityTrack.finish(data.score || 0, data.total || 0, "Full mock " + test + " " + section); } catch (e) {}
    },
    clear(test) { const d = read(); delete d[test]; write(d); },
    listeningBand: s => fromRaw(LISTENING, s),
    readingBand: s => fromRaw(READING, s),
    roundBand,
    // Overall band from the sections that have a band; partial = fewer than four.
    overall(test) {
      const r = read()[test] || {};
      const bands = SECTIONS.map(s => r[s] && typeof r[s].band === "number" ? r[s].band : null).filter(b => b !== null);
      if (!bands.length) return null;
      const mean = bands.reduce((a, b) => a + b, 0) / bands.length;
      return { band: roundBand(mean), count: bands.length, done: SECTIONS.filter(s => r[s]).length };
    }
  };
})();
