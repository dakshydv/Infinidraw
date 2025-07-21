import { Shapes } from "../config/types";
import { getExistingShapes } from "./http";

export type shapes =
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

// export enum selectedToolType {
//   rect = "rect",
//   circle = "cirle",
//   pencil = "pencil",
//   pointer = "pointer",
// }

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: shapes[];
  private roomId: number;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Shapes;
  private userId: number;
  private mouseDownHanlder: (e: MouseEvent) => void;
  private mouseUpHanlder: (e: MouseEvent) => void;
  private mouseMoveHandler: (e: MouseEvent) => void;
  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: number,
    socket: WebSocket,
    selectedTool: Shapes,
    userId: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.selectedTool = selectedTool;
    this.userId = userId;
    this.init();
    this.initHandlers();
    this.initMouseHanlders();
  }

  public setTool(tool: Shapes) {
    this.selectedTool = tool;
    console.log(`tool changed to ${tool}`);
  }

  async init() {
    console.log("engine intialized");
    console.log(`selected tool in this.init is ${this.selectedTool}`);
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  async initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "CHAT") {
        const parsedData = JSON.parse(message.message);
        this.existingShapes.push(parsedData);
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    console.log("clearing canvas");
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.map((shape) => {
      this.ctx.strokeStyle = "rgb(256, 256, 256)";

      switch (shape.type) {
        case "rect":
          {
            this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
          }
          break;

        case "circle":
          {
            this.ctx.beginPath();
            this.ctx.arc(
              shape.centerX,
              shape.centerY,
              shape.radius,
              0,
              Math.PI * 2
            );
            this.ctx.stroke();
          }
          break;

        default:
          break;
      }
    });
    1;
  }

  initMouseHanlders() {
    this.mouseDownHanlder = (e) => {
      console.log(`${this.selectedTool} on mouse down in mousehandlers`);
      this.clicked = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      console.log(`centerX on mousedown is ${e.clientX}`);
      console.log(`centerY on mousedown is ${e.clientY}`);
    }

    this.mouseUpHanlder = (e) => {
      console.log(`${this.selectedTool} on mouseup in mousehandlers`);
      this.clicked = false;
      let shape: shapes | null = null;
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

      console.log(`width on mouseup is ${width}`);
      console.log(`height on mouseup is ${height}`);

      switch (this.selectedTool) {
        case "rect":
          console.log(`tool in mouseup in mousehandlers is rect`);
          {
            shape = {
              type: "rect",
              x: this.startX,
              y: this.startY,
              width,
              height,
            };
            this.existingShapes.push(shape);
            this.socket.send(
              JSON.stringify({
                type: "CHAT",
                message: JSON.stringify(shape),
                roomId: this.roomId,
                userId: this.userId,
              })
            );
            this.clearCanvas();
          }
          break;

        case "circle":
          {
            console.log("circle on mouseup");

            shape = {
              type: "circle",
              centerX: this.startX + width / 2,
              centerY: this.startY + length / 2,
              radius: Math.max(width, length) / 2,
            };
            this.existingShapes.push(shape)
            console.log(shape);
            this.socket.send(
              JSON.stringify({
                type: "CHAT",
                message: JSON.stringify(shape),
                roomId: this.roomId,
                userId: this.userId,
              })
            );
            this.clearCanvas();
          }
          break;

        default:
          break;
      }
    }

    this.mouseMoveHandler = (e) => {
      console.log(`${this.selectedTool} on mousemove`);

      if (this.clicked) {
        const width = e.clientX - this.startX;
        const length = e.clientY - this.startY;
        this.clearCanvas();
        this.ctx.strokeStyle = "rgb(256, 256, 256)";
        console.log(`tool in mousemove is ${this.selectedTool}`);
        console.log(`width in mousemove is ${width}`);
        console.log(`length in mousemove is ${length}`);

        if (this.selectedTool === "rect") {
          console.log("rect inside fnctions");
          this.ctx.strokeRect(this.startX, this.startY, width, length);
        } else if (this.selectedTool === "circle") {
          console.log("circle inside functions");

          const centerX = this.startX + width / 2;
          const centerY = this.startY + length / 2;
          const radius = Math.max(width, length) / 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (this.selectedTool === "pencil") {
          // TODO: Implement line preview
        } else if (this.selectedTool === "pointer") {
          // TODO: Implement pointer preview
        }
      }
    }

    this.canvas.addEventListener("mousedown", this.mouseDownHanlder);
    this.canvas.addEventListener("mouseup", this.mouseUpHanlder);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  cleanUp() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHanlder);
    this.canvas.removeEventListener("mouseup", this.mouseUpHanlder);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }
}
