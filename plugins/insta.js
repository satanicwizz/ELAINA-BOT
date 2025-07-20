const { bot, isPrivate } = require("../lib/");
const fetch = require("node-fetch");

bot({
  pattern: "insta ?(.*)",
  isPrivate,
  desc: "Download Instagram videos/images.",
  type: "downloader",
}, async (message, match) => {
  if (!match) return;

  const api = `https://api.eypz.ct.ws/api/dl/instagram?url=${encodeURIComponent(match)}`;

  try {
    const response = await fetch(api);
    const data = await response.json();

    if (data.status !== "success") return;

    const { videos = [], images = [] } = data;

    if (videos.length === 0 && images.length === 0) return;

    const quotedObj = {
      quoted: {
        key: message.key,
        message: { conversation: message.text || message.body || "" },
      },
    };

    for (const vid of videos) {
      await message.client.sendMessage(
        message.jid,
        {
          video: { url: vid },
          caption: "Here is your Instagram video",
          mimetype: "video/mp4",
        },
        quotedObj
      );
    }

    for (const img of images) {
      await message.client.sendMessage(
        message.jid,
        {
          image: { url: img },
          caption: "Here is your Instagram image",
        },
        quotedObj
      );
    }
  } catch (error) {
    console.error(error);
  }
});
