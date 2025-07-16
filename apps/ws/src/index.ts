import { WebSocketServer } from "ws";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "random";

wss.on('connection', (ws, req) => {
    const url = req.url;
    if (!url) {
        return;
    }
    const queryParams = new URLSearchParams(url.split("?")[1])
    const token = queryParams.get('token') || "";
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || typeof decoded === "string" || !decoded.userId) {
        ws.close();
    }
    
    // const userId = decoded.userId;

    ws.on('message', (data) => {
        ws.send('pong')
    })
})