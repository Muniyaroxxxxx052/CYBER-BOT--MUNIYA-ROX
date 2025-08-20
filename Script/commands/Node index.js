const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");

const app = express();
app.use(bodyParser.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN; // তোমার Page Access Token
const VERIFY_TOKEN = "your_verify_token"; // তোমার নিজস্ব ভেরিফাই টোকেন

// কমান্ড → ভিডিও লিংক ম্যাপিং
const videoCommands = {
  "!funny1": "https://www.example.com/funny-video1.mp4",
  "!funny2": "https://www.example.com/funny-video2.mp4",
  "!funny3": "https://www.example.com/funny-video3.mp4",
  "!funny4": "https://www.example.com/funny-video4.mp4",
  "!funny5": "https://www.example.com/funny-video5.mp4",
  "!funny6": "https://www.example.com/funny-video6.mp4",
  "!funny7": "https://www.example.com/funny-video7.mp4",
  "!funny8": "https://www.example.com/funny-video8.mp4",
  "!funny9": "https://www.example.com/funny-video9.mp4",
  "!funny10": "https://www.example.com/funny-video10.mp4"
};

// Messenger webhook (POST)
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const webhookEvent = entry.messaging[0];
      const senderId = webhookEvent.sender.id;

      if (webhookEvent.message && webhookEvent.message.text) {
        handleMessage(senderId, webhookEvent.message.text);
      }
    });
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

// Message handler
function handleMessage(senderId, messageText) {
  const text = messageText.trim().toLowerCase();

  if (videoCommands[text]) {
    sendVideo(senderId, videoCommands[text]);
  } else {
    sendText(senderId, "❌ এই কমান্ড চিনতে পারছি না। কমান্ড লিখো যেমন: !funny1");
  }
}

// ভিডিও পাঠানোর ফাংশন
function sendVideo(senderId, videoUrl) {
  const messageData = {
    recipient: { id: senderId },
    message: {
      attachment: {
        type: "video",
        payload: {
          url: videoUrl,
          is_reusable: true
        }
      }
    }
  };
  callSendAPI(messageData);
}

// সাধারণ টেক্সট পাঠানোর ফাংশন
function sendText(senderId, text) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: text }
  };
  callSendAPI(messageData);
}

// Facebook API কল
function callSendAPI(messageData) {
  request(
    {
      uri: "https://graph.facebook.com/v18.0/me/messages",
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: "POST",
      json: messageData
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log("✅ Message sent successfully!");
      } else {
        console.error("❌ Unable to send message:", error || body.error);
      }
    }
  );
}

// Webhook verification (GET)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

app.listen(3000, () => console.log("Bot is running on port 3000"));
