"use client"
import { AuthPage } from "../../../components/AuthPage";

export default function SignIn() {
    return <div className="w-screen h-screen flex items-center justify-center">
        <AuthPage isSignin={true} />
    </div>
}