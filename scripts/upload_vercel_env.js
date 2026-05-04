const { execSync } = require('child_process');

const envs = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'guidewan888@gmail.com',
  SMTP_PASSWORD: 'kwbldphbrcxwdfot',
  SMTP_FROM_EMAIL: 'noreply@jongtour.com',
  SMTP_FROM_NAME: 'Jongtour Admin',
};

for (const [key, value] of Object.entries(envs)) {
  console.log(`Setting ${key}...`);
  try {
    // Remove if exists
    execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' });
  } catch (e) {}

  try {
    execSync(`npx vercel env add ${key} production`, {
      input: value,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    console.log(`✅ ${key} set successfully.`);
  } catch (e) {
    console.error(`❌ Failed to set ${key}:`, e.stderr.toString());
  }
}
