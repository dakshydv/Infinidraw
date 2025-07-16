import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common/config"

const wss = new WebSocketServer({ port: 8080 });
dotenv.config();

wss.on('connection', (ws, req) => {
    const url = req.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split("?")[1])
    const token = queryParams.get('token') || "";
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
        ws.close();
    }

    ws.on('message', (data) => {
        ws.send('pong')
    })
})