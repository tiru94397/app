import express from "express";
import { saveMessage, getMessagesBetween, getAllMessages } from "../controllers/messageController.js";

const router = express.Router();

router.post("/messages", saveMessage);
router.get("/messages/all", getAllMessages); // debug
router.get("/messages/:user1/:user2", getMessagesBetween);

export default router;
