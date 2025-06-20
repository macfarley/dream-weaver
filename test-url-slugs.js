// Test the new URL slug system
import { sanitizeBedroomNameForUrl } from './src/utils/urlSafeNames.js';

const testNames = [
  "Master Bedroom",
  "Guest Room",
  "Kid's Room", 
  "Mom & Dad's Room",
  "Living Room (Couch)",
  "Basement Room!",
  "Room #1",
  "Sarah's Special Space"
];

console.log("Bedroom Name → URL Slug");
console.log("========================");

testNames.forEach(name => {
  const slug = sanitizeBedroomNameForUrl(name);
  console.log(`"${name}" → "${slug}"`);
});
