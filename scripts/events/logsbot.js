/**
 * @French – Royal France / Football 🌙⚽👑
 * Module pour suivre les événements du bot : ajouté ou retiré d’un groupe.
 * Message stylé avec nom du groupe, ID du groupe, ID de l’utilisateur et heure.
 */

const { getTime } = global.utils;

module.exports = {
  config: {
    name: "logsbot",
    isBot: true,
    version: "1.4 🌙⚽👑",
    author: "NTKhang",
    envConfig: { allow: true },
    category: "événements"
  },

  langs: {
    fr: {
      title: "====== 📜 Journal Royal du Bot ======",
      added: "\n✅\nÉvénement : Le bot a été ajouté dans un nouveau groupe\n- Par : %1",
      kicked: "\n❌\nÉvénement : Le bot a été retiré du groupe\n- Par : %1",
      footer: "\n- ID Utilisateur : %1\n- Groupe : %2\n- ID Groupe : %3\n- Heure : %4\n- Administrateurs : %5"
    }
  },

  onStart: async ({ usersData, threadsData, event, api, getLang }) => {
    const botID = api.getCurrentUserID();
    const config = global.GoatBot.config;

    const isAdded = event.logMessageType === "log:subscribe" && event.logMessageData.addedParticipants.some(p => p.userFbId === botID);
    const isRemoved = event.logMessageType === "log:unsubscribe" && event.logMessageData.leftParticipantFbId === botID;
    if (!isAdded && !isRemoved) return;

    let msg = getLang("title");
    const author = event.author;
    if (author === botID) return; // Ignorer si le bot fait l'action lui-même

    let threadName = "Groupe inconnu";
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      threadName = threadInfo.threadName || threadName;
    } catch {}

    const authorName = await usersData.getName(author);

    if (isAdded) msg += getLang("added", authorName);
    if (isRemoved) msg += getLang("kicked", authorName);

    const time = getTime("DD/MM/YYYY HH:mm:ss");

    // Liste des admins
    const adminNames = config.adminBot.length > 0
      ? await Promise.all(config.adminBot.map(async id => await usersData.getName(id)))
      : ["Aucun administrateur"];

    msg += getLang("footer", author, threadName, event.threadID, time, adminNames.join(", "));

    // Envoie à tous les admins
    for (const adminID of config.adminBot) {
      try { await api.sendMessage(msg, adminID); } catch {}
    }
  }
};
