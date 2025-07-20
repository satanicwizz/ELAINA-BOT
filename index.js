require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const credsPath = path.join(__dirname, 'session', 'creds.json');
const sessionId = process.env.SESSION_ID;

if (sessionId) {
  console.log("âœ… SESSION_ID found. Starting bot...");
  execSync('node bot.js', { stdio: 'inherit' });
} else if (fs.existsSync(credsPath)) {
  console.log("âœ… creds.json found. Starting bot...");
  execSync('node bot.js', { stdio: 'inherit' });
} else {
  console.log("ðŸ” No session found. Starting pairing...");
  execSync('node pair.js', { stdio: 'inherit' });
}