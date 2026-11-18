import assert from "node:assert/strict";
import test from "node:test";
import { default as worker } from "../dist/server/index.js";

async function render(path) {
  const response = await worker.fetch(
    new Request("http://localhost" + path, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("shows a Buddy's area and yen rate before the walk example on the directory card", async () => {
  const html = await render("/");
  const card = html.split('id="directory-card-mimic-takara"')[1]?.split("</article>")[0];
  assert.ok(card);
  assert.match(card, /古着屋店主[\s\S]*directory-area[^>]*>下北沢[\s\S]*1時間[\s\S]*30,000<span>円[\s\S]*街歩き例/);
  assert.doesNotMatch(card, /instagram-preview-grid/);
});

test("preserves language and required LINE contact in the search request form", async () => {
  const html = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=60&budget=29999");
  assert.match(html, /<main lang="en"/);
  assert.match(html, /Preferred duration: 60 min \/ Budget: up to ¥29,999/);
  assert.match(html, /required=""[^>]*name="lineContact"|name="lineContact"[^>]*required=""/);
  assert.match(html, /href="\/\?lang=en#directory"/);
});

test("shows the one-hour, ¥6,050 minimum and offers no 30-minute request", async () => {
  const html = await render("/");
  assert.match(html, /1時間・5,500円＋税（税込6,050円）から/);
  assert.match(html, /30分換算 2,750円＋税/);
  assert.match(html, /respect-fee-platform\.mp4/);
  assert.doesNotMatch(html, /<option[^>]*>30分<\/option>/);
  const fees = [...html.matchAll(/class="yen-amount">([\d,]+)<span>円/g)];
  assert.ok(fees.length > 0);
  const amounts = fees.map(([, amount]) => Number(amount.replaceAll(",", "")));
  assert.equal(Math.min(...amounts), 6050);
});

test("does not prefill an outdated 30-minute or below-minimum search budget", async () => {
  const oldDuration = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=30&budget=19999");
  const lowBudget = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=60&budget=6049");
  assert.doesNotMatch(oldDuration, /Preferred duration:/);
  assert.doesNotMatch(lowBudget, /Preferred duration:/);
});
