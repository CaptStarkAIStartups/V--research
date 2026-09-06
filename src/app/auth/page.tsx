use client";

import { FormEvent, useState } from "react";
import {
  Beaker,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseBrowserClient();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!email.trim() || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        window.location.replace("/");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.replace("/");
        return;
      }

      setMessage(
        "Account created. Check your email if confirmation is required."
      );
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-background-orb auth-orb-one" />
      <div className="auth-background-orb auth-orb-two" />

      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <Beaker size={28} />
          </div>

          <div>
            <div className="auth-title">V Research</div>
            <div className="auth-subtitle">
              Research Command Center
            </div>
          </div>
        </div>

        <div className="auth-intro">
          <div className="auth-badge">
            <Sparkles size={15} />
            Secure Research Workspace
          </div>

          <h1>
            {mode === "login"
              ? "Welcome back."
              : "Create your workspace."}
          </h1>

          <p>
            {mode === "login"
              ? "Sign in to continue your research journey."
              : "Create an account to sync your V Research workspace."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label className="auth-field">
              <span>Name</span>

              <div className="auth-input-wrapper">
                <Sparkles size={18} />

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </div>
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>

            <div className="auth-input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>

            <div className="auth-input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "login"
                    ? "current-password"
                    : "new-password"
                }
              />
            </div>
          </label>

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Connecting..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}
        </form>

        <div className="auth-divider">
          <span />
          <p>
            {mode === "login"
              ? "New to V Research?"
              : "Already have an account?"}
          </p>
          <span />
        </div>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setMode((current) =>
              current === "login" ? "signup" : "login"
            );
            setMessage("");
          }}
        >
          {mode === "login"
            ? "Create a new account"
            : "Sign in instead"}
        </button>

        <div className="auth-security">
          <ShieldCheck size={17} />

          <span>
            Your research data is protected by Supabase
            authentication and database security policies.
          </span>
        </div>
      </section>
    </main>
  );
}
