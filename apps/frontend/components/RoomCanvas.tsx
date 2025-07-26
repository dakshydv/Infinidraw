"use client";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { IconButton } from "./IconButton";
import {
  Circle,
  Diamond,
  Minus,
  Pencil,
  Pointer,
  RectangleHorizontal,
  Type,
} from "lucide-react";
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
      {tool ? (
        <Canvas userId={userId} roomId={roomId} socket={socket} tool={tool} />
      ) : (
        <div className="bg-[#121212] w-screen h-screen text-white text-3xl">
          Welcome to Infinidraw
        </div>
      )}
      <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-[#23232a] backdrop-blur-sm rounded-lg py-2 px-3 flex gap-1">
          <IconButton
            onClick={() => setTool("pointer")}
            selectedTool={tool}
            icon={<Pointer size={18} />}
            theme={tool === "pointer" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("rect")}
            selectedTool={tool}
            icon={<RectangleHorizontal size={18} fill={tool === "rect" ? "#FFFFFF" : ""} />}
            theme={tool === "rect" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("diamond")}
            selectedTool={tool}
            icon={<Diamond size={18} fill={tool === "diamond" ? "#FFFFFF" : ""} />}
            theme={tool === "diamond" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("circle")}
            selectedTool={tool}
            icon={<Circle size={18} fill={tool === "circle" ? "#FFFFFF" : ""} />}
            theme={tool === "circle" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("line")}
            selectedTool={tool}
            icon={<Minus size={18} fill={tool === "line" ? "#FFFFFF" : ""} />}
            theme={tool === "line" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("pencil")}
            selectedTool={tool}
            icon={<Pencil size={18} fill={tool === "pencil" ? "#FFFFFF" : ""} />}
            theme={tool === "pencil" ? "bg-[#403e6a] text-white" : "text-white"}
          />
          <IconButton
            onClick={() => setTool("text")}
            selectedTool={tool}
            icon={<Type size={18} fill={tool === "text" ? "#FFFFFF" : ""} />}
            theme={tool === "text" ? "bg-[#403e6a] text-white" : "text-white"}
          />
        </div>
      </div>
    </div>
  );
}
