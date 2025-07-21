"use client";
import { useEffect, useRef, useState } from "react";
import { drawInit } from "../draw";
import { Engine } from "../draw/engine";
import { Shapes } from "../config/types";

export function Canvas({
  userId,
  roomId,
  socket,
  tool,
}: {
  userId: number;
  roomId: number;
  socket: WebSocket;
  tool: Shapes;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [engine, setEngine] = useState<Engine>();

  useEffect(() => {
    if (canvasRef.current && tool) {
      const newEngine = new Engine(
        canvasRef.current,
        roomId,
        socket,
        tool,
        userId
      );
      setEngine(newEngine);
    }
  }, [canvasRef.current]);

  useEffect(() => {
    if (engine) {
      engine.setTool(tool);
    }
  }, [tool]);

  return (
    <canvas
      ref={canvasRef}
      className=""
      height={window.innerHeight}
      width={window.innerWidth}
    ></canvas>
  );
}
