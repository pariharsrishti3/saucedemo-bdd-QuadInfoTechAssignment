import { World, setWorldConstructor } from '@cucumber/cucumber';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
export class TestWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  login!: LoginPage;
  products!: ProductsPage;
  cart!: CartPage;
  checkout!: CheckoutPage;
}
setWorldConstructor(TestWorld);
