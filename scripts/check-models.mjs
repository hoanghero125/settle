// Lists the models the organiser's key can call, so nobody codes against a
// model the credit does not cover. Usage: npm run check:models
import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is missing. Put it in .env.local first.");
  process.exit(1);
}

const client = new OpenAI();
const ids = [];
for await (const model of client.models.list()) ids.push(model.id);
ids.sort();

const speech = ids.filter((id) => /tts|audio|speech/i.test(id));
const chat = ids.filter((id) => /^(gpt|o\d|chatgpt)/i.test(id) && !speech.includes(id));

console.log(`Key can call ${ids.length} models.\n`);
console.log("Candidates for OPENAI_VISION_MODEL (confirm image input in the model's docs):");
console.log(chat.map((id) => `  ${id}`).join("\n") || "  none found");
console.log("\nCandidates for OPENAI_TTS_MODEL:");
console.log(speech.map((id) => `  ${id}`).join("\n") || "  none found");
