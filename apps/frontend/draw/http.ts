import axios from "axios";
import { shapes } from "./engine";

export async function getExistingShapes(roomId: number) {
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
