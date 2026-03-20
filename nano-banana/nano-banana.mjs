#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const DEFAULT_MODEL = "gemini-flash-latest";
const OPENCLAW_CONFIG = "openclaw.json";

function parseArgs(argv) {
  const opts = {
    prompt: "",
    model: DEFAULT_MODEL,
    temperature: 0.72,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 512,
    json: false,
  };

  const args = argv.slice(2);
  let i = 0;
  while (i < args.length) {
    const raw = args[i];
    if (raw === "--json") {
      opts.json = true;
      i += 1;
      continue;
    }

    if (raw.startsWith("--prompt=")) {
      opts.prompt = raw.slice("--prompt=".length);
      i += 1;
      continue;
    }
    if (raw === "--prompt" || raw === "-p") {
      opts.prompt = args[i + 1] || "";
      i += 2;
      continue;
    }

    if (raw.startsWith("--model=")) {
      opts.model = raw.slice("--model=".length);
      i += 1;
      continue;
    }
    if (raw === "--model") {
      opts.model = args[i + 1] || opts.model;
      i += 2;
      continue;
    }

    if (raw.startsWith("--temperature=")) {
      opts.temperature = Number(raw.slice("--temperature=".length)) || opts.temperature;
      i += 1;
      continue;
    }
    if (raw === "--temperature") {
      opts.temperature = Number(args[i + 1]) || opts.temperature;
      i += 2;
      continue;
    }

    if (raw.startsWith("--top-p=")) {
      opts.topP = Number(raw.slice("--top-p=".length)) || opts.topP;
      i += 1;
      continue;
    }
    if (raw === "--top-p") {
      opts.topP = Number(args[i + 1]) || opts.topP;
      i += 2;
      continue;
    }

    if (raw.startsWith("--top-k=")) {
      opts.topK = Number(raw.slice("--top-k=".length)) || opts.topK;
      i += 1;
      continue;
    }
    if (raw === "--top-k") {
      opts.topK = Number(args[i + 1]) || opts.topK;
      i += 2;
      continue;
    }

    if (raw.startsWith("--max-output-tokens=")) {
      opts.maxOutputTokens = Number(raw.slice("--max-output-tokens=".length)) || opts.maxOutputTokens;
      i += 1;
      continue;
    }
    if (raw === "--max-output-tokens") {
      opts.maxOutputTokens = Number(args[i + 1]) || opts.maxOutputTokens;
      i += 2;
      continue;
    }

    console.error(`Unknown flag: ${raw}`);
    i += 1;
  }

  return opts;
}

async function readStdin() {
  if (process.stdin.isTTY) return "";
  process.stdin.setEncoding("utf-8");
  let data = "";
  for await (const chunk of process.stdin) {
    data += chunk;
  }
  return data.trim();
}

function getOpenClawHome() {
  return (
    process.env.OPENCLAW_HOME ||
    process.env.OPENCLAW_STATE_DIR ||
    join(homedir(), ".openclaw")
  );
}

async function readConfigEnv() {
  const home = getOpenClawHome();
  const configPath = join(home, OPENCLAW_CONFIG);
  try {
    const raw = await readFile(configPath, "utf-8");
    const parsed = JSON.parse(raw);
    const envBlock = parsed?.env ?? {};
    const envVars = envBlock?.vars ?? {};
    const env = {};
    for (const [key, value] of Object.entries(envBlock)) {
      if (typeof value === "string") {
        env[key] = value;
      }
    }
    for (const [key, value] of Object.entries(envVars)) {
      if (typeof value === "string" && !env[key]) {
        env[key] = value;
      }
    }
    return env;
  } catch (err) {
    return {};
  }
}

function parseDotEnv(raw) {
  const env = {};
  if (!raw) return env;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIdx = trimmed.indexOf("=");
    if (equalsIdx < 0) continue;
    const key = trimmed.slice(0, equalsIdx).trim();
    let value = trimmed.slice(equalsIdx + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value.replace(/\\n/g, "\n");
  }
  return env;
}

async function readDotEnv() {
  const envPath = join(getOpenClawHome(), ".env");
  try {
    const raw = await readFile(envPath, "utf-8");
    return parseDotEnv(raw);
  } catch (err) {
    return {};
  }
}

async function resolveGoogleKey() {
  const configEnv = await readConfigEnv();
  const dotEnv = await readDotEnv();
  const candidates = [
    process.env.GOOGLE_STUDIO_API_KEY,
    configEnv.GOOGLE_STUDIO_API_KEY,
    dotEnv.GOOGLE_STUDIO_API_KEY,
  ];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  throw new Error(
    "Nano Banana requires GOOGLE_STUDIO_API_KEY. Set it in openclaw.json (env block), ~/.openclaw/.env, or the environment."
  );
}

function flattenCandidateText(candidate = {}) {
  const pieces = [];
  if (Array.isArray(candidate.output)) {
    for (const entry of candidate.output) {
      if (entry?.content && Array.isArray(entry.content)) {
        for (const part of entry.content) {
          if (typeof part?.text === "string") {
            pieces.push(part.text);
          }
        }
      }
    }
  }
  if (Array.isArray(candidate.content)) {
    for (const item of candidate.content) {
      if (typeof item?.text === "string") {
        pieces.push(item.text);
      }
    }
  }
  if (typeof candidate.text === "string") {
    pieces.push(candidate.text);
  }
  return pieces.join("\n").trim();
}

async function callGoogle(model, key, body) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": key,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Google API error ${response.status}: ${errorText || response.statusText}`
    );
  }
  return response.json();
}

async function main() {
  const opts = parseArgs(process.argv);
  if (!opts.prompt) {
    const stdin = await readStdin();
    opts.prompt = stdin;
  }
  if (!opts.prompt) {
    console.error("Nano Banana needs a prompt. Use --prompt or pipe text in.");
    process.exit(1);
  }

  const key = await resolveGoogleKey();
  const payload = {
    contents: [
      {
        parts: [
          {
            text: opts.prompt,
          },
        ],
      },
    ],
    temperature: opts.temperature,
    topP: opts.topP,
    topK: opts.topK,
    maxOutputTokens: opts.maxOutputTokens,
  };

  const data = await callGoogle(opts.model, key, payload);
  if (opts.json) {
    console.log(JSON.stringify(data, null, 2));
  }

  const candidates = Array.isArray(data?.candidates) ? data.candidates : [];
  if (!candidates.length) {
    console.log("Nano Banana returned no candidates.");
    return;
  }

  const answers = candidates
    .map((candidate) => flattenCandidateText(candidate))
    .filter((text) => text.length > 0);

  if (!answers.length) {
    console.log("Nano Banana returned empty text but the request succeeded.");
    return;
  }

  console.log(answers.join("\n\n---\n\n"));
}

main().catch((err) => {
  console.error("Nano Banana error:", err instanceof Error ? err.message : err);
  process.exit(1);
});
