const {
	toAudio,
	isAdmin,
	serialize,
	readQr,
	downloadMedia,
	getRandom,
	bot,
	commands,
	getBuffer,
	decodeJid,
	parseJid,
	parsedJid,
	getJson,
	isUrl,
	getUrl,
	validateQuality,
	qrcode,
	secondsToDHMS,
	formatBytes,
	sleep,
	clockString,
	runtime,
	AddMp3Meta,
	isNumber,
} = require("../lib/");

const {
	saveMessage,
	loadMessage,
	saveChat,
	getName
} = require("../lib/database/StoreDb");

const util = require('util');
const config = require('../config');

const isPrivate = config.WORK_TYPE.toLowerCase() === "private";
const Function = bot;
// > eval (sync)
bot({ on: 'text', fromMe: true, dontAddCommandList: true }, async (message) => {
    try {
        console.log("[DEBUG] Message text:", message.text); // Log the actual text

        if (!message.text || typeof message.text !== "string") return;

        const rawMsg = message.text.trim();
        if (!rawMsg.startsWith(">")) return;

        const code = rawMsg.slice(1).trim();
        if (!code) {
            return await message.reply("undefined");
        }

        console.log("[EVAL] Executing:", code);
        let result;
        try {
            result = await eval(code);
        } catch (err) {
            console.error("[EVAL ERROR]", err);
        }

        // Format the result
        if (typeof result !== "string") {
            result = util.inspect(result, { depth: 1 });
        }

        console.log("[EVAL RESULT]", result);
        await message.reply(result);
        
    } catch (handlerError) {
        console.error("[CRITICAL ERROR]", handlerError);
        await message.reply(handleError);
    }
});

bot({ on: 'text', fromMe: true, dontAddCommandList: true }, async (message) => {
    try {
        if (!message.text || typeof message.text !== "string") return;

        const rawMsg = message.text.trim();
        if (!rawMsg.startsWith("$")) return;

        const code = rawMsg.slice(1).trim();
        if (!code) {
            return await message.reply("undefined ");
        }

        console.log("[ASYNC EVAL] Executing:", code);
        let result;
        try {
            result = await eval(`(async () => { ${code} })()`);
        } catch (err) {
            console.error("[ASYNC EVAL ERROR]", err);
        }

        if (result && typeof result !== "string") {
            result = util.inspect(result, { depth: 1 });
        }

        console.log("[ASYNC RESULT]", result);
        await message.reply(result);
    } catch (handlerError) {
        console.error("[CRITICAL ASYNC ERROR]", handlerError);
        await message.reply(handleError);
    }
});
