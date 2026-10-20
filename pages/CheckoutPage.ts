import { expect, Page } from '@playwright/test';
export interface Customer { firstName: string; lastName: string; postalCode: string }
export class CheckoutPage {
  constructor(private readonly page: Page) {}
  async complete(customer: Customer) {
    await this.page.getByTestId('firstName').fill(customer.firstName);
    await this.page.getByTestId('lastName').fill(customer.lastName);
    await this.page.getByTestId('postalCode').fill(customer.postalCode);
    await this.page.getByTestId('continue').click();
    await expect(this.page).toHaveURL(/\/checkout-step-two\.html$/);
    await this.page.getByTestId('finish').click();
  }
  async expectComplete() {
    await expect(this.page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(this.page.getByTestId('title')).toHaveText('Checkout: Complete!');
    await expect(this.page.getByTestId('complete-header')).toHaveText('Thank you for your order!');
  }
}
