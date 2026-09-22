const { cmd } = require('../command');
const axios = require('axios');

// Auto-wish On/Off තත්ත්වය (Default: true)
let isAutoWishEnabled = true;

// එකම කෙනාට පාරකට වඩා reply නොයැවීමට track කිරීම
const thankedUsers = new Set();

// 🌟 Party Invitation එක යන්න ඕන Special Numbers ලැයිස්තුව
const specialNumbers = [
    "94760127262",
    "94740565270",
    "94741144592"
];

// Party Invitation Image URL එක
const partyImageUrl = "https://ibb.co/DgTxf3FQ";

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
            "happy birthday",
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
            // 👤 ගෲප් එකක වුනත් හරියටම මැසේජ් එක එව්ව කෙනාගේ JID එක ලබාගැනීම
            const senderJid = mek.key.participant || from;

            // දැනටමත් මේ කෙනාට Thank කරලා නම් ආයේ reply යවන්නේ නැත
            if (thankedUsers.has(senderJid)) return;

            thankedUsers.add(senderJid);

            try {
                // 👁️ 1. මැසේජ් එක Auto Seen (Read) කිරීම
                await conn.readMessages([mek.key]).catch(() => {});

                // 2. සාමාන්‍ය Auto Reply Text මැසේජ් එක
                const replyMsg = `*Thank you so much* *@${senderJid.split('@')[0]}* *for your wish!! 🫶🏻💗*`;

                await conn.sendMessage(from, { 
                    text: replyMsg, 
                    mentions: [senderJid] 
                }, { quoted: mek });

                // 3. Special Numbers පරීක්ෂා කිරීම
                const senderNum = senderJid.split('@')[0].replace(/[^0-9]/g, ""); 
                
                const isSpecial = specialNumbers.some(num => {
                    const cleanNum = num.replace(/[^0-9]/g, "").replace(/^0/, "");
                    return senderNum.endsWith(cleanNum);
                });

                // Special Number එකක් නම් Party Invitation Photo එක යැවීම
                if (isSpecial) {
                    await new Promise(resolve => setTimeout(resolve, 1500)); // තත්පර 1.5ක පරතරයක්

                    const partyCaption = `🥳 *YOU'RE KINDLY INVITED TO THE PARTY EVENT!* 🎉\n\nHey *@${senderNum}*, you are warmly invited to my Birthday Party! 🥂✨\n\nCheck out the details in the poster above. See you there! 🎈`;

                    // 🖼️ Image එක Buffer එකක් විදිහට Download කරලා යැවීම (100% Reliable)
                    try {
                        const response = await axios.get(partyImageUrl, { responseType: 'arraybuffer' });
                        const imgBuffer = Buffer.from(response.data, 'utf-8');

                        await conn.sendMessage(from, {
                            image: imgBuffer,
                            caption: partyCaption,
                            mentions: [senderJid]
                        }, { quoted: mek });
                    } catch (imgErr) {
                        // Buffer එක අවුල් වුනොත් direct URL එකෙන් යැවීමට fallback වීම
                        await conn.sendMessage(from, {
                            image: { url: partyImageUrl },
                            caption: partyCaption,
                            mentions: [senderJid]
                        }, { quoted: mek });
                    }
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
