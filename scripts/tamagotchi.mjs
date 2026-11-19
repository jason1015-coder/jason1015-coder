#!/usr/bin/env node
// Renders tamagotchi.svg: a pet that hatches, grows and evolves with the total stars
// across every repo the owner wrote (forks excluded).
// Usage: node scripts/tamagotchi.mjs            (reads stars from the GitHub API)
//        TAMAGOTCHI_STARS=7 node scripts/tamagotchi.mjs   (offline preview)

import { readFileSync, writeFileSync } from "node:fs";

const OWNER = process.env.TAMAGOTCHI_OWNER ?? "jason1015-coder";
const OUT = "tamagotchi.svg";

const STAGES = [
  { at: 0, name: "EGG", blurb: "unhatched, waiting for its first star" },
  { at: 5, name: "HATCHLING", blurb: "just hatched, still wobbly" },
  { at: 15, name: "SPROUT", blurb: "growing fast, curious about everything" },
  { at: 40, name: "CHONK", blurb: "well fed and very pleased with itself" },
  { at: 100, name: "LEGEND", blurb: "crowned, glowing, insufferable about it" },
];

// Every star on any repo Jason wrote counts as food; forks of other people's work don't.
async function stars() {
  if (process.env.TAMAGOTCHI_STARS) return Number(process.env.TAMAGOTCHI_STARS);
  let total = 0;
  for (let page = 1; ; page++) {
    const res = await fetch(
      `https://api.github.com/users/${OWNER}/repos?per_page=100&type=owner&page=${page}`,
      {
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "stargotchi",
          ...(process.env.GITHUB_TOKEN
            ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
            : {}),
        },
      },
    );
    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
    const repos = await res.json();
    for (const repo of repos) {
      if (!repo.fork) total += repo.stargazers_count ?? 0;
    }
    if (repos.length < 100) break;
  }
  return total;
}

const BODY = "#7ee787";
const SHADE = "#3fb950";
const DARK = "#0d1117";
const GOLD = "#f2cc60";

function star(cx, cy, outer = 9, inner = 4.2, fill = GOLD) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function eyes(dx = 9, y = -4, r = 3.2) {
  return `<g class="eyes">
      <circle cx="${-dx}" cy="${y}" r="${r}" fill="${DARK}"/>
      <circle cx="${dx}" cy="${y}" r="${r}" fill="${DARK}"/>
    </g>`;
}

function pet(stage) {
  switch (stage) {
    case 0:
      return `<g transform="translate(108,80)">
        <path d="M0,-40 C23,-40 31,-12 31,7 C31,27 17,39 0,39 C-17,39 -31,27 -31,7 C-31,-12 -23,-40 0,-40 Z"
              fill="#e6edf3" stroke="#c9d1d9" stroke-width="2"/>
        <path d="M-15,-6 l11,9 l-9,7 l12,8" fill="none" stroke="#9aa4af" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M-9,22 q9,5 18,0" fill="none" stroke="#c9d1d9" stroke-width="2" stroke-linecap="round" opacity=".7"/>
      </g>`;
    case 1:
      return `<g transform="translate(108,82)">
        <path d="M16,-20 l14,-9 l-3,17" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-16,-20 l-14,-9 l3,17" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="0" cy="2" rx="27" ry="25" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        ${eyes(9, -4, 3.4)}
        <path d="M-7,10 q7,7 14,0" fill="none" stroke="${DARK}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="-14" cy="26" rx="9" ry="5" fill="${SHADE}"/>
        <ellipse cx="14" cy="26" rx="9" ry="5" fill="${SHADE}"/>
      </g>`;
    case 2:
      return `<g transform="translate(108,80)">
        <path d="M20,-24 l16,-8 l-4,18" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-20,-24 l-16,-8 l4,18" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <ellipse cx="0" cy="2" rx="31" ry="27" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        <ellipse cx="-18" cy="8" rx="5" ry="3.5" fill="#f778ba" opacity=".55"/>
        <ellipse cx="18" cy="8" rx="5" ry="3.5" fill="#f778ba" opacity=".55"/>
        ${eyes(10, -4, 3.6)}
        <path d="M-8,10 q8,9 16,0" fill="none" stroke="${DARK}" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="-16" cy="28" rx="10" ry="5" fill="${SHADE}"/>
        <ellipse cx="16" cy="28" rx="10" ry="5" fill="${SHADE}"/>
      </g>`;
    case 3:
      return `<g transform="translate(108,78)">
        <path d="M24,-26 l14,-12 l-2,20" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-24,-26 l-14,-12 l2,20" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M33,4 q16,-6 12,10 q-3,9 -12,4" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        <ellipse cx="0" cy="2" rx="36" ry="29" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        <ellipse cx="-21" cy="10" rx="6" ry="4" fill="#f778ba" opacity=".55"/>
        <ellipse cx="21" cy="10" rx="6" ry="4" fill="#f778ba" opacity=".55"/>
        ${eyes(11, -5, 4)}
        <circle cx="-8" cy="-7" r="1.2" fill="#e6edf3"/>
        <circle cx="14" cy="-7" r="1.2" fill="#e6edf3"/>
        <path d="M-9,11 q9,10 18,0" fill="none" stroke="${DARK}" stroke-width="2.8" stroke-linecap="round"/>
        <ellipse cx="-18" cy="30" rx="11" ry="5.5" fill="${SHADE}"/>
        <ellipse cx="18" cy="30" rx="11" ry="5.5" fill="${SHADE}"/>
      </g>`;
    default:
      return `<g transform="translate(108,78)">
        <ellipse cx="0" cy="6" rx="46" ry="38" fill="none" stroke="${GOLD}" stroke-width="1.5" opacity=".35"/>
        <path d="M25,-27 l15,-13 l-2,21" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M-25,-27 l-15,-13 l2,21" fill="${SHADE}" stroke="${SHADE}" stroke-width="2" stroke-linejoin="round"/>
        <path d="M35,4 q17,-6 13,10 q-3,10 -13,5" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        <ellipse cx="0" cy="2" rx="37" ry="30" fill="${BODY}" stroke="${SHADE}" stroke-width="2"/>
        <ellipse cx="-22" cy="10" rx="6" ry="4" fill="#f778ba" opacity=".6"/>
        <ellipse cx="22" cy="10" rx="6" ry="4" fill="#f778ba" opacity=".6"/>
        ${eyes(11, -5, 4)}
        <circle cx="-8" cy="-7" r="1.2" fill="#e6edf3"/>
        <circle cx="14" cy="-7" r="1.2" fill="#e6edf3"/>
        <path d="M-10,11 q10,11 20,0" fill="none" stroke="${DARK}" stroke-width="2.8" stroke-linecap="round"/>
        <ellipse cx="-18" cy="31" rx="11" ry="5.5" fill="${SHADE}"/>
        <ellipse cx="18" cy="31" rx="11" ry="5.5" fill="${SHADE}"/>
        <path d="M-17,-29 l6,-19 l11,12 l11,-12 l6,19 Z" fill="${GOLD}" stroke="#b7791f" stroke-width="1.5" stroke-linejoin="round"/>
        ${star(-44, -18, 6, 2.6, GOLD)}
        ${star(46, -22, 4.5, 2, GOLD)}
        ${star(38, 26, 3.5, 1.6, GOLD)}
      </g>`;
  }
}

function render(count) {
  const stage = STAGES.reduce((s, cur) => (count >= cur.at ? cur : s), STAGES[0]);
  const index = STAGES.indexOf(stage);
  const next = STAGES[index + 1];
  // Each stage fills as its own stars arrive, so the bar always shows local progress.
  const fed = next ? Math.min(1, Math.max(0, (count - stage.at) / (next.at - stage.at))) : 1;
  const barWidth = Math.round(228 * fed);
  const hint = next
    ? `${next.at - count} more to reach ${next.name.toLowerCase()}`
    : "fully grown, still hungry";
  const title = `Star Tamagotchi: ${stage.name.toLowerCase()} (${count} star${count === 1 ? "" : "s"} across ${OWNER}'s repos)`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="220" viewBox="0 0 520 220" role="img" aria-labelledby="ttl dsc">
  <title id="ttl">${title}</title>
  <desc id="dsc">A pixel pet, currently a ${stage.name.toLowerCase()} — ${stage.blurb}. It grows as any of ${OWNER}'s repos gains stars.</desc>
  <style>
    text { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .eyes { animation: blink 4.6s infinite; }
    .eyes circle { transform-box: fill-box; transform-origin: center; animation: lid 4.6s infinite; }
    .pet  { animation: bob 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes blink { 0%,92%,100% { opacity: 1 } 96% { opacity: .15 } }
    @keyframes lid   { 0%,92%,100% { transform: scaleY(1) } 96% { transform: scaleY(.15) } }
    @keyframes bob   { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
  </style>

  <rect x="1" y="1" width="518" height="218" rx="20" fill="${DARK}" stroke="#30363d" stroke-width="2"/>

  <!-- device -->
  <rect x="12" y="12" width="248" height="196" rx="20" fill="#161b22" stroke="#30363d" stroke-width="2"/>
  <rect x="28" y="28" width="216" height="150" rx="10" fill="#0f1a13" stroke="#26352b" stroke-width="1.5"/>
  <g opacity=".14" stroke="#2ea043" stroke-width=".6">
    ${[...Array(9)].map((_, i) => `<line x1="28" y1="${28 + (i + 1) * 15}" x2="244" y2="${28 + (i + 1) * 15}"/>`).join("")}
    ${[...Array(13)].map((_, i) => `<line x1="${28 + (i + 1) * 15.4}" y1="28" x2="${28 + (i + 1) * 15.4}" y2="178"/>`).join("")}
  </g>
  <g class="pet">${pet(index)}</g>
  <g fill="#30363d">
    <rect x="38" y="190" width="34" height="8" rx="4"/>
    <rect x="52" y="176" width="8" height="34" rx="4"/>
    <circle cx="196" cy="194" r="8"/>
    <circle cx="220" cy="194" r="8" fill="#3fb950"/>
  </g>

  <!-- readout -->
  <text x="280" y="42" fill="#8b949e" font-size="11" letter-spacing="2.4">STAR TAMAGOTCHI</text>
  <text x="280" y="78" fill="#e6edf3" font-size="26" font-weight="700" letter-spacing="1">${stage.name}</text>
  ${star(291, 104, 10, 4.6)}
  <text x="308" y="113" fill="${GOLD}" font-size="22" font-weight="700">${count}</text>
  <text x="280" y="136" fill="#8b949e" font-size="11">growth</text>
  <rect x="280" y="142" width="228" height="12" rx="6" fill="#21262d"/>
  ${barWidth > 0 ? `<rect x="280" y="142" width="${barWidth}" height="12" rx="6" fill="${BODY}"/>` : ""}
  ${star(287, 172, 6, 2.7, "#6e7681")}
  <text x="302" y="176" fill="#8b949e" font-size="11">${hint}</text>
  <text x="280" y="196" fill="#6e7681" font-size="10">any repo · each star feeds it</text>
</svg>
`;
}

let count;
try {
  count = await stars();
} catch (err) {
  // Keep the last committed card instead of wiping it out during a bad API day.
  try {
    readFileSync(OUT);
    console.warn(`Could not read stars (${err.message}); leaving ${OUT} untouched.`);
    process.exit(0);
  } catch {
    throw err;
  }
}

writeFileSync(OUT, render(count));
console.log(`Rendered ${OUT} for ${count} star${count === 1 ? "" : "s"}.`);
