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
  assert.match(card, /古着屋店主[\s\S]*directory-area[^>]*>下北沢[\s\S]*30分[\s\S]*15,000<span>円[\s\S]*usd-price[\s\S]*btc-price[\s\S]*最低60分[\s\S]*街歩き例/);
  assert.doesNotMatch(card, /instagram-preview-grid/);
});

test("preserves language and required LINE contact in the search request form", async () => {
  const html = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=60&budget=29999");
  assert.match(html, /<main lang="en"/);
  assert.match(html, /Preferred duration: 60 min/);
  assert.match(html, /required=""[^>]*name="lineContact"|name="lineContact"[^>]*required=""/);
  assert.match(html, /name="budget"[^>]*value="29999"/);
  assert.match(html, /href="\/\?lang=en#directory"/);
});

test("shows the one-hour, ¥9,900 minimum and offers no 30-minute request", async () => {
  const html = await render("/");
  const feeThumbnail = html.match(/<button[^>]*id="respect-fee-video"[^>]*>[\s\S]*?<\/button>/)?.[0];
  assert.ok(feeThumbnail);
  const feeIndex = html.indexOf(feeThumbnail);
  const requestOptionsIndex = html.indexOf('id="buddy-request-options"');
  const lineOptionIndex = html.indexOf('class="directory-line-finder"');
  const profilePositions = [...html.matchAll(/id="directory-card-[^"]+"/g)].map(match => match.index);
  const flowIndex = html.indexOf('id="how-it-works"');
  const publicBoardIndex = html.indexOf('id="public-board"');
  assert.ok(requestOptionsIndex >= 0 && flowIndex > requestOptionsIndex);
  const mainActions = html.slice(requestOptionsIndex, flowIndex);
  assert.match(mainActions, /href="#directory"[^>]*><strong>登録Buddyにオファーを出す/);
  assert.match(mainActions, /日時を決めて相方を募る/);
  assert.ok(feeIndex > flowIndex && feeIndex < publicBoardIndex);
  assert.match(html.slice(flowIndex, feeIndex), /class="buddy-usage-fee" hidden=""/);
  assert.equal(profilePositions.filter(position => position < lineOptionIndex).length, 6);
  assert.ok(profilePositions.some(position => position > lineOptionIndex));
  assert.equal((html.match(/class="directory-line-finder"/g) ?? []).length, 1);
  assert.match(feeThumbnail, /30分/);
  assert.match(feeThumbnail, /<strong>4,500円<\/strong>\s*<small>＋税から<\/small>.*最低60分（税込9,900円から）/);
  assert.match(feeThumbnail, /以降30分単位/);
  assert.match(html, /respect-fee-platform\.mp4/);
  assert.doesNotMatch(html, /<option[^>]*>30分<\/option>/);
  const fees = [...html.matchAll(/class="yen-amount">([\d,]+)<span>円/g)];
  assert.ok(fees.length > 0);
  const amounts = fees.map(([, amount]) => Number(amount.replaceAll(",", "")));
  assert.equal(Math.min(...amounts), 4500);
  for (const id of ["coco", "ikki-yokoji"]) {
    const card = html.split(`id="directory-card-${id}"`)[1]?.split("</article>")[0];
    assert.ok(card);
    assert.match(card, /4,500<span>円<\/span><small>（税抜）/);
    assert.match(card, /最低60分（税込9,900円）/);
  }
  assert.match(html, /<option>1時間30分<\/option>/);
  assert.match(html, /<option>2時間30分<\/option>/);
});

test("does not prefill an outdated 30-minute or below-minimum search budget", async () => {
  const oldDuration = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=30&budget=19999");
  const lowBudget = await render("/find-a-buddy?lang=en&area=Shimokitazawa&duration=60&budget=9899");
  assert.doesNotMatch(oldDuration, /Preferred duration:/);
  assert.doesNotMatch(lowBudget, /Preferred duration:/);
});

test("routes travel destinations to either listed Buddies or an area-prefilled request", async () => {
  const html = await render("/");
  const travel = html.split('id="travel-destinations"')[1]?.split("</section>")[0];
  assert.ok(travel);
  for (const region of ["日本", "アジア", "世界"]) assert.ok(travel.includes(region));
  assert.match(travel, /<button[^>]*aria-label="下北沢・高円寺 · 登録Buddyを見る"/);
  const requestUrl = "/find-a-buddy?area=" + encodeURIComponent("沖縄那覇");
  assert.ok(travel.includes(`href="${requestUrl}"`));
  assert.match(await render(requestUrl), /name="area"[^>]*value="沖縄那覇"/);
});
