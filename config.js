const { Sequelize } = require("sequelize");
const fs = require("fs");
require('dotenv').config({ path: './config.env' });
const toBool = (x) => x === "true";
const DATABASE_URL = process.env.DATABASE_URL || "./lib/database.db";
module.exports = {
  LOGS: toBool(process.env.LOGS) || true,
  SESSION_ID: process.env.SESSION_ID ||null,
  LANG: process.env.LANG || "EN",
  HANDLERS: process.env.HANDLER === "false" || process.env.HANDLER === "null"
      ? "^"
      : "[-]",
  BRANCH: "main",
  PACKNAME: process.env.PACKNAME || "WhatsApp Bot",
  AUTHOR: process.env.AUTHOR || "Akshay",
  SUDO: process.env.SUDO || "917902624272",
  OWNER_NAME: process.env.OWNER_NAME || "Akshay",
  BOT_NAME: process.env.BOT_NAME || "WhatsApp Bot",
  AUTO_READ: toBool(process.env.AUTO_READ) || false,
  AUTO_STATUS_READ: toBool(process.env.AUTO_STATUS_READ) || false,
  PROCESSNAME: process.env.PROCESSNAME || "WhatsApp Bot",
  WORK_TYPE: process.env.WORK_TYPE || "private",
  SESSION_URL: process.env.SESSION_URL || "",
  DELETED_LOG: toBool(process.env.DELETED_LOG) || false,
  DELETED_LOG_CHAT: process.env.DELETED_LOG_CHAT || false,
  DATABASE_URL: DATABASE_URL,
  STATUS_SAVER: toBool(process.env.STATUS_SAVER) || true,
  DATABASE:
    DATABASE_URL === "./lib/database.db"
      ? new Sequelize({
          dialect: "sqlite",
          storage: DATABASE_URL,
          logging: false,
        })
      : new Sequelize(DATABASE_URL, {
          dialect: "postgres",
          ssl: true,
          protocol: "postgres",
          dialectOptions: {
            native: true,
            ssl: { require: true, rejectUnauthorized: false },
          },
          logging: false,
        }),
};
