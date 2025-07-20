const fs = require('fs');
const path = require('path');
const http = require('http');
const { MakeSession } = require("./lib/session");
const config = require("./config");
const connect = require("./lib/connection");
global.__basedir = __dirname;

async function readAndRequireFiles(directoryPath) {
    try {
        const files = await fs.promises.readdir(directoryPath);

        files.forEach((file) => {
            const filePath = path.join(directoryPath, file);

            if (filePath.endsWith('.js')) {
                require(filePath);
            }
        });
    } catch (err) {
        console.error('Error reading files:', err);
    }
}

async function initialize() {
    if (!fs.existsSync("./session/creds.json")) {
        await MakeSession(config.SESSION_ID, "./session");
        console.log("Version : " + require("./package.json").version);
    }

    console.log("WhatsApp Bot Initializing...");

    await readAndRequireFiles(path.join(__dirname, "./lib/database"));
    await config.DATABASE.sync();
    console.log("Database synchronized.");
    const client = await connect();

    console.log("Installing Plugins...");
    await readAndRequireFiles(path.join(__dirname, "/plugins"));
    console.log("Plugins Installed!");
}

initialize();

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Keep alive!');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
