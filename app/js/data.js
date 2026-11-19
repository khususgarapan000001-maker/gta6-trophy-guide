// data.js — loads the official trophy list and holds the roadmap stages.
// The trophies themselves live in ../data/trophies.json: 55 official trophies
// with names, descriptions and grades as PlayStation publishes them, plus our
// own cited guides. Nothing here is fetched from the network.
export const DATA_URL = '../data/trophies.json';

export const GRADES = ['platinum', 'gold', 'silver', 'bronze'];
export const KINDS = ['story', 'missable', 'collectibles', 'activities', 'online'];

// The four stages of the road to platinum, built from the official descriptions.
export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Play the story first',
    desc: 'Chapters 1–4 plus the final mission. Tick every missable story trophy as you pass it — a chapter or mission trophy can only be earned while its chapter or mission is running.',
    trophies: (t) => t.stage === 1,
  },
  {
    n: 2,
    title: 'Character missions & strangers',
    desc: 'Finish the final missions for Andy, Kenton, Billy, Randy and Tyrone, and complete 8 stranger strands across Leonida. Knock out the partner and robbery activities that need a partner while you are out in the world.',
    trophies: (t) => t.stage === 2,
  },
  {
    n: 3,
    title: 'Collectibles & exploration',
    desc: '100 vehicles, 100 WAiNK It locations, 3 card sets, all 52 areas of Leonida, 18 meditation spots and the unique animal for Bret. Slow, thorough roaming — nothing here is missable.',
    trophies: (t) => t.stage === 3,
  },
  {
    n: 4,
    title: 'Grind & cleanup',
    desc: '250 stunts, 50 challenges, gold in all 42 Shooting Range challenges, drone races at all 14 locations, 5 bank vaults, $250,000 laundered, $100,000 spent, all 8 garages — then 100% completion for the gold, and the platinum pops.',
    trophies: (t) => t.stage === 4,
  },
];

let cache = null;

export async function loadTrophies() {
  if (cache) return cache;
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error('Could not load ' + DATA_URL);
  const data = await res.json();
  cache = data.trophies;
  return cache;
}

export function missableTrophies(trophies) {
  return trophies.filter((t) => t.missable);
}

export function gradeCounts(trophies) {
  const out = {};
  for (const g of GRADES) out[g] = trophies.filter((t) => t.grade === g).length;
  return out;
}
