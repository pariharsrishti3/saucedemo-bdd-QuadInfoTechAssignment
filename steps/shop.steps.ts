import { Given, When, Then } from '@cucumber/cucumber';
import { TestWorld } from '../support/world';
import users from '../testdata/users.json';
import customer from '../testdata/checkout.json';
Given('I login as a standard user', async function(this: TestWorld) {
  await this.login.open();
  await this.login.login(users.standard.username, users.standard.password);
  await this.products.expectLoaded();
});
Given('I attempt login with invalid credentials', async function(this: TestWorld) {
  await this.login.open();
  await this.login.login(users.invalid.username, users.invalid.password);
});
When('I add {string} to the cart', async function(this: TestWorld, name: string) {
  await this.products.addProduct(name);
});
Then('the cart badge should show {int}', async function(this: TestWorld, count: number) {
  await this.products.expectCartCount(count);
});
When('I open the cart', async function(this: TestWorld) { await this.products.openCart(); });
Then('the cart should contain {string}', async function(this: TestWorld, name: string) {
  await this.cart.expectProduct(name);
});
When('I checkout with valid customer details', async function(this: TestWorld) {
  await this.cart.checkout();
  await this.checkout.complete(customer);
});
Then('I should see the order confirmation page', async function(this: TestWorld) {
  await this.checkout.expectComplete();
});
Then('I should see an authentication error message', async function(this: TestWorld) {
  await this.login.expectAuthenticationError();
});
Then('I should remain on the login page', async function(this: TestWorld) {
  await this.login.expectLoginPage();
});
