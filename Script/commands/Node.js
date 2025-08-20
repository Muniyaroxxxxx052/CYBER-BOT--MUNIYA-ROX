const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const app = express();
app.use(bodyParser.json());
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = "your_verify_token"; 
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
function handleMessage(senderId, messageText) {
  const text = messageText.trim().toLowerCase();
  if (videoCommands[text]) {
    sendVideo(senderId, videoCommands[text]);
  } else {
    sendText(senderId, "❌ এই কমান্ড আমি চিনতে পারছি না! টেস্ট করতে কমান্ড লিখো যেমন !funny1");
  }
}
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
function sendText(senderId, text) {
  const messageData = {
    recipient: { id: senderId },
    message: { text: text }
  };
  callSendAPI(messageData);
}
function callSendAPI(messageData) {
  request(
    {
