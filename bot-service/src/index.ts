import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

dotenv.config();

// Add stealth plugin to playwright-extra
chromium.use(stealthPlugin());

const app = express();
app.use(cors());
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

const prisma = new PrismaClient();

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'jongtour-rpa-bot' });
});

// UI Dashboard
app.get('/', async (req, res) => {
  try {
    const sessions = await prisma.wholesaleRpaSession.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        booking: true,
        supplier: true
      }
    });
    res.render('dashboard', { sessions });
  } catch (err) {
    res.status(500).send('Error loading dashboard: ' + String(err));
  }
});

// Start RPA Session
app.post('/run/start', async (req, res) => {
  const { bookingId, supplierId } = req.body;
  if (!bookingId || !supplierId) {
    return res.status(400).json({ error: 'Missing bookingId or supplierId' });
  }

  // Acknowledge the request immediately
  res.json({ status: 'accepted', message: 'RPA Session initiated' });

  // Run Bot in Background
  runBotWorkflow(bookingId, supplierId).catch(err => {
    console.error('Bot Error:', err);
  });
});

// Admin Approves the Session (Resume stateless)
app.post('/run/submit', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    return res.status(400).json({ error: 'Missing sessionId' });
  }

  const sessionRecord = await prisma.wholesaleRpaSession.findUnique({
    where: { id: sessionId },
    include: { supplier: true, booking: true }
  });

  if (!sessionRecord || sessionRecord.status !== 'WAITING_ADMIN_APPROVAL') {
    return res.status(404).json({ error: 'Session not found or not waiting for approval' });
  }

  // Acknowledge request
  res.json({ status: 'accepted', message: 'Proceeding with submission' });

  let browser;
  try {
    console.log(`[RPA] Admin approved session ${sessionId}. Restoring session...`);
    
    // Update DB
    await prisma.wholesaleRpaSession.update({
      where: { id: sessionId },
      data: { status: 'SUBMITTED', adminApprovedAt: new Date() }
    });

    // Restore state and launch stealth browser
    browser = await chromium.launch({ headless: true });
    
    // Load the cookies saved during Phase 1
    const context = await browser.newContext({
      storageState: path.join(__dirname, `../sessions/${sessionId}.json`)
    });
    const page = await context.newPage();

    // Mock navigating back to the active page
    console.log(`[RPA] Navigating to booking submission page...`);
    // Example: await page.goto('https://example.com/checkout');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Resilient Locators (User-facing)
    console.log(`[RPA] Clicking submit button...`);
    // Example: await page.getByRole('button', { name: 'Submit' }).click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const screenshotBuffer = await page.screenshot();
    const screenshotUrl = "https://mock-screenshot-url.com/after_submit.png";

    await prisma.wholesaleRpaSession.update({
      where: { id: sessionId },
      data: { 
        status: 'COMPLETED',
        screenshotAfterUrl: screenshotUrl,
        finishedAt: new Date()
      }
    });

    console.log(`[RPA] Session ${sessionId} completed successfully.`);
  } catch (err) {
    console.error('[RPA] Submission Error:', err);
    await prisma.wholesaleRpaSession.update({
      where: { id: sessionId },
      data: { status: 'FAILED', errorMessage: String(err), finishedAt: new Date() }
    });
  } finally {
    if (browser) await browser.close();
  }
});


async function runBotWorkflow(bookingId: string, supplierId: string) {
  console.log(`[RPA] Starting workflow for Booking: ${bookingId}, Supplier: ${supplierId}`);
  
  const config = await prisma.supplierAutomationConfig.findUnique({ where: { supplierId } });
  if (!config) {
    console.log(`[RPA] Config not found for Supplier ${supplierId}`);
    return;
  }

  const credentials = await prisma.supplierCredential.findFirst({ where: { supplierId } });
  if (!credentials) {
    console.log(`[RPA] Credentials not found for Supplier ${supplierId}`);
    return;
  }

  const session = await prisma.wholesaleRpaSession.create({
    data: {
      bookingId,
      supplierId,
      status: 'LOGGING_IN',
      startedBy: 'system',
    }
  });

  console.log('[RPA] Launching stealth browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    const loginUrl = config.loginUrl || 'https://example.com/login';
    console.log(`[RPA] Navigating to ${loginUrl}`);
    await page.goto(loginUrl);

    await prisma.wholesaleRpaSession.update({
      where: { id: session.id },
      data: { status: 'FILLING_FORM' }
    });

    console.log('[RPA] Filling form mock...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save Session Cookies (Stateless Architecture)
    const sessionPath = path.join(__dirname, `../sessions/${session.id}.json`);
    await context.storageState({ path: sessionPath });
    console.log(`[RPA] Session cookies saved to ${sessionPath}`);

    const screenshotBuffer = await page.screenshot();
    const screenshotUrl = "https://mock-screenshot-url.com/before.png";

    await prisma.wholesaleRpaSession.update({
      where: { id: session.id },
      data: { 
        status: 'WAITING_ADMIN_APPROVAL',
        screenshotBeforeUrl: screenshotUrl 
      }
    });

    console.log('[RPA] Closing browser to save RAM. Waiting for Admin Approval...');
  } catch (error) {
    console.error('[RPA] Playwright Error:', error);
    
    // Attempt Error Recovery Screenshot
    try {
      const errorScreenshotUrl = "https://mock-screenshot-url.com/error.png"; // Replace with real upload logic
      await prisma.wholesaleRpaSession.update({
        where: { id: session.id },
        data: { status: 'FAILED', errorMessage: String(error), screenshotAfterUrl: errorScreenshotUrl, finishedAt: new Date() }
      });
    } catch(e) {
      // Ignore if browser is already disconnected
    }
  } finally {
    await browser.close();
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🤖 Jongtour RPA Bot Service running on port ${PORT}`);
});
