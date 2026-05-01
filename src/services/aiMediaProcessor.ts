import OpenAI, { toFile } from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY;
const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

/**
 * Transcribes audio buffer (m4a from LINE) to text using Whisper API
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const file = await toFile(audioBuffer, 'audio.m4a', { type: 'audio/m4a' });
    const response = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'th', // Optimize for Thai
    });
    
    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

/**
 * Analyzes an image and returns a concise search query representing the destination/intent
 */
export async function analyzeImage(imageBase64: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant for a travel agency. Your goal is to analyze the provided image (which could be a landmark, a tour itinerary, or a competitor\'s package) and extract the travel destination or key intent. Return ONLY a concise search query (e.g., "ทัวร์ญี่ปุ่น โตเกียว ฟูจิ", "ทัวร์ยุโรป", "ทัวร์เกาหลี") without any extra conversational text.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'low'
              }
            }
          ]
        }
      ],
      max_tokens: 50,
      temperature: 0.1
    });

    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image');
  }
}
