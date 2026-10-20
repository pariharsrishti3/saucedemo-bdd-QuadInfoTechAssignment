# Database validation design (pseudocode)

SauceDemo exposes no database or real persisted order ID. These examples describe an
application we control; they are NOT executed by the SauceDemo scenarios. PostgreSQL
is an explicit design assumption. The reusable `support/database.ts` utility is real
TypeScript; the schema and application APIs below are illustrative.

## UI-to-database validation

1. Generate a unique run ID with `crypto.randomUUID()` for each scenario.
2. Create a dedicated test customer via the application's test API, tagged with run ID.
3. Use that customer in the UI purchase and obtain the actual order ID from the
   confirmation page or the checkout response (do not invent a SauceDemo order ID).
4. Query by order ID AND customer ID AND run ID, not latest timestamp or a shared name.
5. Poll until the exact record reaches its expected status, with a finite deadline.
6. Assert customer, item SKU, quantity, currency, total and status against the UI/input.
7. Delete only this scenario's records in a finally block, then close the pool.

```typescript
// PSEUDOCODE: api, checkoutPage and schema are hypothetical, not SauceDemo APIs.
const runId = crypto.randomUUID();
const db = new Database();
let customerId;
try {
  customerId = await testApi.createCustomer({ runId });
  const orderId = await checkoutPage.purchaseAndReadOrderId(customerId);

  // Poll a successful query whose result has not yet converged.
  // SQL/auth/connection errors should fail immediately, rather than be hidden.
  let record;
  const deadline = Date.now() + 15000;
  while (true) {
    const rows = await db.query(
      `SELECT o.id, o.customer_id, o.status, o.total_cents, o.currency,
              i.sku, i.quantity
       FROM orders o JOIN order_items i ON i.order_id = o.id
       WHERE o.id = $1 AND o.customer_id = $2 AND o.test_run_id = $3`,
      [orderId, customerId, runId]
    );
    if (rows.length === 1 && rows[0].status === 'CONFIRMED') {
      record = rows[0];
      break;
    }
    if (Date.now() >= deadline) throw new Error('Order did not converge within 15s');
    await delay(Math.min(500, deadline - Date.now()));
    // This bounded polling interval is justified for eventual consistency;
    // it is not an unconditional UI sleep. Each DB query has its own 5s timeout.
  }
  assert.equal(record.customer_id, customerId);
  assert.equal(record.sku, expectedSku);
  assert.equal(record.quantity, 1);
  assert.equal(record.currency, expectedCurrency);
  assert.equal(record.total_cents, expectedUiTotalInCents);
} finally {
  try {
    // Test-only endpoint deletes children before parent in a transaction.
    // It must be idempotent and target ONLY this run's data, even on partial creation.
    await testApi.deleteDataForRun(runId);
  } finally {
    await db.close();
  }
}
```

The polling deadline bounds repeated attempts; an in-flight query may consume up to
its configured 5-second timeout. For a strict wall-clock SLA, also pass the remaining
time as the per-query timeout. Do not blindly retry permanent DB errors.

## Isolation and cleanup

Use a dedicated non-production database and a per-scenario customer/run ID. UI writes
use application connections, so rolling back a transaction on our separate test DB
connection will NOT undo them. Clean up through a test-only service or scoped SQL.
Where SQL cleanup is needed, delete `order_items` for orders with the run ID, then
`orders`, then the scenario customer, all in a transaction on ONE acquired client.
Never use TRUNCATE or unscoped DELETE against shared environments. A scheduled janitor
may remove abandoned run IDs after a safe TTL. Preserve original assertion failures
if cleanup also fails, and report cleanup failures separately.

## Utility details

Configuration comes from DATABASE_URL and DB_SSL. The pool is lazy: construction does
not prove connectivity; the first query does. `pool.query` acquires/releases a client
for each query. Parameterized values avoid SQL injection. SQL identifiers must be
fixed or allowlisted, not passed as values. Errors expose a code, not secrets.
`close()` ends the pool in finally. For multi-statement transactions, acquire one
client and use BEGIN/COMMIT/ROLLBACK on that client; this simple utility intentionally
does not pretend separate pool.query calls form one transaction.
