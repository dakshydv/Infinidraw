"use client";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { IconButton } from "./IconButton";
import { Circle, Minus, Pointer, RectangleHorizontal } from "lucide-react";
import { Shapes } from "../config/types";

export function RoomCanvas({
  userId,
  roomId,
}: {
  userId: number;
  roomId: number;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [tool, setTool] = useState<Shapes>();

  useEffect(() => {
    const ws = new WebSocket(
      "ws://localhost:8080?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1Mjc2MDkxN30.olfJhMnGBQQ4wymGvP1c5DbTU3DmVwlCb0GzYnyNDRY"
    );

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          roomId,
        })
      );
    };
  }, []);

  if (!socket) {
    return <div>Connecting to server</div>;
  }

  return (
    <div className="relative w-screen h-screen">
      <Canvas userId={userId} roomId={roomId} socket={socket} tool={tool} />
      <div className="fixed right-8 bottom-8 flex-col gap-8  z-10">
        <IconButton
          onClick={() => setTool("rect")}
          selectedTool={tool}
          icon={<RectangleHorizontal />}
          theme={
            tool === "rect" ? "bg-[#333] text-[#fff]" : "bg-[#fff] text-[#333]"
          }
        />
        <IconButton
          onClick={() => setTool("circle")}
          selectedTool={tool}
          icon={<Circle />}
          theme={
            tool === "circle"
              ? "bg-[#333] text-[#fff]"
              : "bg-[#fff] text-[#333]"
          }
        />
        <IconButton
          onClick={() => setTool("pencil")}
          selectedTool={tool}
          icon={<Minus />}
          theme={
            tool === "pencil"
              ? "bg-[#333] text-[#fff]"
              : "bg-[#fff] text-[#333]"
          }
        />
        <IconButton
          onClick={() => setTool("pointer")}
          selectedTool={tool}
          icon={<Pointer />}
          theme={
            tool === "pointer"
              ? "bg-[#333] text-[#fff]"
              : "bg-[#fff] text-[#333]"
          }
        />
      </div>
    </div>
  );
}
