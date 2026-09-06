"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowRight,
  Eye,
  EyeOff,
  FlaskConical,
  Lock,
  Mail,
  User,
  X,
} from "lucide-react";

type DialogType = "signin" | "signup" | "forgot" | null;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export default function AuthPage() {
  const [dialog, setDialog] = useState<DialogType>("signin");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function resetMessages() {
    setMessage("");
    setError("");
  }

  function openDialog(type: DialogType) {
    resetMessages();
    setDialog(type);
    setPassword("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    resetMessages();

    if (!supabase) {
      setError(
        "Supabase is not configured. Please check the environment variables."
      );
      return;
    }

    setLoading(true);

    try {
      if (dialog === "signup") {
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        if (data.session) {
          window.location.href = "/app";
        } else {
          setMessage(
            "Account created. Please check your email if email confirmation is enabled."
          );
        }
      }

      if (dialog === "signin") {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (data.session) {
          window.location.href = "/app";
        }
      }

      if (dialog === "forgot") {
        const { error: resetError } =
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth`,
          });

        if (resetError) {
          throw resetError;
        }

        setMessage(
          "If an account exists for this email, a password-reset link has been sent."
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const title =
    dialog === "signup"
      ? "Create your account"
      : dialog === "forgot"
        ? "Reset your password"
        : "Welcome back";

  const subtitle =
    dialog === "signup"
      ? "Create your V Research workspace."
      : dialog === "forgot"
        ? "Enter your email to receive a reset link."
        : "Sign in to continue your research.";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[320px] w-[320px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-140px] right-[-100px] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-10">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl md:grid-cols-2">
          <div className="hidden flex-col justify-between bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 p-10 md:flex">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
                  <FlaskConical className="h-6 w-6 text-cyan-300" />
                </div>

                <div>
                  <h1 className="text-xl font-semibold tracking-tight">
                    V Research
                  </h1>
                  <p className="text-xs text-slate-400">
                    Research workstation
                  </p>
                </div>
              </div>

              <h2 className="max-w-md text-4xl font-bold leading-tight">
                Your research workspace,{" "}
                <span className="text-cyan-300">in one place.</span>
              </h2>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Organize research, explore datasets, manage projects and build
                your personal research knowledge base.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-semibold">24/7</p>
                <p className="mt-1 text-xs text-slate-500">
                  Research workspace
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-2xl font-semibold">∞</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ideas & projects
                </p>
              </div>
            </div>
          </div>

          <div className="relative p-6 sm:p-10">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="absolute right-5 top-5 rounded-xl p-2 text-slate-500 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto max-w-md">
              <div className="mb-8 md:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-300/20">
                    <FlaskConical className="h-6 w-6 text-cyan-300" />
                  </div>

                  <div>
                    <h1 className="text-xl font-semibold">V Research</h1>
                    <p className="text-xs text-slate-400">
                      Research workstation
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold">{title}</h2>
              <p className="mt-2 text-sm text-slate-400">{subtitle}</p>

              <div className="mt-6 flex rounded-xl bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => openDialog("signin")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    dialog === "signin"
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => openDialog("signup")}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    dialog === "signup"
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  Sign up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {dialog === "signup" && (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Name
                    </label>

                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                    />
                  </div>
                </div>

                {dialog !== "forgot" && (
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Password
                    </label>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-white/10 bg-black/20 py-3 pl-10 pr-11 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {dialog === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => openDialog("forgot")}
                      className="text-xs text-cyan-300 hover:text-cyan-200"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : dialog === "signup"
                      ? "Create account"
                      : dialog === "forgot"
                        ? "Send reset link"
                        : "Sign in"}

                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              {dialog === "forgot" && (
                <button
                  type="button"
                  onClick={() => openDialog("signin")}
                  className="mt-5 w-full text-center text-sm text-slate-400 hover:text-white"
                >
                  ← Back to sign in
                </button>
              )}

              <p className="mt-8 text-center text-xs leading-5 text-slate-500">
                By continuing, you agree to use V Research responsibly and
                securely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
