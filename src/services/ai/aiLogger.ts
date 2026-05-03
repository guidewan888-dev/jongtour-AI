import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

export async function logAiConversation(sessionId: string, userId?: string) {
  try {
    let conversation = await prisma.aiConversation.findUnique({
      where: { sessionId }
    });

    if (!conversation) {
      conversation = await prisma.aiConversation.create({
        data: {
          sessionId,
          userId: userId || null,
          status: 'ACTIVE'
        }
      });
    }
    return conversation;
  } catch (error) {
    console.error('Failed to log AI Conversation:', error);
    return null;
  }
}

export async function logAiMessage(conversationId: string, role: string, content: string | null, toolCalls: any = null) {
  try {
    const message = await prisma.aiMessage.create({
      data: {
        conversationId,
        role,
        content,
        toolCalls: toolCalls ? JSON.parse(JSON.stringify(toolCalls)) : null
      }
    });
    return message;
  } catch (error) {
    console.error('Failed to log AI Message:', error);
    return null;
  }
}

export async function logAiToolCall(messageId: string, toolName: string, inputArgs: any, outputResult: any, latencyMs: number = 0, isError: boolean = false) {
  try {
    const toolCall = await prisma.aiToolCall.create({
      data: {
        messageId,
        toolName,
        inputArgs: inputArgs ? JSON.parse(JSON.stringify(inputArgs)) : null,
        outputResult: outputResult ? JSON.parse(JSON.stringify(outputResult)) : null,
        latencyMs,
        isError
      }
    });
    return toolCall;
  } catch (error) {
    console.error('Failed to log AI Tool Call:', error);
    return null;
  }
}
