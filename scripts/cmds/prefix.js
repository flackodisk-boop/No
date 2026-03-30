const fs = require("fs-extra");
const { utils } = global;

module.exports = {
	config: {
		name: "prefix",
		version: "1.4 🌙⚽👑",
		author: "NTKhang / Christus",
		countDown: 5,
		role: 0,
		description: "Changer le préfixe du bot dans votre groupe ou système (admins seulement) 🌙⚽",
		category: "config",
		guide: {
			fr: "   {pn} <nouveau préfixe> : change le préfixe dans votre groupe\n"
				+ "   Exemple :\n"
				+ "    {pn} #\n\n"
				+ "   {pn} <nouveau préfixe> -g : change le préfixe dans tout le système du bot (admin seulement)\n"
				+ "   Exemple :\n"
				+ "    {pn} # -g\n\n"
				+ "   {pn} reset : réinitialise le préfixe de votre groupe à celui par défaut"
		}
	},

	langs: {
		fr: {
			reset: "✅ Votre préfixe a été réinitialisé au préfixe par défaut : %1 🌙⚽",
			onlyAdmin: "⚠️ Seul un admin bot peut changer le préfixe système 🌙",
			confirmGlobal: "Réagissez à ce message pour confirmer le changement du préfixe système 🌌",
			confirmThisThread: "Réagissez à ce message pour confirmer le changement du préfixe de ce groupe ⚽",
			successGlobal: "✅ Le préfixe système a été changé en : %1 🌙⚽",
			successThisThread: "✅ Le préfixe de ce groupe a été changé en : %1 ⚽",
			myPrefix: "👋 Salut %1, tu m’as demandé mon préfixe ?\n➥ 🌐 Système : %2\n➥ 💬 Ce groupe : %3\nJe suis %4 à ton service 🌙⚽"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0])
			return message.SyntaxError();

		if (args[0] === 'reset') {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply(getLang("reset", global.GoatBot.config.prefix));
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix
		};

		if (args[1] === "-g") {
			if (role < 2)
				return message.reply(getLang("onlyAdmin"));
			else
				formSet.setGlobal = true;
		} else
			formSet.setGlobal = false;

		return message.reply(args[1] === "-g" ? getLang("confirmGlobal") : getLang("confirmThisThread"), (err, info) => {
			formSet.messageID = info.messageID;
			global.GoatBot.onReaction.set(info.messageID, formSet);
		});
	},

	onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
		const { author, newPrefix, setGlobal } = Reaction;
		if (event.userID !== author)
			return;
		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message, getLang, usersData }) {
		if (event.body && event.body.toLowerCase() === "prefix")
			return async () => {
				const userName = await usersData.getName(event.senderID);
				const botName = global.GoatBot.config.nickNameBot || "Bot";
				return message.reply(getLang("myPrefix", userName, global.GoatBot.config.prefix, utils.getPrefix(event.threadID), botName));
			};
	}
};
