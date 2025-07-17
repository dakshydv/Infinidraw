"use client";
import { useState } from "react";
import { CreateUserSchema, SignInSchema } from "@repo/common/types";
import Link from "next/link";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      if (isSignin) {
        SignInSchema.parse({ email: form.email, password: form.password });
      } else {
        CreateUserSchema.parse({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }
      const endpoint = isSignin ? "signin" : "signup";
      const res = await fetch(`http://localhost:3001/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignin
            ? { email: form.email, password: form.password }
            : { name: form.name, email: form.email, password: form.password }
        ),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Request failed");
      }
      setSuccess(true);
    } catch (err) {
      setError("some error occured, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xs mx-auto my-10 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="font-medium text-xl mb-4 text-center">
        {isSignin ? "Sign In" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isSignin && (
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        )}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          autoComplete="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete={isSignin ? "current-password" : "new-password"}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          } transition-colors`}
        >
          {loading
            ? isSignin
              ? "Signing in..."
              : "Signing up..."
            : isSignin
              ? "Sign In"
              : "Sign Up"}
        </button>
        {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
        {success && (
          <div className="text-green-600 text-sm mt-1">
            {isSignin ? "Signed in!" : "Signed up!"}
          </div>
        )}
      </form>
      <div className="mt-4 text-center text-sm text-gray-600">
        {isSignin ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
