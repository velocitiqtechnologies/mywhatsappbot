import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// Environment variables from Render
const VERIFY_TOKEN = "deepanshuToken";   // Meta webhook verify token
const WA_TOKEN = process.env.WA_TOKEN;   // WhatsApp Cloud API token
const PHONE_ID = process.env.PHONE_ID;   // WhatsApp Phone number ID

// ✅ Webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK VERIFIED ✅");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// ✅ Receive WhatsApp messages
app.post("/webhook", async (req, res) => {
  try {
    res.sendStatus(200); // Always respond 200 immediately

    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;
    if (!messages || messages.length === 0) return;

    const message = messages[0];
    const from = message.from; // user's number
    const msgBody = message.text?.body || "";

    let reply = "Hey 👋 I can remind you to things.\nTry: Remind me to drink water at 8 PM";

    const text = msgBody.toLowerCase();

    if (text.startsWith("remind me")) {
      reply = "Got it ✅ I saved that reminder (demo).";
    } else if (text.includes("every") && text.includes("hour")) {
      reply = "Okay — I’ll remind you every hour. (Demo saved)";
    } else if (text === "hi" || text === "hello") {
      reply = "Hey 👋 I can remind you to things.\nTry: Remind me to drink water at 8 PM";
    }

    // Send reply via WhatsApp Cloud API
    const url = `https://graph.facebook.com/v17.0/${PHONE_ID}/messages`;
    const payload = {
      messaging_product: "whatsapp",
      to: from,
      type: "text",
      text: { body: reply }
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WA_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    console.log("Reply sent:", await resp.text());

  } catch (err) {
    console.error("Webhook error:", err);
  }
});

app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));
