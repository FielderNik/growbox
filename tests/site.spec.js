const { expect, test } = require("@playwright/test");

test("главная страница открывается и ключевые блоки видны", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Growbox/);
  await expect(page.getByRole("heading", { name: /Проект растет/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Короткий журнал проекта" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "План и список закупок вынесены отдельно." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Место для реальных снимков" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ближайший практический шаг" })).toBeVisible();
});

for (const path of ["/", "/plan.html", "/equipment.html"]) {
  test(`${path} не запрашивает отсутствующие ресурсы`, async ({ page }) => {
    const failedUrls = [];

    page.on("response", (response) => {
      if (response.status() >= 400) {
        failedUrls.push(`${response.status()} ${response.url()}`);
      }
    });

    await page.goto(path);
    await page.waitForLoadState("networkidle");

    expect(failedUrls).toEqual([]);
  });
}

test("страницы документов открываются", async ({ page }) => {
  await page.goto("/plan.html");
  await expect(page.getByRole("heading", { name: "План реализации умной теплицы" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ktor backend" })).toBeVisible();

  await page.goto("/equipment.html");
  await expect(page.getByRole("heading", { name: "Список оборудования по этапам" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Корзина A: MVP" })).toBeVisible();
});

test("главная страница не запрашивает отсутствующие ресурсы", async ({ page }) => {
  const failedUrls = [];

  page.on("response", (response) => {
    if (response.status() >= 400) {
      failedUrls.push(`${response.status()} ${response.url()}`);
    }
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  expect(failedUrls).toEqual([]);
});

test("страница помещается по ширине без горизонтального скролла", async ({ page }) => {
  await page.goto("/");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);

  expect(overflow).toBe(false);
});

test("визуальный снимок страницы", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.screenshot({
    path: `test-results/${testInfo.project.name}-home.png`,
    fullPage: true
  });
});
