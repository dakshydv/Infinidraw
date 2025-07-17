import axios from "axios";

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
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");
  let existingShapes: shapes[] = await getExistingShapes(roomId);

  if (!ctx) {
    return;
  }

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === "chat") {
      const parsedData = JSON.parse(message.message);
      existingShapes.push(parsedData);
      clearCanvas(existingShapes, canvas, ctx);
    }
  };

  let clicked = false;
  let startX = 0;
  let startY = 0;
  clearCanvas(existingShapes, canvas, ctx)

  canvas.addEventListener("mousedown", function (e) {
    clicked = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  canvas.addEventListener("mouseup", function (e) {
    clicked = false;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    const shape: shapes = {
        type: "rect",
        x: startX,
        y: startY,
        width,
        height,
    };
    console.log(existingShapes);
    
    existingShapes.push(shape);
    socket.send(
        JSON.stringify({
            type: "CHAT",
            message: JSON.stringify(shape),
            roomId,
            userId,
        })
    );
    clearCanvas(existingShapes, canvas, ctx)
  });

  canvas.addEventListener("mousemove", function (e) {
    if (clicked) {
      const width = e.clientX - startX;
      const length = e.clientY - startY;
      clearCanvas(existingShapes, canvas, ctx);

      ctx.strokeRect(startX, startY, width, length);
      ctx.strokeStyle = "rgb(256, 256, 256)";
    }
  });
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
    console.log(shape.type);
    
    if (shape.type === "rect") {
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      ctx.strokeStyle = "rgb(256, 256, 256)";
    }
  });
}

async function getExistingShapes(roomId: number) {
  try {
    let existinShapes: shapes[] = [];
    const res = await axios.get(`http://localhost:3001/room/shapes/${roomId}`, {
      headers: {
        authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc1Mjc2MDkxN30.olfJhMnGBQQ4wymGvP1c5DbTU3DmVwlCb0GzYnyNDRY",
      },
    });
    const messages = res.data.shapes;

    if (!messages) {
      return [];
    }

    const shapes = messages.map((msg: { message: string }) => {
      const messageData = JSON.parse(msg.message);
      //   return messageData;
      existinShapes.push(messageData);
    });
    return existinShapes;
  } catch (err) {
    console.log(err);
    return [];
  }
}
