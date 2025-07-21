import axios from "axios";
import { getExistingShapes } from "./http";

type shapes =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export async function drawInit(
  canvas: HTMLCanvasElement,
  userId: number,
  roomId: number,
  socket: WebSocket,
  tool: "rect" | "circle" | "line" | "pointer"
) {
  const ctx = canvas.getContext("2d");
  let existingShapes: shapes[] = await getExistingShapes(roomId); 
  const currentTool = tool
  console.log(`tool in outer draw init : ${currentTool}`);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "CHAT") {
      const parsedData = JSON.parse(message.message);
      console.log(parsedData);
      existingShapes.push(parsedData);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  let clicked = false;
  let startX = 0;
  let startY = 0;
  clearCanvas(existingShapes, canvas, ctx);
  
  function onMouseDown(e) {
    console.log(`tool on mouse down is ${tool}`);
    
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  }

  function onMouseUp(e) {
    console.log(`tool on mouseUp is ${tool}`);
    
    clicked = false;
    let shape: shapes | null = null;
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);
    
    switch (currentTool) {
      case "rect":
        console.log(`tool in mouseup is rect`);
        {
          shape = {
            type: "rect",
            x: startX,
            y: startY,
            width,
            height,
          };
          console.log(shape);
          existingShapes.push(shape);
          socket.send(
            JSON.stringify({
              type: "CHAT",
              message: JSON.stringify(shape),
              roomId,
              userId,
            })
          );
          clearCanvas(existingShapes, canvas, ctx);
        }
        break;

      case "circle":
        {
          console.log("circle on mouseup");

          shape = {
            type: "circle",
            centerX: startX + width / 2,
            centerY: startY + length / 2,
            radius: Math.max(width, length) / 2,
          };
          console.log(shape);
          socket.send(
            JSON.stringify({
              type: "CHAT",
              message: JSON.stringify(shape),
              roomId,
              userId,
            })
          );
          clearCanvas(existingShapes, canvas, ctx);
        }
        break;

      default:
        break;
    }
  }

  function onMouseMove(e) {
    console.log(`tool on mouse move is ${tool}`);
    
    if (clicked) {
      const width = Math.abs(e.clientX - startX);
      const length = Math.abs(e.clientY - startY);
      clearCanvas(existingShapes, canvas, ctx);
      ctx.strokeStyle = "rgb(256, 256, 256)";
      console.log(`tool in mousemove is ${currentTool}`);

      if (currentTool === "rect") {
        ctx.strokeRect(startX, startY, width, length);
      } else if (currentTool === "circle") {
        console.log("circle on mouse move");

        const centerX = startX + width / 2;
        const centerY = startY + length / 2;
        const radius = Math.max(width, length) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      } else if (currentTool === "line") {
        // TODO: Implement line preview
      } else if (currentTool === "pointer") {
        // TODO: Implement pointer preview
      }
    }
  }

  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mousemove", onMouseMove);
  return () => {
    canvas.removeEventListener("mousedown", onMouseDown);
    canvas.removeEventListener("mouseup", onMouseUp);
    canvas.removeEventListener("mousemove", onMouseMove);
  };
}

function clearCanvas(
  exsitingShapes: shapes[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  exsitingShapes.map((shape) => {
    ctx.strokeStyle = "rgb(256, 256, 256)";

    switch (shape.type) {
      case "rect":
        {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
        break;

      case "circle":
        {
          ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        }
        break;

      default:
        break;
    }
  });
}


