import { useState } from "react";

function AuthModal({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  authError,
  isApiAvailable,
}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    setIsSubmitting(true);
    const action = mode === "login" ? onLogin : onRegister;
    const result = await action(email.trim(), password);

    setIsSubmitting(false);
    if (result?.success) {
      handleClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-700">
            {mode === "login" ? "Login" : "Register"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-3 py-2 font-semibold ${
              mode === "login"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`px-3 py-2 font-semibold ${
              mode === "register"
                ? "bg-slate-700 text-white"
                : "bg-white text-slate-600"
            }`}
          >
            Register
          </button>
        </div>

        <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
          {!isApiAvailable ? (
            <p className="text-xs font-medium text-amber-700">
              Cloud login requires API routes. Run with Vercel or deploy.
            </p>
          ) : null}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-500"
          />

          {authError ? (
            <p className="text-sm font-medium text-red-600">{authError}</p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthModal;
