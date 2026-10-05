require('dotenv').config();
const fs = require('node:fs');

const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  whatsappNumber: process.env.WHATSAPPNUMBER,
};

for (const [name, value] of Object.entries(config)) {
  if (!value) throw new Error(`Missing .env value for ${name}`);
}

fs.mkdirSync('src/environments', { recursive: true });
fs.writeFileSync(
  'src/environments/env.generated.ts',
  `⁠export const env = ${JSON.stringify(config, null, 2)};\n`
);