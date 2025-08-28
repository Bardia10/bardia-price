import React, { useState, useContext } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AppContext } from "../App"; // for now, until we move AppContext out

const LoginPage: React.FC = () => {
  const { setBasalamToken, navigate, setGlobalLoading } = useContext(AppContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setGlobalLoading(true);
    try {
      const response = await fetch("https://bardia123456far.app.n8n.cloud/webhook/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch {}

      const statusCode =
        data && typeof data.status === "number"
          ? data.status
          : response.ok
          ? 200
          : response.status || 500;

      if (statusCode !== 200) {
        const message = (data && (data.message || data.error)) || "ورود ناموفق بود";
        throw new Error(message);
      }

      const token: string | undefined = data?.token;
      if (!token) throw new Error("توکن دریافتی معتبر نیست");

      setBasalamToken(token);
      navigate("dashboard");
    } catch (err: any) {
      setError(err?.message || "خطای ناشناخته رخ داد");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-emerald-700 mb-6">ورود</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">نام کاربری</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">کلمه عبور</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="toggle password"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        {/* Registration section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800 text-center mb-2">
            برای ثبت نام به ایمیل زیر پیام بفرستید:
          </p>
          <p className="text-sm font-medium text-blue-900 text-center">
            farokhsereshtibardia@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
