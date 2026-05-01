import { NextResponse } from 'next/server';
import * as line from '@line/bot-sdk';
import { processAiQuery, generateAiReply, summarizeChatSession } from '@/services/aiPlanner';
import { transcribeAudio, analyzeImage } from '@/services/aiMediaProcessor';
import { prisma } from '@/lib/prisma';

// Configure LINE Client
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
  channelSecret: process.env.LINE_CHANNEL_SECRET || '',
};

// Create a new LINE client
const client = new line.messagingApi.MessagingApiClient(config);
const blobClient = new line.messagingApi.MessagingApiBlobClient(config);

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
    const events: any[] = data.events;

    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'No events' }, { status: 200 });
    }

    // Process each event
    const results = await Promise.all(
      events.map(async (event) => {
        // We only handle message events of type text, image, or audio
        if (event.type !== 'message' || !['text', 'image', 'audio'].includes(event.message.type)) {
          return null;
        }

        const replyToken = event.replyToken;
        const lineUserId = event.source?.userId;
        let userMessage = '';

        try {
          // 1. Process Media Messages
          if (event.message.type === 'text') {
            userMessage = event.message.text;
          } else if (event.message.type === 'audio') {
            // Fetch audio from LINE
            const stream = await blobClient.getMessageContent(event.message.id);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            // Transcribe via Whisper
            userMessage = await transcribeAudio(buffer);
          } else if (event.message.type === 'image') {
            // Fetch image from LINE
            const stream = await blobClient.getMessageContent(event.message.id);
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            const base64 = buffer.toString('base64');
            // Analyze via GPT-4o Vision
            userMessage = await analyzeImage(base64);
          }

          if (!userMessage || userMessage.trim() === '') {
            return await client.replyMessage({
              replyToken: replyToken,
              messages: [{ type: 'text', text: 'ขออภัยค่ะ ระบบไม่สามารถประมวลผลข้อความนี้ได้ กรุณาลองใหม่อีกครั้งค่ะ' }]
            });
          }

          // 2. Fetch or Create Chat Session
          let chatHistory: any[] = [];
          if (lineUserId) {
            let session = await prisma.lineChatSession.findUnique({
              where: { lineUserId },
              include: { messages: { orderBy: { createdAt: 'asc' }, take: 10 } }
            });

            if (!session) {
              session = await prisma.lineChatSession.create({
                data: { lineUserId },
                include: { messages: true }
              });
            } else {
              chatHistory = session.messages.map(m => ({ role: m.role, content: m.content }));
            }

            // Save user message to history
            await prisma.lineChatMessage.create({
              data: { sessionId: session.id, role: 'user', content: userMessage }
            });
          }

          // 3. Process query and find relevant tours using RAG
          const tours = await processAiQuery(userMessage);

          // 4. Generate a conversational reply using GPT-4o and Company Knowledge Base
          const replyText = await generateAiReply(userMessage, tours, chatHistory);

          // Save assistant reply to history
          if (lineUserId) {
            const session = await prisma.lineChatSession.findUnique({ where: { lineUserId } });
            if (session) {
              await prisma.lineChatMessage.create({
                data: { sessionId: session.id, role: 'assistant', content: replyText }
              });
            }
          }

          // 5. Send reply back to LINE
          const message: any = {
            type: 'text',
            text: replyText
          };

          const result = await client.replyMessage({
            replyToken: replyToken,
            messages: [message]
          });

          // Generate Summary occasionally (every 4 messages) to keep CRM updated
          if (lineUserId && chatHistory.length % 4 === 0) {
            const allMessages = [...chatHistory, {role: 'user', content: userMessage}, {role: 'assistant', content: replyText}];
            const summary = await summarizeChatSession(allMessages);
            await prisma.lineChatSession.update({
              where: { lineUserId },
              data: { summary }
            });
          }

          return result;
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
