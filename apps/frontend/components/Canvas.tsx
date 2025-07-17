"use client";
import { useEffect, useRef } from "react";
import { drawInit } from "../draw";

export function Canvas({ userId, roomId, socket }: { userId:number, roomId: number, socket: WebSocket }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawInit(canvasRef.current, userId, roomId, socket);
    }
  }, [canvasRef]);

  return (
    <canvas ref={canvasRef} className="" height={1080} width={1080}></canvas>
  );
}
