const { bot, isPrivate } = require("../lib/");
const axios = require("axios");
const fs = require("fs");
const yts = require("yt-search");
const { exec } = require("child_process");
const { OWNER_NAME, BOT_NAME } = require("../config");
// Function to download and send media
async function downloadAndSend(message, type = "video", query, isUrl = false) {
  const quoted = {
    key: message.key,
    message: {
      conversation: message.text || message.body || "",
    },
  };
 const contextInfo = {
      forwardingScore: 1,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363298577467093@newsletter',
        newsletterName: BOT_NAME,
        serverMessageId: -1
      }
    };
  try {
    let videoUrl;

    if (isUrl) {
      videoUrl = query;
    } else {
      // Use yt-search to get the first video URL
      const search = await yts(query);
      if (!search?.videos?.length) return;
      videoUrl = search.videos[0].url;
    }

    const apiUrl = `https://eypz.koyeb.app/api/dl/yt${type === "audio" ? "a" : "v"}?url=${videoUrl}&quality=720&apikey=akshay-eypz`;

    const { data } = await axios.get(apiUrl);
    if (!data?.media_url) return;

    const ext = type === "audio" ? "mp3" : "mp4";
    const tempFile = `temp_${Date.now()}.${ext}`;
    const finalFile = `final_${Date.now()}.${ext}`;

    // Download the file
    const response = await axios({ url: data.media_url, responseType: "stream" });
    const writer = fs.createWriteStream(tempFile);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    if (type === "video") {
      // Use ffmpeg for video (faststart)
      await new Promise((resolve, reject) => {
        exec(`ffmpeg -i ${tempFile} -c copy -movflags faststart ${finalFile}`, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } else {
      // Rename directly for audio
      fs.renameSync(tempFile, finalFile);
    }

    await message.client.sendMessage(
      message.jid,
      {
        text: `Downloading: ${data.title}`,
      },
      { quoted }
    );

    const sendData = {
      mimetype: type === "audio" ? "audio/mp4" : "video/mp4",
    };
    sendData[type === "audio" ? "audio" : "video"] = fs.readFileSync(finalFile);

    await message.client.sendMessage(message.jid, sendData, { contextInfo, quoted });

    fs.unlinkSync(finalFile);

  } catch (e) {
    console.error("Error downloading:", e);
  }
}

// song - search and download audio
bot(
  {
    pattern: "song ?(.*)",
    fromMe: isPrivate,
    desc: "Download YouTube audio via search",
    type: "download",
  },
  async (message, match) => {
    const query = match || message.reply_message?.text;
    if (!query) return;
    await downloadAndSend(message, "audio", query, false);
  }
);

// video - search and download video
bot(
  {
    pattern: "video ?(.*)",
    fromMe: isPrivate,
    desc: "Download YouTube video via search",
    type: "download",
  },
  async (message, match) => {
    const query = match || message.reply_message?.text;
    if (!query) return;
    await downloadAndSend(message, "video", query, false);
  }
);

// yta - download audio directly via URL
bot(
  {
    pattern: "yta ?(.*)",
    fromMe: isPrivate,
    desc: "Download YouTube audio via URL",
    type: "download",
  },
  async (message, match) => {
    const url = match || message.reply_message?.text;
    if (!url) return;
    await downloadAndSend(message, "audio", url, true);
  }
);

// ytv - download video directly via URL
bot(
  {
    pattern: "ytv ?(.*)",
    fromMe: isPrivate,
    desc: "Download YouTube video via URL",
    type: "download",
  },
  async (message, match) => {
    const url = match || message.reply_message?.text;
    if (!url) return;
    await downloadAndSend(message, "video", url, true);
  }
);
