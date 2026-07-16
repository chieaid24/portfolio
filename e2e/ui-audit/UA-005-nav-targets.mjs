// UA-005: header nav links need >=24px hit height on touch viewports.
import { withPage, assert, BASE } from "./_harness.mjs";

await withPage(async (page) => {
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(600);
  for (const name of ["home", "about", "projects", "resume"]) {
    const box = await page.locator("header nav").getByText(name, { exact: true }).boundingBox();
    assert(box && box.height >= 23.5, `nav "${name}": ${box ? box.height.toFixed(1) : "missing"}px height >= 24`);
  }
});
