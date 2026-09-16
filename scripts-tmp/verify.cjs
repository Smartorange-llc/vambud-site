const { chromium } = require("playwright");
const OUT = "C:\\Users\\andik\\AppData\\Local\\Temp\\claude\\d--SmartOrange-vambud-site\\a934feb7-0225-4317-bf12-af5ad454c3a7\\scratchpad";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto("http://localhost:5196/ready-apartments.html", { waitUntil: "networkidle" });
  await page.waitForSelector(".site-loader", { state: "detached", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.click("[data-menu-button]");
  await page.waitForTimeout(900);

  const info = await page.evaluate(() => {
    const before = getComputedStyle(document.querySelector(".menu-overlay"), "::before");
    const panel = document.querySelector(".menu-panel");
    const watermark = document.querySelector(".menu-watermark");
    return {
      beforeBackdrop: before.backdropFilter || before.webkitBackdropFilter,
      panelBg: getComputedStyle(panel).backgroundColor,
      panelZ: getComputedStyle(panel).zIndex,
      watermarkOpacity: getComputedStyle(watermark).opacity,
      watermarkVisible: watermark.getBoundingClientRect().height > 0,
    };
  });
  console.log("info:", JSON.stringify(info));
  console.log("errors:", errors);
  await page.screenshot({ path: `${OUT}/regression-check-full.png` });
  // zoom on the blur strip + watermark bleed area
  await page.screenshot({ path: `${OUT}/regression-check-strip.png`, clip: { x: 0, y: 0, width: 420, height: 900 } });
  await page.screenshot({ path: `${OUT}/regression-check-watermark.png`, clip: { x: 400, y: 700, width: 700, height: 200 } });

  await browser.close();
})();
