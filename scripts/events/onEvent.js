const allOnEvent = global.GoatBot.onEvent;

module.exports = {
  config: {
    name: "onEvent",
    version: "1.1 🌙⚽👑",
    author: "NTKhang",
    description: "Boucle sur tous les événements dans global.GoatBot.onEvent et les exécute pour chaque nouvel événement",
    category: "événements"
  },

  onStart: async ({ api, args, message, event, threadsData, usersData, dashBoardData, threadModel, userModel, dashBoardModel, role, commandName }) => {
    for (const item of allOnEvent) {
      if (typeof item === "string")
        continue; // Ignorer si c'est une chaîne, ce sont les noms de commandes exécutées ailleurs
      item.onStart({
        api,
        args,
        message,
        event,
        threadsData,
        usersData,
        threadModel,
        dashBoardData,
        userModel,
        dashBoardModel,
        role,
        commandName
      });
    }
  }
};
