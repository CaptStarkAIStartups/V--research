"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { FlaskConical } from "lucide-react";

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
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          window.location.href = "/app";
        } else {
          setMessage(
            "Account created. Check your email if confirmation is required."
          );
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
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
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
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        .auth-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px;
          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(34, 211, 238, 0.14),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(59, 130, 246, 0.14),
              transparent 32%
            ),
            #07111f;
          color: #f8fafc;
          font-family:
            Inter,
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .auth-card {
          width: 100%;
          max-width: 980px;
          min-height: 600px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          overflow: hidden;
          border: 1px solid #26364a;
          border-radius: 28px;
          background: #0d1828;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
        }

        .auth-brand {
          padding: 58px 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background:
            linear-gradient(
              145deg,
              rgba(34, 211, 238, 0.12),
              transparent 45%
            ),
            linear-gradient(145deg, #102b3b, #091523);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 70px;
          width: max-content;
          max-width: 100%;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.3px;
          white-space: nowrap;
        }

        .auth-logo-icon {
          width: 52px;
          height: 52px;
          min-width: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: #123447;
          color: #67e8f9;
          border: 1px solid rgba(103, 232, 249, 0.25);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .auth-brand h1 {
          margin: 0 0 20px;
          font-size: clamp(34px, 4vw, 50px);
          line-height: 1.05;
          letter-spacing: -1.8px;
        }

        .auth-brand p {
          max-width: 440px;
          margin: 0;
          color: #a9b8c9;
          font-size: 16px;
          line-height: 1.7;
        }

        .auth-form {
          padding: 58px 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #0b1625;
        }

        .auth-form h2 {
          margin: 0;
          font-size: 30px;
          letter-spacing: -0.8px;
        }

        .auth-subtitle {
          margin: 10px 0 28px;
          color: #91a3b8;
          line-height: 1.5;
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 5px;
          margin-bottom: 24px;
          border-radius: 12px;
          background: #101f31;
          border: 1px solid #223248;
        }

        .auth-tabs button {
          border: 0;
          border-radius: 8px;
          padding: 11px;
          background: transparent;
          color: #91a3b8;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .auth-tabs button.active {
          background: #1b3046;
          color: #ffffff;
        }

        .auth-field {
          margin-bottom: 18px;
        }

        .auth-field label {
          display: block;
          margin-bottom: 8px;
          color: #d8e2ed;
          font-size: 14px;
          font-weight: 600;
        }

        .auth-field input {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border: 1px solid #2a3c52;
          border-radius: 11px;
          outline: none;
          background: #091421;
          color: #ffffff;
          font-size: 15px;
        }

        .auth-field input::placeholder {
          color: #60748b;
        }

        .auth-field input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .auth-submit {
          width: 100%;
          height: 50px;
          margin-top: 4px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(135deg, #0891b2, #2563eb);
          color: white;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .auth-submit:hover {
          transform: translateY(-1px);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .auth-error,
        .auth-message {
          margin-bottom: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .auth-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #fca5a5;
        }

        .auth-message {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #86efac;
        }

        .auth-link {
          align-self: center;
          margin-top: 20px;
          border: 0;
          background: transparent;
          color: #67e8f9;
          font-size: 13px;
          cursor: pointer;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 800px) {
          .auth-card {
            grid-template-columns: 1fr;
            max-width: 560px;
          }

          .auth-brand {
            padding: 34px 32px;
          }

          .auth-logo {
            margin-bottom: 35px;
          }

          .auth-brand h1 {
            font-size: 36px;
          }

          .auth-form {
            padding: 38px 32px;
          }
        }

        @media (max-width: 480px) {
          .auth-page {
            padding: 15px;
          }

          .auth-card {
            border-radius: 20px;
          }

          .auth-brand,
          .auth-form {
            padding: 28px 22px;
          }

          .auth-brand h1 {
            font-size: 31px;
          }

          .auth-logo {
            font-size: 19px;
            gap: 12px;
          }

          .auth-logo-icon {
            width: 46px;
            height: 46px;
            min-width: 46px;
          }
        }
      `}</style>

      <main className="auth-page">
        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">
              <div className="auth-logo-icon">
                <FlaskConical size={24} />
              </div>

              <span>V Research</span>
            </div>

            <h1>
              Research smarter.
              <br />
              Build knowledge.
            </h1>

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
    </>
  );
}
