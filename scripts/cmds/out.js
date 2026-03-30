module.exports = {
  config: {
    name: "out",
    aliases: ["leave"],
    version: "1.0 🌙⚽👑",
    author: "Christus",
    countDown: 5,
    role: 3,
    shortDescription: {
      fr: "Le bot quitte le groupe avec style royal",
    },
    category: "owner",
    guide: {
      fr: "{pn} — Faire quitter le bot de ce groupe"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // Message de départ royal
      await api.sendMessage(
        "👑 Pour la gloire du Football 🌙⚽, je quitte ce groupe...\n💌 Prenez soin de vous tous et que le meilleur gagne ⚽✨",
        event.threadID
      );

      // Retrait du bot après un délai
      setTimeout(() => {
        api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
      }, 500);
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ Impossible de quitter le groupe.", event.threadID);
    }
  }
};
