const { chromium } = require("playwright");
const OUT = "C:\\Users\\andik\\AppData\\Local\\Temp\\claude\\d--SmartOrange-vambud-site\\a934feb7-0225-4317-bf12-af5ad454c3a7\\scratchpad";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:5196/ready-apartments.html", { waitUntil: "networkidle" });
  await page.waitForSelector(".site-loader", { state: "detached", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // baseline: menu closed, tight crop around the hero title letters
  const rect = await page.evaluate(() => {
    const el = document.querySelector(".ready-hero__title");
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y) };
  });
  console.log("title rect:", rect);
  await page.screenshot({ path: `${OUT}/px-closed.png`, clip: { x: rect.x, y: rect.y, width: 220, height: 90 } });

  await page.click("[data-menu-button]");
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/px-open.png`, clip: { x: rect.x, y: rect.y, width: 220, height: 90 } });

  await browser.close();
})();
