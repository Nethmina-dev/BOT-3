const { cmd } = require('../command');

// Auto-wish On/Off තත්ත්වය (Default: true)
let isAutoWishEnabled = true;

// එකම කෙනාට පාරකට වඩා reply නොයැවීමට track කිරීම
const thankedUsers = new Set();

module.exports = {
    onChat: async (conn, mek, body) => {
        if (!isAutoWishEnabled) return;
        if (!body) return;
        if (mek.key.fromMe) return; // තමන්ගේම මැසේජ් වලට reply නොයැවීමට

        const from = mek.key.remoteJid;
        if (!from || from === "status@broadcast") return;

        // Emojis, Punctuation, Extra spaces, Line breaks තිබ්බත් අහුවෙන Regex patterns
        const wishPatterns = [
            /happy\s*birth\s*day/i,
            /happy\s*b\s*day/i,
            /\bhbd\b/i,
            /many\s*happy\s*returns/i,
            /suba\s*upan\s*dinayak/i,
            /suba\s*upan\s*thinayak/i,
            /සුබ\s*උපන්\s*දින/i,
            /සුභ\s*උපන්\s*දින/i
        ];

        const textMsg = body.toLowerCase();
        
        // මැසේජ් එකේ ඕනෑම තැනක උඩ pattern එකක් තියෙනවාදැයි පරීක්ෂා කිරීම
        const isWish = wishPatterns.some(pattern => pattern.test(textMsg));

        if (isWish) {
            // දැනටමත් මේ කෙනාට Thank කරලා නම් ආයේ reply යවන්නේ නැත
            if (thankedUsers.has(from)) return;

            thankedUsers.add(from);

            // Auto Reply මැසේජ් එක
            const replyMsg = `❤️ *THANK YOU SO MUCH!* 🎉\n\nThank you so much, *@${from.split('@')[0]}* for the lovely birthday wish! It really made my day special. 🥰✨`;

            try {
                await conn.sendMessage(from, { 
                    text: replyMsg, 
                    mentions: [from] 
                }, { quoted: mek });
            } catch (err) {
                console.error("Auto Wish Error:", err);
            }
        }
    }
};

// =======================================================
// 🎛️ COMMAND TO TOGGLE AUTO WISH (ON / OFF)
// =======================================================
cmd({
    pattern: "autowish",
    desc: "Turn auto-reply for birthday wishes on or off",
    category: "owner",
    filename: __filename
}, async (conn, mek, sms, { from, q, isOwner }) => {
    if (!isOwner) return conn.sendMessage(from, { text: "❌ This command is only for the Bot Owner!" }, { quoted: mek });

    if (!q) return conn.sendMessage(from, { text: "ℹ️ Please specify 'on' or 'off'.\nExample: `.autowish on` or `.autowish off`" }, { quoted: mek });

    const mode = q.trim().toLowerCase();
    if (mode === "on") {
        isAutoWishEnabled = true;
        return conn.sendMessage(from, { text: "✅ Auto Birthday Wish Reply feature is now *ENABLED*." }, { quoted: mek });
    } else if (mode === "off") {
        isAutoWishEnabled = false;
        return conn.sendMessage(from, { text: "❌ Auto Birthday Wish Reply feature is now *DISABLED*." }, { quoted: mek });
    } else {
        return conn.sendMessage(from, { text: "❌ Invalid input! Use `.autowish on` or `.autowish off`" }, { quoted: mek });
    }
});
