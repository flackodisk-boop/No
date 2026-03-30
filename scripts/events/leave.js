/**
 * @French – Royal France / Football 🌙⚽👑
 * Module pour gérer les départs d’utilisateurs d’un groupe.
 * Affiche un message stylé avec nom, type de départ, nom du groupe et session horaire.
 */

const { getTime, drive } = global.utils;

module.exports = {
  config: {
    name: "leave",
    version: "1.4 🌙⚽👑",
    author: "NTKhang",
    category: "événements"
  },

  langs: {
    fr: {
      session1: "matinée ☀️",
      session2: "midi 🌤️",
      session3: "après-midi 🌞",
      session4: "soirée 🌙",
      leaveType1: "s'est retiré(e) élégamment",
      leaveType2: "a été expulsé(e) du groupe",
      defaultLeaveMessage: "⚜️ {userName} {type} du groupe {threadName} à {time} ({session})"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:unsubscribe") return;

    return async function () {
      const { threadID } = event;
      const threadData = await threadsData.get(threadID);
      if (!threadData.settings.sendLeaveMessage) return;

      const { leftParticipantFbId } = event.logMessageData;
      if (leftParticipantFbId === api.getCurrentUserID()) return;

      const hours = getTime("HH");
      const threadName = threadData.threadName;
      const userName = await usersData.getName(leftParticipantFbId);

      let { leaveMessage = getLang("defaultLeaveMessage") } = threadData.data;

      // Définition des mentions si nécessaire
      const form = {
        mentions: leaveMessage.includes("{userNameTag}") ? [{ id: leftParticipantFbId, tag: userName }] : null
      };

      // Remplacement des placeholders
      leaveMessage = leaveMessage
        .replace(/\{userName\}|\{userNameTag\}/g, userName)
        .replace(/\{type\}/g, leftParticipantFbId === event.author ? getLang("leaveType1") : getLang("leaveType2"))
        .replace(/\{threadName\}|\{boxName\}/g, threadName)
        .replace(/\{time\}/g, hours)
        .replace(/\{session\}/g,
          hours <= 10 ? getLang("session1") :
          hours <= 12 ? getLang("session2") :
          hours <= 18 ? getLang("session3") :
          getLang("session4")
        );

      form.body = leaveMessage;

      // Gestion des fichiers attachés
      if (threadData.data.leaveAttachment) {
        const files = threadData.data.leaveAttachment;
        const attachments = files.map(file => drive.getFile(file, "stream"));
        form.attachment = (await Promise.allSettled(attachments))
          .filter(r => r.status === "fulfilled")
          .map(r => r.value);
      }

      message.send(form);
    };
  }
};
