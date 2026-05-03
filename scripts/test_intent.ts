import { extractIntent } from '../src/services/ai/intentExtractor';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function test() {
  const messages = ["ขอโปรแกรม", "ขอโปรแกรม Zego", "ทัวร์คุนหมิง Let's go"];
  
  for (const msg of messages) {
    const { extracted } = await extractIntent(openai, msg);
    console.log(`Msg: "${msg}"`);
    console.log("Extracted:", JSON.stringify(extracted, null, 2));
    console.log("----------------------");
  }
}

test();
