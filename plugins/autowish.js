const { cmd } = require('../command');

// Auto-wish On/Off තත්ත්වය (Default: true)
let isAutoWishEnabled = true;

// එකම කෙනාට පාරකට වඩා reply නොයැවීමට track කිරීම
const thankedUsers = new Set();

// 🌟 Party Invitation එක යන්න ඕන Special Numbers ලැයිස්තුව (ලංකාවේ Country Code - 94 එකත් එක්ක දාන්න)
const specialNumbers = [
    "94760127262",
    "94765456511"
    // තව නම්බර්ස් තියෙනවා නම් කොමා (,) දාලා මෙතනින් එකතු කරන්න
];

// Party Invitation Image URL එක
const partyImageUrl = "https://i.ibb.co/vvR742Wk/Pink-Black-Glow-in-the-Dark-Club-Party-Poster.jpg";

module.exports = {
    onChat: async (conn, mek, body) => {
        if (!isAutoWishEnabled) return;
        if (!body) return;
        if (mek.key.fromMe) return; // තමන්ගේම මැසේජ් වලට reply නොයැවීමට

        const from = mek.key.remoteJid;
        if (!from || from === "status@broadcast") return;

        // 🎯 මැසේජ් එකේ කොතැන තිබුණත් අහුවෙන Keywords ලැයිස්තුව
        const keywords = [
            "birthday", 
            "happy",
            "bday", 
            "hbd", 
            "upandina", 
            "upanthina", 
            "උපන්දින", 
            "උපන් දිනය"


        ];

        const textMsg = body.toLowerCase();

        // 🔍 මැසේජ් එක ඇතුලේ keyword එකක් තියෙනවාදැයි බලයි
        const isWish = keywords.some(key => textMsg.includes(key));

        if (isWish) {
            // දැනටමත් මේ කෙනාට Thank කරලා නම් ආයේ reply යවන්නේ නැත
            if (thankedUsers.has(from)) return;

            thankedUsers.add(from);

            // 1️⃣ සාමාන්‍ය Auto Reply Text මැසේජ් එක
            const replyMsg = `*Thank you so much* *@${from.split('@')[0]}* *for your wish!! 🫶🏻💗*`;

            try {
                // පළමුව සාමාන්‍ය Thank You Text මැසේජ් එක යැවීම
                await conn.sendMessage(from, { 
                    text: replyMsg, 
                    mentions: [from] 
                }, { quoted: mek });

                // 2️⃣ Special Numbers පරීක්ෂා කිරීම (077... විදියට ආවත් 9477... විදියට හැරවීම)
                const senderNum = from.split('@')[0]; // e.g. "94760127262"
                
                const isSpecial = specialNumbers.some(num => {
                    const cleanNum = num.replace(/[^0-9]/g, "");
                    return senderNum.endsWith(cleanNum.startsWith("0") ? cleanNum.slice(1) : cleanNum);
                });

                // Special Number එකක් නම් Party Invitation Photo එක යැවීම
                if (isSpecial) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // තත්පර 1ක පරතරයක් තැබීම

                    const partyCaption = `🥳 *YOU'RE KINDLY INVITE TO THE PARTY EVENT!* 🎉\n\nHey *@${senderNum}*,  you are warmly invited to my Birthday Party! 🥂✨\n\nCheck out the details in the poster above. See you there! 🎈`;

                    await conn.sendMessage(from, {
                        image: { url: partyImageUrl },
                        caption: partyCaption,
                        mentions: [from]
                    }, { quoted: mek });
                }

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
