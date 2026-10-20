import dotenv from 'dotenv';
import path from 'node:path';
dotenv.config({ path: path.resolve('config/.env'), quiet: true });
function positiveNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value <= 0) throw new Error(`${name} must be positive`);
  return value;
}
function nonNegativeNumber(name: string, fallback: number): number {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value < 0) throw new Error(`${name} must be non-negative`);
  return value;
}
function boolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (value !== 'true' && value !== 'false') throw new Error(`${name} must be true or false`);
  return value === 'true';
}
const browser = process.env.BROWSER ?? 'chromium';
if (!['chromium', 'chrome', 'firefox', 'webkit'].includes(browser)) throw new Error('Unsupported BROWSER');
const baseURL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
new URL(baseURL);
export const config = {
  baseURL,
  browser: browser as 'chromium' | 'chrome' | 'firefox' | 'webkit',
  headless: boolean('HEADLESS', true),
  slowMo: nonNegativeNumber('SLOW_MO_MS', 500),
  actionTimeout: positiveNumber('ACTION_TIMEOUT_MS', 10000),
  navigationTimeout: positiveNumber('NAVIGATION_TIMEOUT_MS', 30000),
  databaseURL: process.env.DATABASE_URL,
  dbSSL: boolean('DB_SSL', false),
};
