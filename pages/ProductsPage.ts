import { expect, Page } from '@playwright/test';
export class ProductsPage {
  constructor(private readonly page: Page) {}
  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/inventory\.html$/);
    await expect(this.page.getByTestId('title')).toHaveText('Products');
  }
  async addProduct(name: string) {
    // Explicit product-to-test-id mapping avoids guessing an application's ID scheme.
    const productIds: Record<string, string> = {
      'Sauce Labs Backpack': 'add-to-cart-sauce-labs-backpack',
    };
    const id = productIds[name];
    if (!id) throw new Error(`Unsupported product: ${name}`);
    await this.page.getByTestId(id).click();
  }
  async expectCartCount(count: number) {
    await expect(this.page.getByTestId('shopping-cart-badge')).toHaveText(String(count));
  }
  async openCart() { await this.page.getByTestId('shopping-cart-link').click(); }
}
