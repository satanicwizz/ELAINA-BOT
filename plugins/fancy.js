const { bot, isPrivate } = require("../lib/");
const { listall } = require("../lib/fancy");

bot(
  {
    pattern: "fancy",
    fromMe: isPrivate,
    desc: "converts text to fancy text",
    type: "converter",
  },
  async (message, match) => {
    let text = match;
    let replyMessageText = message.reply_message && message.reply_message.text;

    // If replying to a message
    if (replyMessageText) {
      if (!isNaN(match)) {
        return await message.client.sendMessage(
          message.jid,
          {
            text: styleText(replyMessageText, match),
          },
          {
            quoted: {
              key: message.key,
              message: {
                conversation: message.text || message.body || '',
              },
            },
          }
        );
      }

      let fancyTexts = listAllFancyTexts(replyMessageText);
      return await message.client.sendMessage(
        message.jid,
        {
          text: fancyTexts,
        },
        {
          quoted: {
            key: message.key,
            message: {
              conversation: message.text || message.body || '',
            },
          },
        }
      );
    }

    // No match, send default fancy preview
    if (!text) {
      let fancyTexts = listAllFancyTexts("Fancy");
      return await message.client.sendMessage(
        message.jid,
        {
          text: fancyTexts,
        },
        {
          quoted: {
            key: message.key,
            message: {
              conversation: message.text || message.body || '',
            },
          },
        }
      );
    }

    // If input is a number
    if (!isNaN(match)) {
      if (match > listall("Fancy").length) {
        return await message.sendMessage("Invalid number");
      }

      return await message.client.sendMessage(
        message.jid,
        {
          text: styleText(text, match),
        },
        {
          quoted: {
            key: message.key,
            message: {
              conversation: message.text || message.body || '',
            },
          },
        }
      );
    }

    // If input is a string
    let fancyTexts = listAllFancyTexts(match);
    return await message.client.sendMessage(
      message.jid,
      {
        text: fancyTexts,
      },
      {
        quoted: {
          key: message.key,
          message: {
            conversation: message.text || message.body || '',
          },
        },
      }
    );
  }
);

function listAllFancyTexts(text) {
  let message = "Fancy text generator\n\nReply to a message\nExample: .fancy 32\n\n";
  listall(text).forEach((txt, index) => {
    message += `${index + 1}. ${txt}\n`;
  });
  return message;
}

function styleText(text, index) {
  index = index - 1;
  return listall(text)[index];
}
