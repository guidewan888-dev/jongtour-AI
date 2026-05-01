import { NextResponse } from 'next/server';
import * as line from '@line/bot-sdk';
import { processAiQuery, generateAiReply } from '@/services/aiPlanner';

// Configure LINE Client
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// Create a new LINE client
const client = new line.messagingApi.MessagingApiClient(config);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    // In a production app, we should validate the signature here:
    // const isValid = validateSignature(body, config.channelSecret, signature);
    // if (!isValid) return NextResponse.json({}, { status: 401 });

    const data = JSON.parse(body);
    const events: line.WebhookEvent[] = data.events;

    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'No events' }, { status: 200 });
    }

    // Process each event
    const results = await Promise.all(
      events.map(async (event) => {
        // We only handle text messages
        if (event.type !== 'message' || event.message.type !== 'text') {
          return null;
        }

        const userMessage = event.message.text;
        const replyToken = event.replyToken;

        try {
          // 1. Process query and find relevant tours using RAG
          const tours = await processAiQuery(userMessage);

          // 2. Generate a conversational reply using GPT-4o-mini and Company Knowledge Base
          const replyText = await generateAiReply(userMessage, tours);

          // 3. Send reply back to LINE
          const message: line.TextMessage = {
            type: 'text',
            text: replyText
          };

          return await client.replyMessage({
            replyToken: replyToken,
            messages: [message]
          });
        } catch (error) {
          console.error("Error processing LINE event:", error);
          // Fallback reply
          return await client.replyMessage({
            replyToken: replyToken,
            messages: [{
              type: 'text',
              text: "ขออภัยค่ะ แอดมิน AI กำลังติดปัญหาเล็กน้อย กรุณารอสักครู่หรือติดต่อแอดมินทาง @Jongtour นะคะ"
            }]
          });
        }
      })
    );

    return NextResponse.json({ status: 'success', results }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
