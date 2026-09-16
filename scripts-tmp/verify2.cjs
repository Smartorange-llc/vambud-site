const { chromium } = require("playwright");
const OUT = "C:\\Users\\andik\\AppData\\Local\\Temp\\claude\\d--SmartOrange-vambud-site\\a934feb7-0225-4317-bf12-af5ad454c3a7\\scratchpad";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto("http://localhost:5196/ready-apartments.html", { waitUntil: "networkidle" });
  await page.waitForSelector(".site-loader", { state: "detached", timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const heroZ = await page.evaluate(() => getComputedStyle(document.querySelector(".ready-hero")).zIndex);
  console.log("ready-hero z-index now:", heroZ);

  await page.click("[data-menu-button]");
  await page.waitForTimeout(900);
  const state = await page.evaluate(() => {
    const overlay = document.querySelector(".menu-overlay");
    const before = getComputedStyle(overlay, "::before");
    return {
      overlayClass: overlay.className,
      beforeBackdrop: before.backdropFilter || before.webkitBackdropFilter,
    };
  });
  console.log("menu state:", JSON.stringify(state));
  await page.screenshot({ path: `${OUT}/v2-full.png` });
  await browser.close();
})();
