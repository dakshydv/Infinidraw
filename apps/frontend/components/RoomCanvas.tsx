"use client";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({ userId, roomId }: { userId: number, roomId: number }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1Mjc2MDkxN30.olfJhMnGBQQ4wymGvP1c5DbTU3DmVwlCb0GzYnyNDRY");

    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type: "JOIN_ROOM",
        roomId
      }))
    };
  }, []);

  if (!socket) {
    return <div>Connecting to server</div>;
  }

  return <Canvas userId={userId} roomId={roomId} socket={socket} />;
}
