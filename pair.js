require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const { execSync } = require('child_process');

const {
  default: makeWASocket,
  useMultiFileAuthState,
  delay,
  makeCacheableSignalKeyStore,
  Browsers
} = require('@adiwajshing/baileys');

async function readSpecificJSONFiles(folderPath) {
  const credsPath = path.join(folderPath, 'creds.json');
  const keysPath = path.join(folderPath, 'keys');

  const creds = fs.existsSync(credsPath) ? JSON.parse(fs.readFileSync(credsPath)) : {};
  const keyFiles = fs.existsSync(keysPath) ? fs.readdirSync(keysPath) : [];
  const keys = {};

  for (const file of keyFiles) {
    const keyName = file.replace('.json', '');
    const keyData = JSON.parse(fs.readFileSync(path.join(keysPath, file)));
    keys[keyName] = keyData;
  }

  return { creds, keys };
}

async function pairDevice() {
  const sessionPath = './session';
  const authStatePath = path.resolve(sessionPath);
  let num = process.env.NUMBER;

  if (!num) {
    console.log("❌ Please add NUMBER=xxxxxxxxxx in config.env and restart.");
    return;
  }

  const { state, saveCreds } = await useMultiFileAuthState(authStatePath);

  const session = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
    },
    printQRInTerminal: false,
    logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
    browser: Browsers.macOS('Safari')
  });

  if (!session.authState.creds.registered) {
    await delay(1500);
    num = num.replace(/[^0-9]/g, '');
    const code = await session.requestPairingCode(num);
    console.log("🔗 Pairing Code:", code);
  }

  session.ev.on('creds.update', saveCreds);

  session.ev.on('connection.update', async (s) => {
    const { connection, lastDisconnect } = s;

    if (connection === 'open') {
      console.log("✅ Paired successfully. Waiting for WhatsApp sync...");
      await delay(10000);

      // Save full session as merged JSON (optional, for backup or audit)
      const mergedJSON = await readSpecificJSONFiles(authStatePath);
      fs.writeFileSync(path.join(authStatePath, 'full_session.json'), JSON.stringify(mergedJSON, null, 2));

      await session.ws.close();
      console.log("✅ Restarting bot...");
      execSync("node bot.js", { stdio: "inherit" });
    } else if (
      connection === 'close' &&
      lastDisconnect &&
      lastDisconnect.error &&
      lastDisconnect.error.output?.statusCode !== 401
    ) {
      console.log("⚠️ Disconnected. Retrying in 10s...");
      await delay(10000);
      pairDevice();
    }
  });
}

pairDevice();