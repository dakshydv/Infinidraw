import dotenv from "dotenv";

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET;

export interface UserShapes {
    id: number;
    message: string;
    userId: number;
    roomId: number;
    createdAt: string;
    updatedAt: string
}