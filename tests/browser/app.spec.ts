import { test, expect } from "@playwright/test";
test("onboarding, quiz and persisted completion", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Начать обучение", exact: true })
    .click();
  await page.getByRole("button", { name: "Я совсем не знаю арабский" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Добро пожаловать в саудовский арабский",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Тест", exact: true }).click();
  for (const answer of [
    "Рад вас видеть!",
    "Мир вам / здравствуйте",
    "И вам мир",
    "Здравствуйте",
    "Спасибо",
  ]) {
    await page.getByRole("button", { name: answer, exact: true }).click();
    await page
      .getByRole("button", { name: /Следующий вопрос|Результат/, exact: true })
      .click();
  }
  await expect(page.getByText("Правильных ответов: 5 из 5.")).toBeVisible();
  await page.reload();
  await expect(page.getByText("1 / 12", { exact: true })).toBeVisible();
});
test("audio fallback and branching coffee trainer", async ({ page }) => {
  await page.addInitScript(() => {
    window.speechSynthesis.getVoices = () => [];
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Прослушать هلا والله", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Арабский голос не установлен",
  );
  await page
    .getByRole("button", { name: "Разговорный тренажёр", exact: true })
    .click();
  await page
    .getByRole("button", { name: "أبي شاي، لو سمحت", exact: true })
    .click();
  await expect(
    page.getByText("تبي الشاي بسكر؟", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "بدون سكر، لو سمحت", exact: true })
    .click();
  await page.getByRole("button", { name: "لا، شكرا", exact: true }).click();
  await page.getByRole("button", { name: "تفضل، شكرا", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Заказ готов!" }),
  ).toBeVisible();
});
test("vocabulary favorites and review storage", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Словарь", exact: true }).click();
  await page
    .getByRole("button", { name: "Добавить в избранное" })
    .first()
    .click();
  await page.getByRole("button", { name: "Избранное", exact: true }).click();
  await expect(page.locator(".vocab-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Добавить в повторение" }).click();
  await page.reload();
  await expect(page.getByText("1", { exact: true }).first()).toBeVisible();
  const p = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("riyadh-progress-v1")!),
  );
  expect(p.favorites).toHaveLength(1);
  expect(Object.keys(p.reviews)).toHaveLength(1);
});
test("dialogue controls and all navigation routes render", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Диалоги", exact: true }).click();
  await page.getByRole("button", { name: "Скрыть перевод" }).click();
  await expect(
    page.getByText("Я хочу кофе без сахара, пожалуйста", { exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "По ролям", exact: true }).click();
  await page
    .getByRole("button", { name: "Ответьте вслух, затем откройте реплику" })
    .first()
    .click();
  for (const label of [
    "Арабский алфавит",
    "Грамматика",
    "Повторение",
    "Произношение",
    "Программа курса",
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator("main h1")).toBeVisible();
  }
});
test("mobile layout, RTL and locally supplied font", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Начни говорить по-арабски в Эр-Рияде" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole("button", { name: "Открыть меню" }).click();
  await page
    .getByRole("button", { name: "Арабский алфавит", exact: true })
    .click();
  await expect(page.locator(".alphabet-grid")).toHaveAttribute("dir", "rtl");
  await expect(page.locator("bdi").first()).toHaveAttribute("dir", "rtl");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(() => document.fonts.check('24px "Noto Naskh Arabic"')),
  ).toBeTruthy();
  await page.screenshot({ path: "/tmp/riyadh-mobile.png", fullPage: true });
});

test("topic exercises reject mistakes, match pairs and construct a sentence", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Программа курса", exact: true })
    .click();
  await page.locator(".lesson-card").nth(7).click();
  await page.getByRole("button", { name: "Практика", exact: true }).click();
  await page.getByRole("button", { name: "Найдите пару", exact: true }).click();
  await page
    .locator(".matching-grid>div")
    .first()
    .getByRole("button")
    .first()
    .click();
  await page
    .locator(".matching-grid>div")
    .nth(1)
    .getByRole("button", { name: "Я хочу кофе", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveText("Верная пара!");
  await page.getByRole("button", { name: "Пропуск", exact: true }).click();
  await page.getByRole("textbox", { name: "Ваш ответ" }).fill("موية");
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Попробуйте ещё раз");
  await page.getByRole("button", { name: "Ещё раз", exact: true }).click();
  await page.getByRole("textbox", { name: "Ваш ответ" }).fill("سكر");
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Верно!");
  await page
    .getByRole("button", { name: "Соберите фразу", exact: true })
    .click();
  for (const token of ["أبي", "قهوة", "بدون", "سكر"])
    await page.getByRole("button", { name: token, exact: true }).click();
  await page.getByRole("button", { name: "Проверить порядок" }).click();
  await expect(page.getByRole("status")).toContainText("Верно!");
});
test("review rating schedules next session and persists it", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "riyadh-progress-v1",
      JSON.stringify({
        completed: [],
        favorites: [],
        reviews: { w0: { interval: 0, due: 0, reps: 0 } },
        mistakes: [],
        daily: {},
        started: true,
      }),
    ),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: /^Повторение/ })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Показать ответ", exact: true })
    .click();
  await page.getByRole("button", { name: "Помню", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "На сегодня всё!" }),
  ).toBeVisible();
  const data = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("riyadh-progress-v1")!),
  );
  expect(data.reviews.w0.interval).toBe(2);
  expect(data.reviews.w0.due).toBeGreaterThan(Date.now());
});
test("microphone denial has a usable manual fallback", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, "getUserMedia", {
      value: () =>
        Promise.reject(new DOMException("Denied", "NotAllowedError")),
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Произношение", exact: true }).click();
  await page
    .getByRole("button", { name: "Записать свой голос", exact: true })
    .click();
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Нет доступа к микрофону",
  );
  await expect(page.getByText(/Ручная практика:/)).toBeVisible();
});
