import React, { useState, useContext, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AppContext } from "../context/AppContext";
import { getOAuthStartUrl } from "../services/ssoService";

const LoginPage: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('LoginPage must be used within AppContext.Provider');
  }
  const { setBasalamToken, navigate, setGlobalLoading, setSsoFlow } = context;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = import.meta.env.VITE_BACKEND_URL;

  // Check for pending credentials from successful signup
  useEffect(() => {
    const pendingCredentials = sessionStorage.getItem('pendingCredentials');
    if (pendingCredentials) {
      try {
        const credentials = JSON.parse(pendingCredentials);
        setUsername(credentials.username || '');
        setPassword(credentials.password || '');
        sessionStorage.removeItem('pendingCredentials');
        
        // Show a helpful message
        if (credentials.username) {
          setError(`خوش آمدید! اطلاعات ورود شما آماده است. نام کاربری: ${credentials.username}`);
          setTimeout(() => setError(null), 5000);
        }
      } catch (err) {
        console.error('Error parsing pending credentials:', err);
        sessionStorage.removeItem('pendingCredentials');
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setGlobalLoading(true);
    try {
      const response = await fetch(apiUrl+"/login", {
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

  const handleSsoLogin = async () => {
    setSsoLoading(true);
    setError(null);
    
    try {
      console.log('[LoginPage] Starting SSO login flow...');
      setSsoFlow('login');
      const oauthUrl = await getOAuthStartUrl();
      console.log('[LoginPage] Redirecting to OAuth URL:', oauthUrl);
      window.location.href = oauthUrl;
    } catch (err) {
      console.error('[LoginPage] SSO login error:', err);
      setError(err instanceof Error ? err.message : 'خطا در ورود با باسلام');
      setSsoLoading(false);
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
          {error && (
            <div className={`text-sm ${error.includes('خوش آمدید') ? 'text-green-600' : 'text-red-600'}`}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </form>

        {/* SSO Login */}
        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">یا</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSsoLogin}
            disabled={ssoLoading}
            className="mt-4 w-full py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center"
          >
            {ssoLoading ? "در حال اتصال..." : "ورود با باسلام"}
          </button>
        </div>

        {/* Registration section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800 text-center mb-2">
            اکانت ندارید؟
          </p>
          <button
            type="button"
            onClick={() => navigate('signup')}
            className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            ثبت‌نام کنید
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
