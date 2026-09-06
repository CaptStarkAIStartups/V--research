"use client";

import { FormEvent, useState } from "react";

type DialogType = "signin" | "signup" | "forgot" | null;

export default function AuthPage() {
  const [dialog, setDialog] = useState<DialogType>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "error"
  );

  function resetMessage() {
    setMessage("");
  }

  function switchDialog(nextDialog: DialogType) {
    setDialog(nextDialog);
    resetMessage();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessage();

    if (dialog === "signup") {
      if (!name.trim()) {
        setMessageType("error");
        setMessage("Please enter your name.");
        return;
      }

      if (!email.trim() || !email.includes("@")) {
        setMessageType("error");
        setMessage("Please enter a valid email address.");
        return;
      }

      if (password.length < 6) {
        setMessageType("error");
        setMessage("Password must contain at least 6 characters.");
        return;
      }

      setMessageType("success");
      setMessage(
        "Account form completed successfully. Connect your authentication provider to create the account."
      );
      return;
    }

    if (dialog === "signin") {
      if (!email.trim() || !email.includes("@")) {
        setMessageType("error");
        setMessage("Please enter a valid email address.");
        return;
      }

      if (!password) {
        setMessageType("error");
        setMessage("Please enter your password.");
        return;
      }

      setMessageType("success");
      setMessage(
        "Sign-in form completed successfully. Connect your authentication provider to continue."
      );
      return;
    }

    if (dialog === "forgot") {
      if (!email.trim() || !email.includes("@")) {
        setMessageType("error");
        setMessage("Please enter the email associated with your account.");
        return;
      }

      setMessageType("success");
      setMessage(
        "If an account exists for this email, password-reset instructions can be sent once authentication is connected."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative min-h-screen overflow-hidden">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-140px] top-[-140px] h-[360px] w-[360px] rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute left-1/2 top-1/3 h-[260px] w-[260px] -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
        </div>

        {/* Header */}
        <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-xl shadow-lg">
              🧪
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                V Research
              </h1>
              <p className="text-xs text-slate-500">
                Research Intelligence Workspace
              </p>
            </div>
          </div>

          <div className="hidden rounded-full border border-slate-800 bg-slate-900/70 px-4 py-2 text-xs text-slate-400 sm:block">
            Secure Research Workspace
          </div>
        </header>

        {/* Main */}
        <section className="relative z-10 flex min-h-[calc(100vh-82px)] items-center justify-center px-4 pb-10 pt-4 sm:px-6">
          <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
            {/* Left panel */}
            <div className="relative hidden min-h-[650px] overflow-hidden border-r border-slate-800 bg-slate-950/60 p-10 lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-300">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  Research platform
                </div>

                <h2 className="max-w-lg text-4xl font-bold leading-tight tracking-tight">
                  Explore knowledge.
                  <br />
                  Organize research.
                  <br />
                  <span className="text-blue-400">Build discoveries.</span>
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-400">
                  V Research brings research notes, datasets, articles,
                  discoveries and your research workspace together in one
                  organized environment.
                </p>

                <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
                  <FeatureCard
                    icon="📚"
                    title="Knowledge Hub"
                    text="Keep research information organized."
                  />

                  <FeatureCard
                    icon="🧬"
                    title="Research Tools"
                    text="Work with data, notes and discoveries."
                  />

                  <FeatureCard
                    icon="📊"
                    title="Data Workspace"
                    text="Manage research records efficiently."
                  />

                  <FeatureCard
                    icon="📰"
                    title="Research Articles"
                    text="Keep important research close."
                  />
                </div>
              </div>

              <div className="mt-10 flex items-center gap-3 text-xs text-slate-500">
                <span className="rounded-lg border border-slate-800 px-3 py-2">
                  🔒 Privacy focused
                </span>
                <span className="rounded-lg border border-slate-800 px-3 py-2">
                  ⚡ Fast workspace
                </span>
                <span className="rounded-lg border border-slate-800 px-3 py-2">
                  🧠 Research first
                </span>
              </div>
            </div>

            {/* Right auth panel */}
            <div className="flex min-h-[650px] items-center justify-center p-5 sm:p-8 lg:p-10">
              <div className="w-full max-w-md">
                {/* Mobile heading */}
                <div className="mb-7 text-center lg:hidden">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-2xl">
                    🧪
                  </div>

                  <h2 className="text-2xl font-bold">V Research</h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Research Intelligence Workspace
                  </p>
                </div>

                {/* Auth switch */}
                {dialog !== "forgot" && (
                  <div className="mb-7 grid grid-cols-2 rounded-xl border border-slate-800 bg-slate-950/70 p-1">
                    <button
                      type="button"
                      onClick={() => switchDialog("signin")}
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                        dialog === "signin"
                          ? "bg-slate-800 text-white shadow"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => switchDialog("signup")}
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                        dialog === "signup"
                          ? "bg-slate-800 text-white shadow"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                )}

                {/* Heading */}
                <div className="mb-7">
                  <div className="mb-3 text-3xl">
                    {dialog === "signin" && "👋"}
                    {dialog === "signup" && "🚀"}
                    {dialog === "forgot" && "🔑"}
                  </div>

                  <h2 className="text-2xl font-bold tracking-tight">
                    {dialog === "signin" && "Welcome back"}
                    {dialog === "signup" && "Create your workspace"}
                    {dialog === "forgot" && "Reset your password"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {dialog === "signin" &&
                      "Sign in to continue to your V Research workspace."}

                    {dialog === "signup" &&
                      "Create your V Research account and start organizing your research."}

                    {dialog === "forgot" &&
                      "Enter your email and we'll prepare the password-reset process."}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {dialog === "signup" && (
                    <InputField
                      label="Full name"
                      placeholder="Enter your name"
                      value={name}
                      onChange={setName}
                      type="text"
                    />
                  )}

                  <InputField
                    label="Email address"
                    placeholder="you@example.com"
                    value={email}
                    onChange={setEmail}
                    type="email"
                  />

                  {dialog !== "forgot" && (
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-300">
                          Password
                        </label>

                        {dialog === "signin" && (
                          <button
                            type="button"
                            onClick={() => switchDialog("forgot")}
                            className="text-xs font-medium text-blue-400 hover:text-blue-300"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(event) =>
                            setPassword(event.target.value)
                          }
                          placeholder="Enter your password"
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                        />

                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={
                            showPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>
                  )}

                  {dialog === "signin" && (
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-700 bg-slate-950"
                      />
                      Remember me
                    </label>
                  )}

                  {/* Message */}
                  {message && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm leading-5 ${
                        messageType === "success"
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                          : "border-red-500/20 bg-red-500/10 text-red-300"
                      }`}
                    >
                      {messageType === "success" ? "✓ " : "⚠ "}
                      {message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 active:scale-[0.99]"
                  >
                    {dialog === "signin" && "Sign In to V Research"}
                    {dialog === "signup" && "Create V Research Account"}
                    {dialog === "forgot" && "Continue"}
                  </button>
                </form>

                {/* Bottom links */}
                <div className="mt-7 text-center">
                  {dialog === "forgot" ? (
                    <button
                      type="button"
                      onClick={() => switchDialog("signin")}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      ← Back to Sign In
                    </button>
                  ) : (
                    <p className="text-sm text-slate-500">
                      {dialog === "signin"
                        ? "New to V Research?"
                        : "Already have an account?"}{" "}
                      <button
                        type="button"
                        onClick={() =>
                          switchDialog(
                            dialog === "signin" ? "signup" : "signin"
                          )
                        }
                        className="font-semibold text-blue-400 hover:text-blue-300"
                      >
                        {dialog === "signin"
                          ? "Create an account"
                          : "Sign in"}
                      </button>
                    </p>
                  )}
                </div>

                <p className="mt-8 text-center text-[11px] leading-5 text-slate-600">
                  V Research authentication interface
                  <br />
                  Your actual account security should be connected to a
                  trusted authentication provider.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700">
      <div className="mb-3 text-xl">{icon}</div>

      <h3 className="text-sm font-semibold text-slate-200">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
    </div>
  );
}
