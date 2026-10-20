import { expect, Page } from '@playwright/test';
export class CartPage {
  constructor(private readonly page: Page) {}
  async expectProduct(name: string) {
    await expect(this.page).toHaveURL(/\/cart\.html$/);
    const item = this.page.getByTestId('inventory-item').filter({
      has: this.page.getByText(name, { exact: true }),
    });
    await expect(item).toHaveCount(1);
    await expect(item.getByTestId('item-quantity')).toHaveText('1');
  }
  async checkout() { await this.page.getByTestId('checkout').click(); }
}
