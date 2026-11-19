// store.js — saved progress in localStorage, plus export / import.
// Progress is a set of earned trophy ids, stored as JSON under one key.
// ?seed=1 in the URL seeds 13 earned trophies for demo screenshots only.
export const STORAGE_KEY = 'leonida-case-file-progress-v1';

// Demo seeding: 13 trophies shown earned so screenshots show real progress.
// These are the opening story beats and a few early activities — the natural
// first 13 a player earns. Only applied when the URL carries ?seed=1 and no
// saved progress exists yet.
export const SEED_IDS = [2, 3, 8, 16, 20, 21, 33, 37, 44, 45, 46, 51, 55];

export function readSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => Number.isInteger(id)));
  } catch {
    return new Set();
  }
}

export function saveEarned(earnedSet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedSet].sort((a, b) => a - b)));
}

export function seedIfRequested() {
  const params = new URLSearchParams(location.search);
  if (params.get('seed') !== '1') return readSaved();
  const saved = readSaved();
  if (saved.size > 0) return saved;
  const seeded = new Set(SEED_IDS);
  saveEarned(seeded);
  return seeded;
}

export function exportProgress(earnedSet) {
  const payload = {
    app: 'Leonida Case File — GTA VI trophy tracker',
    exportedAt: new Date().toISOString(),
    earned: [...earnedSet].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-case-file-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedFile(text) {
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('Not a progress file: expected a list of earned trophy ids.');
  const valid = ids.filter((id) => Number.isInteger(id));
  if (valid.length === 0) throw new Error('No valid trophy ids found in that file.');
  return new Set(valid);
}
