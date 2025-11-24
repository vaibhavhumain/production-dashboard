"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();

    const res = await fetch("https://production-backend-mx0s.onrender.com/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-slate-900 to-black">
      <div className="w-full max-w-md p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl">
        
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="w-full py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-300 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-purple-400 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
