export const log = (message: string) => console.log(`[${new Date().toISOString()}] ${message}`);
// Log lifecycle events, never passwords, DB URLs or customer payloads.
