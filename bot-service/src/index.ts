import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'jongtour-rpa-bot' });
});

// Start RPA Session
app.post('/run/start', async (req, res) => {
  const { bookingId, supplierId } = req.body;
  if (!bookingId || !supplierId) {
    return res.status(400).json({ error: 'Missing bookingId or supplierId' });
  }

  // Acknowledge the request immediately so the frontend doesn't timeout
  res.json({ status: 'accepted', message: 'RPA Session initiated' });

  // Run Bot in Background
  runBotWorkflow(bookingId, supplierId).catch(err => {
    console.error('Bot Error:', err);
  });
});

async function runBotWorkflow(bookingId: string, supplierId: string) {
  console.log(`[RPA] Starting workflow for Booking: ${bookingId}, Supplier: ${supplierId}`);
  
  // 1. Fetch Config
  const config = await prisma.supplierAutomationConfig.findUnique({ where: { supplierId } });
  if (!config) {
    console.log(`[RPA] Config not found for Supplier ${supplierId}`);
    return;
  }

  // 2. Fetch Credentials
  const credentials = await prisma.supplierCredential.findFirst({ where: { supplierId } });
  if (!credentials) {
    console.log(`[RPA] Credentials not found for Supplier ${supplierId}`);
    return;
  }

  // 3. Update Session Status
  const session = await prisma.wholesaleRpaSession.create({
    data: {
      bookingId,
      supplierId,
      status: 'LOGGING_IN',
      startedBy: 'system',
    }
  });

  // 4. Launch Playwright
  console.log('[RPA] Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 5. Mock Navigate and Login
    const loginUrl = config.loginUrl || 'https://example.com/login';
    console.log(`[RPA] Navigating to ${loginUrl}`);
    await page.goto(loginUrl);

    // Mock successful login
    await prisma.wholesaleRpaSession.update({
      where: { id: session.id },
      data: { status: 'FILLING_FORM' }
    });

    console.log('[RPA] Filling form mock...');
    // Mock waiting for form to fill
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Capture Screenshot
    const screenshotBuffer = await page.screenshot();
    // In production, upload to Supabase Storage and get URL
    const screenshotUrl = "https://mock-screenshot-url.com/before.png";

    // 7. Update Session to wait for Admin Approval
    await prisma.wholesaleRpaSession.update({
      where: { id: session.id },
      data: { 
        status: 'WAITING_ADMIN_APPROVAL',
        screenshotBeforeUrl: screenshotUrl 
      }
    });

    console.log('[RPA] Waiting for Admin Approval...');
  } catch (error) {
    console.error('[RPA] Playwright Error:', error);
    await prisma.wholesaleRpaSession.update({
      where: { id: session.id },
      data: { status: 'FAILED', errorMessage: String(error) }
    });
  } finally {
    await browser.close();
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🤖 Jongtour RPA Bot Service running on port ${PORT}`);
});
