const { getStreamsFromAttachment } = global.utils;
const g = require("fca-aryan-nix");

// Stockage temporaire pour notifications et réponses
const notificationMemory = {};
const adminReplies = {};

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "6.0 🌙⚽👑",
    author: "NTKhang x Christus",
    countDown: 5,
    role: 2,
    category: "owner",
    shortDescription: "📢 Envoie une notification royale à tous les groupes avec mention admin",
    longDescription: "Envoie un message stylé à tous les groupes avec nom du groupe, mention de l'admin et devise royale en bas 🌙⚽👑",
    guide: { fr: "notification <message>" },
    usePrefix: false,
    noPrefix: true
  },

  onStart: async function({ message, api, event, threadsData, envCommands, commandName, args }) {
    const { delayPerGroup = 300 } = envCommands[commandName] || {};
    if (!args[0]) return message.reply("⚠ Veuillez entrer le message à envoyer à tous les groupes 🌙⚽.");

    const allThreads = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup);

    if (!allThreads.length) return message.reply("⚠ Aucun groupe trouvé.");

    message.reply(`⏳ Début de l'envoi aux ${allThreads.length} groupes 🌙⚽...`);

    let sendSuccess = 0;
    const sendError = [];

    for (const thread of allThreads) {
      let groupName = thread.name || "Groupe inconnu";
      if (!thread.name) {
        try { const info = await api.getThreadInfo(thread.threadID); groupName = info.threadName || groupName; } catch {}
      }

      const adminName = event.senderName || "Admin";

      const notificationBody = `
━━━━━━━━━━━━━━
👑 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐑𝐎𝐘𝐀𝐋𝐄
🏷️ Nom du groupe : ${groupName}
👤 Administrateur : ${adminName}
──────────────────────────
💬 Message :
${args.join(" ")}
──────────────────────────
💎 Devise : "Pour la gloire et l'honneur du Football 🌙⚽"
━━━━━━━━━━━━━━
      `.trim();

      const formSend = {
        body: notificationBody,
        attachment: await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ])
      };

      try {
        const sentMsg = await api.sendMessage(formSend, thread.threadID);
        sendSuccess++;
        notificationMemory[`${thread.threadID}_${sentMsg.messageID}`] = { groupName, adminName };
        await new Promise(resolve => setTimeout(resolve, delayPerGroup));
      } catch (err) { sendError.push({ threadID: thread.threadID, groupName, error: err.message }); }
    }

    let bilan = `
━━━━━━━━━━━━
📬 𝐁𝐈𝐋𝐀𝐍 𝐃𝐄 𝐋'𝐄𝐍𝐕𝐎𝐈
✅ Groupes réussis : ${sendSuccess}
❌ Groupes échoués : ${sendError.length}
`;
    if (sendError.length) sendError.forEach(err => { bilan += `❌ ${err.groupName} : ${err.error}\n`; });
    bilan += `━━━━━━━━━━━━`;
    message.reply(bilan.trim());
  },

  onMessage: async function({ api, event }) {
    if (!event.messageReply) return;

    const repliedMsgID = event.messageReply.messageID;
    const notificationKey = Object.keys(notificationMemory).find(key => key.endsWith(`_${repliedMsgID}`));
    if (!notificationKey) return;

    const { groupName } = notificationMemory[notificationKey];
    const userName = event.senderName;
    const userID = event.senderID;

    const adminMessage = `
━━━━━━━━━━━━
👤 𝐑𝐄𝐏𝐎𝐍𝐒𝐄 𝐀̀ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐓𝐈𝐎𝐍 𝐑𝐎𝐘𝐀𝐋𝐄
📝 Nom : ${userName}
🆔 ID : ${userID}
🏷️ Groupe : ${groupName}
──────────────────────────
💬 Message :
${event.body}
💡 Répondez à ce message pour répondre à l'utilisateur via le bot.
━━━━━━━━━━━━
    `.trim();

    const allThreads = await api.getThreadList(1000, null, ['INBOX']);
    const adminIDs = allThreads
      .filter(t => t.isGroup)
      .flatMap(t => t.members.filter(m => m.role === 2).map(m => m.userID));
    const uniqueAdmins = [...new Set(adminIDs)];

    for (const adminID of uniqueAdmins) {
      try {
        const sent = await api.sendMessage(adminMessage, adminID);
        adminReplies[sent.messageID] = {
          originalThreadID: event.threadID,
          userID
        };
      } catch {}
    }
  },

  onReply: async function({ api, event }) {
    const replyData = adminReplies[event.messageReply?.messageID];
    if (!replyData) return;

    const { originalThreadID, userID } = replyData;
    try {
      await api.sendMessage(event.body, originalThreadID || userID);
      delete adminReplies[event.messageReply.messageID];
    } catch {}
  }
};
