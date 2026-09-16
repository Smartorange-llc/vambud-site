const { chromium } = require("playwright");
const OUT = "C:\\Users\\andik\\AppData\\Local\\Temp\\claude\\d--SmartOrange-vambud-site\\a934feb7-0225-4317-bf12-af5ad454c3a7\\scratchpad";

const pages = ["home", "ready-apartments", "about"];

(async () => {
  const browser = await chromium.launch();
  for (const name of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(`http://localhost:5196/${name}.html`, { waitUntil: "networkidle" });
    await page.waitForSelector(".site-loader", { state: "detached", timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    await page.click("[data-menu-button]");
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/cmp2-${name}.png`, clip: { x: 0, y: 0, width: 420, height: 500 } });
    console.log("done", name);
    await page.close();
  }
  await browser.close();
})();
