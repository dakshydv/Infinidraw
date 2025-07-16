import { NextFunction, Request, Response} from "express"
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { request } from "./config";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req: request, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] ?? "";

    if (!token) {
        res.status(403).json({
            message: "unauthorized"
        })
    }
    

    if (!JWT_SECRET) {
        console.log('could not excess jwt secret');
        return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    

    if (decoded && typeof decoded === "object") {
        req.userId = decoded.userId;
        next();
    } else {
        res.status(403).json({
            message: "unauthorized"
        })
    }
}