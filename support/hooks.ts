import { Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { TestWorld } from './world';
import { createBrowser } from './browserFactory';
import { config } from '../config/environment';
import { log } from './logger';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
setDefaultTimeout(120000);
Before(async function(this: TestWorld, { pickle }) {
  log(`START: ${pickle.name}`);
  this.browser = await createBrowser();
  this.context = await this.browser.newContext({ baseURL: config.baseURL });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(config.actionTimeout);
  this.page.setDefaultNavigationTimeout(config.navigationTimeout);
  this.login = new LoginPage(this.page);
  this.products = new ProductsPage(this.page);
  this.cart = new CartPage(this.page);
  this.checkout = new CheckoutPage(this.page);
});
After(async function(this: TestWorld, { pickle, result }) {
  try {
    if (result?.status === Status.FAILED && this.page && !this.page.isClosed()) {
      try { await this.attach(await this.page.screenshot({ fullPage: true }), 'image/png'); }
      catch { log('Screenshot unavailable; original scenario failure retained.'); }
    }
  } finally {
    try { await this.context?.close(); }
    finally { await this.browser?.close(); }
    log(`END: ${pickle.name} - ${result?.status ?? 'UNKNOWN'}`);
  }
});
