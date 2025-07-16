
export enum WsMessageType {
    JOIN = "JOIN",
    LEAVE = "LEAVE",
    USER_JOINED  = "USER_JOINED",
    USER_LEFT = "USER_LEFT",
    EXISTING_SHAPES = "EXISTING_SHAPES",
    CLOSE_ROOM = "CLOSE_ROOM",
    CURSOR_MOVE = "CURSOR_MOVE",
    STREAM_SHAPE = "STREAM_SHAPE",
    STREAM_UPDATE = "STREAM_UPDATE",
    DRAW = "DRAW",
    UPDATE = "UPDATE",
    DELETE = "DELETE" 
}

export interface WebsocketMesage {
    id: number | null,
    type: WsMessageType,
    connectionId: string,
    userId: number | null,
    username: number | null,
    roomId: number,
    message: string | null
    participants: RoomParticipants[] | null,
    timestamp: string | null
}

export interface RoomParticipants {
    userId: number,
    username: number
}