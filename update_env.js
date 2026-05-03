const { spawnSync } = require('child_process');

console.log("Removing DATABASE_URL...");
spawnSync('npx.cmd', ['vercel', 'env', 'rm', 'DATABASE_URL', 'production', '-y'], { stdio: 'inherit' });

console.log("Adding DATABASE_URL...");
const addProcess = spawnSync('npx.cmd', ['vercel', 'env', 'add', 'DATABASE_URL', 'production'], {
  input: 'postgresql://postgres:zX70oOfCtmYFTimy@db.qterfftaebnoawnzkfgu.supabase.co:6543/postgres?pgbouncer=true\n',
  stdio: ['pipe', 'inherit', 'inherit']
});

console.log("Adding process exited with:", addProcess.status);
