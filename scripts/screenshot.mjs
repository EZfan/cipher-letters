/**
 * Screenshot generator — walks the game with a mocked API and captures
 * the shots used in the README.
 *
 * Usage:
 *   pnpm build                     (web bundle must exist)
 *   node scripts/screenshot.mjs    (writes to docs/images/)
 *
 * The mock serves the REAL shipped cases (imported from @cipher/shared),
 * with a short scripted interrogation so the dialog box is populated.
 */

import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SHIPPED_CASES } from '../packages/shared/dist/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs', 'images');
const BASE = 'http://127.0.0.1:4317';

// ---------------------------------------------------------------------
// Mock data — real cases, scripted conversation.
// ---------------------------------------------------------------------

async function surfaceText(caseId) {
  return fs.readFile(
    path.join(root, 'packages', 'shared', 'src', 'cases', 'text', `${caseId}.md`),
    'utf8',
  );
}

function publicCase(c) {
  return {
    id: c.id,
    title: c.title,
    author: c.author,
    genre: c.genre,
    year: c.year,
    setting: c.setting,
    tone: c.tone,
    synopsis: c.synopsis,
    characters: c.characters,
    ghost: {
      id: c.ghost.id,
      name: c.ghost.name,
      state: c.ghost.state,
      voice: c.ghost.voice,
    },
    difficulty: c.difficulty,
    estimatedPlayMinutes: c.estimatedPlayMinutes,
    tags: c.tags,
  };
}

const CASE = SHIPPED_CASES.find((c) => c.id === 'the-last-letter');

const scriptedTurns = (extra = []) => {
  const base = [
    {
      role: 'player',
      text: 'Where is Erich? When is he coming home?',
      timestamp: 1,
    },
    {
      role: 'ghost',
      text: 'He is on the road. Or — I tell myself he is on the road. The kettle sang at six, as it always does when the house is waiting.',
      disclosureLevel: 0.25,
      hintedClueIds: [],
      timestamp: 2,
    },
    {
      role: 'player',
      text: 'The blue envelope. You mention it three times. What is inside it?',
      timestamp: 3,
    },
    {
      role: 'ghost',
      text: 'The letter. It has always been the letter. I walk past the post box every morning, and every morning it stays in my pocket. It is lighter to carry than to send.',
      disclosureLevel: 0.5,
      hintedClueIds: ['C4'],
      timestamp: 4,
    },
  ];
  return [...base, ...extra];
};

function makeSession(turns) {
  return {
    id: 'shot-session-0000-0000',
    caseId: CASE.id,
    surfaceText: '', // filled async below
    conversation: turns,
    citedClueIds: ['C1', 'C4'],
    turnsSinceProgress: 0,
    hintsUsed: 0,
    startedAt: Date.now(),
    status: 'playing',
    case: publicCase(CASE),
  };
}

// ---------------------------------------------------------------------
// Server mocking + capture.
// ---------------------------------------------------------------------

async function mockApi(page, { extraTurns = [] } = {}) {
  const session = makeSession(scriptedTurns(extraTurns));
  session.surfaceText = await surfaceText(CASE.id);

  await page.route('**/api/**', (route) => {
    const url = new URL(route.request().url());
    const p = url.pathname;
    const method = route.request().method();

    if (p === '/api/llm/status') {
      return route.fulfill({ json: { configured: true, ok: true, latencyMs: 120 } });
    }
    if (p === '/api/cases') {
      return route.fulfill({
        json: {
          cases: SHIPPED_CASES.map((c) => ({
            id: c.id,
            title: c.title,
            genre: c.genre,
            difficulty: c.difficulty,
            estimatedPlayMinutes: c.estimatedPlayMinutes,
            tags: c.tags,
            synopsis: c.synopsis,
          })),
        },
      });
    }
    if (p === '/api/health') {
      return route.fulfill({ json: { ok: true, service: 'cipher-letters' } });
    }
    if (p === '/api/sessions' && method === 'POST') {
      return route.fulfill({ json: session });
    }
    if (p.endsWith('/turn') && method === 'POST') {
      return route.fulfill({ json: session });
    }
    if (p.endsWith('/accuse') && method === 'POST') {
      return route.fulfill({
        json: {
          verdict: 'solved',
          message:
            'You have assembled it. The envelope was the letter itself — written nightly, sealed, and never sent. The twenty-ninth was not an anniversary; it was the day the house went quiet.',
          fairPlayScore: 0.67,
          judgedBy: 'llm',
          metaReflection:
            'Grief sometimes makes a person write letters to the dead — and sometimes makes them write letters that pretend the dead are still alive. Both are ways of refusing to let the line of correspondence end.',
          truthRevealed: true,
          hiddenTruth:
            'Erich died three weeks ago. Marlene writes to him nightly as if he were still on the road. The blue envelope is her unsent letter; the twenty-ninth is the date of his death.',
          meta: null,
        },
      });
    }
    if (p.endsWith('/hint')) {
      return route.fulfill({
        json: { level: 1, message: 'In the section "Opening paragraph", notice the tense.' },
      });
    }
    return route.fulfill({ json: { ok: true } });
  });
}

async function newPage(browser, { extraTurns = [] } = {}) {
  const context = await browser.newContext({
    viewport: { width: 1360, height: 850 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await mockApi(page, { extraTurns });
  return { context, page };
}

async function shot(page, name) {
  // The page itself should always be at the top; inner scroll areas
  // (the conversation log) keep their own auto-scrolled position.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, name) });
  console.log('  ✓', name);
}

const run = async () => {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch();

  // ---- PIXEL theme ----------------------------------------------------
  const { context, page } = await newPage(browser, {
    extraTurns: [
      {
        role: 'player',
        text: 'Father Keller has called twice this month. What arrangements?',
        timestamp: 5,
      },
      {
        role: 'ghost',
        text: 'The hymns. He wants to know about the hymns. I told him I had not yet decided — it is the truth, if not the whole of it.',
        disclosureLevel: 0.62,
        hintedClueIds: ['C3'],
        timestamp: 6,
      },
    ],
  });

  console.log('capturing PIXEL theme…');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600); // let stars twinkle, transitions settle
  await shot(page, 'lobby-pixel.png');

  await page.click('button:has-text("The Last Letter")');
  await page.waitForTimeout(2200);
  await shot(page, 'reading-pixel.png');

  await page.click('text=▸ BEGIN INTERVIEW');
  await page.waitForTimeout(7000); // let the typewriter finish the last reply
  await shot(page, 'interrogation-pixel.png');

  await page.click('text=▸ SUBMIT ACCUSATION');
  await page.waitForTimeout(900);
  await page.fill('textarea', 'Erich is dead. The blue envelope is the unsent letter itself.');
  await page.click('text=▸ SUBMIT FOR JUDGEMENT');
  await page.waitForTimeout(2400);
  await shot(page, 'reveal-pixel.png');
  await context.close();

  // ---- PAPER theme ------------------------------------------------------
  const paperCtx = await browser.newContext({
    viewport: { width: 1360, height: 850 },
    deviceScaleFactor: 2,
  });
  const paperPage = await paperCtx.newPage();
  await mockApi(paperPage);
  await paperPage.addInitScript(() => {
    localStorage.setItem('cipher.theme', 'manuscript');
  });

  console.log('capturing PAPER theme…');
  await paperPage.goto(BASE, { waitUntil: 'networkidle' });
  await paperPage.waitForTimeout(2200);
  await shot(paperPage, 'lobby-paper.png');
  await paperCtx.close();

  await browser.close();
  console.log('done →', outDir);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
