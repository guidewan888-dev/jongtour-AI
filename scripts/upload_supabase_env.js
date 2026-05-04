const { execSync } = require('child_process');
const dotenv = require('dotenv');
const fs = require('fs');

const envs = dotenv.parse(fs.readFileSync('.env.local'));

const keysToUpload = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
];

for (const key of keysToUpload) {
  console.log(`Setting ${key}...`);
  try {
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch (e) {}

  try {
    execSync(`npx vercel env add ${key} production`, {
      input: envs[key],
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ ${key} set successfully.`);
  } catch (e) {
    console.error(`❌ Failed to set ${key}:`, e.stderr.toString());
  }
}
