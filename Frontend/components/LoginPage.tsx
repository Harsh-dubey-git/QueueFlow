import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "../constants";
import Card from "./common/Card";
import Button from "./common/Button";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setError("");
        onLoginSuccess();
      } else {
        setError("Invalid username or password.");
      }
    },
    [username, password, onLoginSuccess]
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden px-4">
      {/* Animated gradient backdrop */}
      <motion.div
        className="absolute inset-0 opacity-40"
        animate={{
          background: [
            "radial-gradient(circle at 30% 20%, rgba(37,99,235,0.15), transparent 60%)",
            "radial-gradient(circle at 70% 80%, rgba(16,185,129,0.15), transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.15), transparent 60%)",
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card>
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              🏥
            </motion.div>
            <h1 className="text-2xl font-bold text-slate-800 mt-3">
              Staff Login
            </h1>
            <p className="text-sm text-slate-500">
              Manage patient queues efficiently
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="password123"
              />
            </div>

            {/* Error Message */}
            <AnimateErrorMessage error={error} />

            <Button type="submit" fullWidth className="text-lg py-3">
              Login
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <a
              href="/"
              className="text-blue-600 hover:underline transition-colors"
            >
              ← Back to Home
            </a>
            <p className="mt-2 text-xs text-gray-400">
              © 2025 QueueFlow | Smart Queueing for Hospitals
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

// Smooth fade-in error animation
const AnimateErrorMessage: React.FC<{ error: string }> = ({ error }) => {
  if (!error) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="text-sm text-red-600 text-center font-medium"
    >
      {error}
    </motion.p>
  );
};

export default LoginPage;
