"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FlaskConical } from "lucide-react";
import "./auth.css";

type DialogType = "signin" | "signup" | "forgot";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [dialog, setDialog] = useState<DialogType>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (dialog === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

        if (error) throw error;

        if (data.session) {
          window.location.href = "/app";
        } else {
          setMessage("Account created. Check your email if confirmation is required.");
        }
      }

      if (dialog === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        window.location.href = "/app";
      }

      if (dialog === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;

        setMessage("Password reset instructions have been sent.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const title =
    dialog === "signup"
      ? "Create your account"
      : dialog === "forgot"
        ? "Reset your password"
        : "Welcome back";

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <FlaskConical size={23} />
            </div>
            <span>V Research</span>
          </div>

          <h1>Research smarter.<br />Build knowledge.</h1>

          <p>
            Your dedicated research workspace for projects, datasets,
            articles, notes and discoveries.
          </p>
        </div>

        <div className="auth-form">
          <h2>{title}</h2>

          <p className="auth-subtitle">
            {dialog === "signup"
              ? "Create your V Research workspace."
              : dialog === "forgot"
                ? "Enter your email to reset your password."
                : "Sign in to continue to your research workspace."}
          </p>

          <div className="auth-tabs">
            <button
              className={dialog === "signin" ? "active" : ""}
              onClick={() => {
                setDialog("signin");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              Sign in
            </button>

            <button
              className={dialog === "signup" ? "active" : ""}
              onClick={() => {
                setDialog("signup");
                setError("");
                setMessage("");
              }}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={submit}>
            {dialog === "signup" && (
              <div className="auth-field">
                <label>Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {dialog !== "forgot" && (
              <div className="auth-field">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-message">{message}</div>}

            <button className="auth-submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : dialog === "signup"
                  ? "Create account"
                  : dialog === "forgot"
                    ? "Send reset link"
                    : "Sign in"}
            </button>
          </form>

          {dialog === "signin" && (
            <button
              className="auth-link"
              type="button"
              onClick={() => {
                setDialog("forgot");
                setError("");
                setMessage("");
              }}
            >
              Forgot password?
            </button>
          )}

          {dialog === "forgot" && (
            <button
              className="auth-link"
              type="button"
              onClick={() => {
                setDialog("signin");
                setError("");
                setMessage("");
              }}
            >
              ← Back to sign in
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
