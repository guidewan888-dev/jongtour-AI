import { SyncManager } from '../src/services/suppliers/core/SyncManager';

async function test() {
  const manager = new SyncManager();
  console.log("Testing SyncManager with SUP_LETGO...");
  try {
    const result = await manager.syncSupplierTours('SUP_LETGO');
    console.log("Success:", result);
  } catch (err: any) {
    console.error("Error occurred:");
    console.error(err.message);
    if (err.details) console.error(err.details);
    if (err.hint) console.error(err.hint);
  }
}

test();
