import { WebSocket, WebSocketServer } from "ws";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { MessageType } from "./config";
import { prisma } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET ?? "random";

interface User {
  ws: WebSocket;
  rooms: string[];
  userId: number;
}

const users: User[] = [];

const authenticateUser = (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded === "string" || !decoded.userId) {
      return null;
    }
    const userId = (decoded as JwtPayload).userId;
    return userId;
  } catch (err) {
    return null;
  }
};

const getUser = (ws: WebSocket) => {
  const user = users.find((x) => x.ws === ws);
  return user;
};

wss.on("connection", (ws, req) => {
  const url = req.url;
  if (!url) {
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";

  const userId = authenticateUser(token);

  if (!userId) {
    ws.send(
      JSON.stringify({
        type: "unauthenticated",
        message: "unauthenticated",
      })
    );
    ws.close();
    return;
  }

  users.push({
    ws,
    rooms: [],
    userId,
  });

  ws.on("message", async (data) => {
    const parsedData = JSON.parse(data.toString());

    switch (parsedData.type) {
      case MessageType.JOIN_ROOM:
        {
          try {
            const user = getUser(ws);
            if (!user) {
              console.log("no user exist with this connection");
              return;
            }
            user.rooms.push(parsedData.roomId);
          } catch (err) {
            ws.send(
              JSON.stringify({
                type: "error",
                message: "could not join room",
              })
            );
          }
        }
        break;

      case MessageType.LEAVE_ROOM:
        {
          const user = getUser(ws);
          if (!user) {
            console.log("no user exist with this connection");
            ws.close();
            return;
          }
          user.rooms = user.rooms.filter((x) => x !== parsedData.roomid);
        }
        break;

      case MessageType.CHAT:
        {
          const user = getUser(ws);
          if (!user) {
            console.log("no user exit with this connection");
            ws.close();
            return;
          }

          await prisma.shape.create({
            data: {
                message: parsedData.message,
                userId: user.userId,
                roomId: parsedData.roomId
            }
          })

          const participants = users.filter((user) =>
            user.rooms.includes(parsedData.roomId)
          );
          participants.forEach((participant) => {
            if (participant.ws !== ws) {
              participant.ws.send(
                JSON.stringify({
                  type: MessageType.CHAT,
                  message: parsedData.message,
                  from: user.userId,
                })
              );
            }
          });
        }
        break;

      default:
        {
          console.log("invalid message type");
          return;
        }
        break;
    }
  });
});
