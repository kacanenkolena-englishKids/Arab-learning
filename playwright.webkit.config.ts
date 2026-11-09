import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  grep: /mobile layout/,
  use: {
    baseURL: "http://localhost:3000",
    ...devices["iPhone 13"],
    browserName: "webkit",
    launchOptions: {},
  },
});
