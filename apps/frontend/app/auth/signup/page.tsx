"use client"
import { AuthPage } from "../../../components/AuthPage";

export default function SignUp() {
    return <div className="flex items-center justify-center w-screen">
        <AuthPage isSignin={false} />
    </div>
}