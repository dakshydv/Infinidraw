"use client";
import { useEffect, useRef } from "react";
import { drawInit } from "../draw";

export function Canvas({
  userId,
  roomId,
  socket,
  tool,
}: {
  userId: number;
  roomId: number;
  socket: WebSocket;
  tool: "rect" | "circle" | "line" | "pointer";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawInit(canvasRef.current, userId, roomId, socket, tool);
    }
  }, [canvasRef, tool]);


  return (
    <canvas ref={canvasRef} className="" height={window.innerHeight} width={window.innerWidth}></canvas>
  );
}
