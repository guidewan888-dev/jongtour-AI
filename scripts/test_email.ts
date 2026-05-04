import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { EmailService } = require('../src/lib/email');

async function test() {
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('Testing SMTP Connection...');
  const isConnected = await EmailService.verifyConnection();
  console.log('Connection status:', isConnected);

  if (isConnected) {
    console.log('Sending test email...');
    const result = await EmailService.sendPasswordReset('guidewan888@gmail.com', 'https://admin.jongtour.com/auth/reset-password#access_token=test');
    console.log('Send result:', result);
  }
}

test();
