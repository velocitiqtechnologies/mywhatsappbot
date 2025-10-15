import express from "express";
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// ✅ STEP 1: VERIFY WEBHOOK (Facebook)
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = "deepanshuToken"; // ye tu Meta me use karega

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

// ✅ STEP 2: RECEIVE WHATSAPP MESSAGES
app.post("/webhook", (req, res) => {
  console.log("Received message:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Webhook running on port ${PORT}`));

