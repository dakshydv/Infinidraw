import express from "express";
import { prisma } from "@repo/db/client"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { request } from "./config";
import { middleware } from "./middleware";
import { JWT_SECRET } from "@repo/common/config"
import { CreateUserSchema, SignInSchema } from "@repo/common/types";

const app = express();
app.use(express.json());
dotenv.config();

app.post('/signup', async (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);

    if (!data.success) {
        res.json({
            message: "invalid credentials"
        })
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.json({
            message: 'please provide all credentails'
        });
        return;
    }

    const existingUser = await prisma.user.findFirst({
        where: {
            email
        }
    })

    if (existingUser) {
        res.json({
            message: "user already exists, please sign in"
        });
        return;
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    if (!hashedPassword) {
        console.log('could not hash password');
        return;
    }

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    })

    if (!user) {
        res.json({
            message: "could not create user"
        });
        return;
    }

    res.json({
        message: "user signed up successfully"
    });
})


app.post('/signin', async (req, res) => {
    const data = SignInSchema.safeParse(req.body);

    if (data.success) {
        res.json({
            message: "invalid credentials"
        })
    }

    const { email, password } = req.body;

    if (!email || !password) {
        res.json({
            message: "please provide all required credentials"
        });
        return;
    }

    const user = await prisma.user.findFirst({
        where: {
            email
        }
    });

    if (!user) {
        res.json({
            message: "user does not exist, please sign up"
        });
        return;
    }

    const isPasswordCorrect = bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        res.json({
            message: "incorrect password"
        });
        return;
    }

    if (!JWT_SECRET) {
        console.log('could not excess jwt secret');
        return;
    }

    const token = jwt.sign({
        uesrId: user.id
    }, JWT_SECRET);

    res.json({
        message: "user signed in successfully",
        token
    });
})

app.post('/room', middleware, (req: request, res) => {
    res.json({
        userId: req.userId
    })
})


app.listen(3000, () => {
    console.log('express app runing on port 3000');
})