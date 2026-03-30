/**
 * @French – Style Royal France / Football 🌙⚽👑
 * Ce module gère les événements de groupe comme l'arrivée d'un nouveau membre.
 * Les messages sont stylés et incluent le nom du groupe et l'identifiant Facebook du membre.
 */

module.exports = {
  config: {
    name: "welcome", // Nom de la commande
    version: "1.0 🌙⚽👑", // Version
    author: "NTKhang", // Auteur
    category: "événements" // Catégorie
  },

  langs: {
    fr: {
      hello: "👑 Bienvenue dans le groupe !",
      helloWithName: "⚽ Bonjour %1 ! Ton ID Facebook est %2.\n🏷️ Groupe : %3\n💡 Administrateur : %4"
    }
  },

  // Fonction exécutée quand un événement arrive dans le groupe
  onStart: async function ({
    api, usersData, threadsData, message, event, threadModel, role, getLang
  }) {
    // Vérifie si un utilisateur rejoint le groupe
    if (event.logMessageType === "log:subscribe") {
      const addedUser = event.logMessageData.addedParticipants[0];
      const userName = addedUser.fullName;
      const userID = addedUser.id || addedUser.userID;

      let groupName = "Groupe inconnu";
      try {
        const threadInfo = await api.getThreadInfo(event.threadID);
        groupName = threadInfo.threadName || groupName;
      } catch {}

      const adminNames = (await usersData.getAll())
        .filter(u => u.role === 2)
        .map(u => u.name)
        .join(", ") || "Aucun administrateur";

      // Message stylé royal football
      const welcomeMessage = getLang("helloWithName", userName, userID, groupName, adminNames);

      api.sendMessage(welcomeMessage, event.threadID);
    }
  }
};
