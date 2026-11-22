// gta6-meme-x-01 entry: "PC Waiting Room" queue ticket.
// Node 22, standard library only, no network calls.
//
// The meme itself is meme.png, and the judged post is the X post named by
// POST.json. The bounty harness runs this program and reads the judged post
// address from the output directory, so all this program does is copy the
// post file (and the meme image) from the bot directory into /output.
//
// Usage (local check):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const POST_FILE = 'POST.json';

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

const postSource = join(BOT_DIR, POST_FILE);
if (!existsSync(postSource)) {
  fail(`POST.json not found in bot dir: ${BOT_DIR}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyFileSync(postSource, join(OUTPUT_DIR, POST_FILE));

// The meme image ships in the repo too; copy it alongside POST.json so the
// program's output holds everything the entry is made of, not just the link.
const IMAGE_FILE = 'meme.png';
const imageSource = join(BOT_DIR, IMAGE_FILE);
if (!existsSync(imageSource)) {
  fail(`${IMAGE_FILE} not found in bot dir: ${BOT_DIR}`);
}
copyFileSync(imageSource, join(OUTPUT_DIR, IMAGE_FILE));

// The entry_link check on the site reads the `url` field of POST.json.
// Older POST.json files used `post` instead, so accept either spelling
// rather than failing on a field name (that exact mismatch rejected an
// earlier entry of ours in grading with exit 1).
const posted = JSON.parse(readFileSync(join(OUTPUT_DIR, POST_FILE), 'utf8')) as {
  post?: string;
  url?: string;
};
const postUrl = posted.url ?? posted.post;

// The gate only accepts a real public X post address, so reject anything
// else now, while the failure is still cheap and obvious, instead of
// letting a bad POST.json sail through and fail the submission later.
if (typeof postUrl !== 'string' || !/^https:\/\/x\.com\/[^/]+\/status\/\d+$/.test(postUrl)) {
  fail(`POST.json does not name a valid X post URL: ${postUrl ?? '(missing url/post field)'}`);
}

console.log(`Copied ${POST_FILE} and ${IMAGE_FILE} to ${OUTPUT_DIR}; post: ${postUrl}`);
