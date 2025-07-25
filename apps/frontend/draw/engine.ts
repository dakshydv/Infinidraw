import { PhoneForwarded } from "lucide-react";
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
    }
  | {
      type: "line";
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    }
  | {
      type: "text";
      text: string;
      style: string;
      x: number;
      y: number;
    }
  | {
      type: "diamond";
      xLeft: number;
      xRight: number;
      yHorizontal: number;
      xVertical: number;
      yTop: number;
      yBottom: number;
    };

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
  private input: HTMLTextAreaElement;
  private mouseDownHanlder: (e: MouseEvent) => void;
  private mouseUpHanlder: (e: MouseEvent) => void;
  private mouseMoveHandler: (e: MouseEvent) => void;
  private mouseClickHandler: (e: MouseEvent) => void;
  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: number,
    socket: WebSocket,
    userId: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.userId = userId;
    this.initHandlers();
    this.initMouseHanlders();
    this.init();
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

  informWsServer(shape: shapes) {
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

  clearCanvas() {
    console.log("clearing canvas");
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#121212";
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

        case "line":
          {
            this.ctx.moveTo(shape.startX, shape.startY);
            this.ctx.lineTo(shape.endX, shape.endY);
            this.ctx.stroke();
          }
          break;

        case "text":
          {
            this.ctx.fillStyle = shape.style;
            this.ctx.font = "24px 'Dancing Script', cursive";
            this.ctx.fillText(shape.text, shape.x, shape.y + 24);
          }
          break;

        case "diamond":
          {
            this.ctx.beginPath();
            this.ctx.moveTo(shape.xLeft, shape.yHorizontal);
            this.ctx.lineTo(shape.xVertical, shape.yTop);
            this.ctx.lineTo(shape.xRight, shape.yHorizontal);
            this.ctx.lineTo(shape.xVertical, shape.yBottom);
            this.ctx.lineTo(shape.xLeft, shape.yHorizontal);
            this.ctx.stroke();
          }
          break;

        default:
          break;
      }
    });
    1;
  }

  initTextDraw(x: number, y: number) {
    this.input = document.createElement("textarea");
    this.input.style.color = "#FFFFFF";
    this.input.autofocus = true;
    this.input.style.left = `${x}px`;
    this.input.style.top = `${y}px`;
    this.input.style.fontSize = "24px";
    Object.assign(this.input.style, {
      position: "absolute",
      display: "inline-block",
      backfaceVisibility: "hidden",
      margin: "0",
      padding: "0",
      border: `1px dotted white`,
      outline: "0",
      resize: "none",
      background: "transparent",
      overflowX: "hidden",
      overflowY: "hidden",
      overflowWrap: "normal",
      boxSizing: "content-box",
      wordBreak: "normal",
      whiteSpace: "pre",
      verticalAlign: "top",
      opacity: "1",
      wrap: "off",
      tabIndex: 0,
      dir: "auto",
      width: "auto",
      minHeight: "auto",
    });
    document.body.appendChild(this.input);
    this.input.addEventListener("blur", () => {
      this.clearCanvas();
      this.ctx.strokeStyle = "rgb(256, 256, 256)";
      this.ctx.fillStyle = "white";
      this.ctx.font = "24px 'Dancing Script', cursive";
      this.ctx.fillText(this.input.value, x, y);
      const shape: shapes = {
        type: "text",
        text: this.input.value,
        style: "white",
        x,
        y,
      };
      this.informWsServer(shape);
      document.body.removeChild(this.input);
    });
    this.selectedTool = null;
  }

  initMouseHanlders() {
    this.mouseClickHandler = (e) => {
      if (this.selectedTool === "text") {
        this.initTextDraw(e.clientX, e.clientY);
      }
    };

    this.mouseDownHanlder = (e) => {
      if (!this.selectedTool) {
        console.log("no tool selected");
        return;
      }
      console.log(`${this.selectedTool} on mouse down in mousehandlers`);
      this.clicked = true;
      this.startX = e.clientX;
      this.startY = e.clientY;
      console.log(`centerX on mousedown is ${e.clientX}`);
      console.log(`centerY on mousedown is ${e.clientY}`);
    };

    this.mouseUpHanlder = (e) => {
      if (!this.selectedTool) {
        console.log("no tool selected");
        return;
      }
      console.log(`${this.selectedTool} on mouseup in mousehandlers`);
      this.clicked = false;
      let shape: shapes | null = null;
      const width = e.clientX - this.startX;
      const height = e.clientY - this.startY;

      console.log(`width on mouseup is ${width}`);
      console.log(`height on mouseup is ${height}`);

      switch (this.selectedTool) {
        case "rect":
          {
            shape = {
              type: "rect",
              x: this.startX,
              y: this.startY,
              width,
              height,
            };
            this.informWsServer(shape);
          }
          break;

        case "circle":
          {
            console.log("circle on mouseup");

            shape = {
              type: "circle",
              centerX: this.startX + width / 2,
              centerY: this.startY + height / 2,
              radius: Math.max(width, height) / 2,
            };
            this.informWsServer(shape);
          }
          break;

        case "line":
          {
            console.log("line on mouseup");

            shape = {
              type: "line",
              startX: this.startX,
              startY: this.startY,
              endX: e.clientX,
              endY: e.clientY,
            };
            this.informWsServer(shape);
          }
          break;
        case "diamond":
          {
            console.log("diamond on mouseup");

            shape = {
              type: "diamond",
              xLeft: this.startX,
              xRight: e.clientX,
              yHorizontal: (this.startY + e.clientY) / 2,
              xVertical: (this.startX + e.clientX) / 2,
              yTop: this.startY,
              yBottom: e.clientY,
            };
            this.informWsServer(shape);
          }
          break;

        default:
          break;
      }
    };

    this.mouseMoveHandler = (e) => {
      if (!this.selectedTool) {
        console.log("no tool selected");
        return;
      }
      console.log(`${this.selectedTool} on mousemove`);

      if (this.clicked) {
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;
        this.clearCanvas();
        this.ctx.strokeStyle = "rgb(256, 256, 256)";
        console.log(`tool in mousemove is ${this.selectedTool}`);
        console.log(`width in mousemove is ${width}`);
        console.log(`height in mousemove is ${height}`);

        if (this.selectedTool === "rect") {
          console.log("rect inside fnctions");
          this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
          console.log("circle inside functions");

          const centerX = this.startX + width / 2;
          const centerY = this.startY + height / 2;
          const radius = Math.max(width, height) / 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.stroke();
          this.ctx.closePath();
        } else if (this.selectedTool === "line") {
          console.log("line inside functions"); // this needs to be deleted later
          this.ctx.moveTo(this.startX, this.startY);
          this.ctx.lineTo(e.clientX, e.clientY);
          this.ctx.stroke();
        } else if (this.selectedTool === "diamond") {
          const xLeft = this.startX;
          const xRight = e.clientX;
          const yHorizontal = (this.startY + e.clientY) / 2;
          const xVertical = (this.startX + e.clientX) / 2;
          const yTop = this.startY;
          const yBottom = e.clientY;

          this.ctx.beginPath();
          this.ctx.moveTo(xLeft, yHorizontal);
          this.ctx.lineTo(xVertical, yTop);
          this.ctx.lineTo(xRight, yHorizontal);
          this.ctx.lineTo(xVertical, yBottom);
          this.ctx.lineTo(xLeft, yHorizontal);
          this.ctx.stroke();
        }
      }
    };

    this.canvas.addEventListener("click", this.mouseClickHandler);
    this.canvas.addEventListener("mousedown", this.mouseDownHanlder);
    this.canvas.addEventListener("mouseup", this.mouseUpHanlder);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  cleanup() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHanlder);
    this.canvas.removeEventListener("mouseup", this.mouseUpHanlder);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }
}
