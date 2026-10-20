import { chromium, firefox, webkit, selectors } from '@playwright/test';
import { config } from '../config/environment';
export async function createBrowser() {
  selectors.setTestIdAttribute('data-test');
  const launchOptions = {
    headless: config.headless,
    slowMo: config.headless ? 0 : config.slowMo,
  };
  if (config.browser === 'chrome') {
    return chromium.launch({ channel: 'chrome', ...launchOptions });
  }
  return { chromium, firefox, webkit }[config.browser].launch(launchOptions);
}
