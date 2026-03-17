#!/usr/bin/env node
/**
 * ElevenLabs narration generator for daily Howard updates
 * Usage: node generate-narration.js <input-script.txt> <output.wav>
 */
import fs from 'node:fs';
import path from 'node:path';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_b38b8409f5e0d8e34543f0354a923527eafbd815df3d26e1';
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'hk6wpUusj7FFV03U5LvR'; // Bruce

async function generateNarration(inputPath, outputPath) {
  const text = fs.readFileSync(inputPath, 'utf8');
  
  console.log(`Generating narration...`);
  console.log(`Voice: ${VOICE_ID}`);
  console.log(`Input: ${inputPath}`);
  console.log(`Output: ${outputPath}`);
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${response.status} - ${error}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(outputPath, audioBuffer);
  
  const stats = fs.statSync(outputPath);
  console.log(`✓ Generated: ${outputPath}`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

// Main
const [,, inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  console.error('Usage: node generate-narration.js <input-script.txt> <output.wav>');
  process.exit(1);
}

generateNarration(inputPath, outputPath).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
