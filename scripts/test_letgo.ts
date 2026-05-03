import { LetgoAdapter } from '../src/services/suppliers/adapters/LetgoAdapter';
import { TourFactoryAdapter } from '../src/services/suppliers/adapters/TourFactoryAdapter';
import { CheckinAdapter } from '../src/services/suppliers/adapters/CheckinAdapter';

async function test() {
  try {
    const letgo = new LetgoAdapter();
    console.log("Testing Letgo...");
    const lgTours = await letgo.getTours();
    console.log(`Letgo returned ${lgTours.length} tours`);
  } catch (e: any) {
    console.error("Letgo error:", e);
  }
  
  try {
    const tf = new TourFactoryAdapter();
    console.log("Testing TourFactory...");
    const tfTours = await tf.getTours();
    console.log(`TourFactory returned ${tfTours.length} tours`);
  } catch (e: any) {
    console.error("TourFactory error:", e);
  }

  try {
    const checkin = new CheckinAdapter();
    console.log("Testing Checkin...");
    const ciTours = await checkin.getTours();
    console.log(`Checkin returned ${ciTours.length} tours`);
  } catch (e: any) {
    console.error("Checkin error:", e);
  }
}

test();
