// src/services/ssoService.ts
import { apiUrl } from "../lib/api";
import { ApiError } from "./apiError";

/** Helper to parse JSON safely */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export interface OAuthStartResponse {
  redirect_uri: string;
}

export interface TokenExchangeResponse {
  status: number;
  message: string;
  token: string;
  'has-password': boolean;
  expires_in?: number;
}

export interface SetPasswordResponse {
  username: string;
  password: string;
}

/**
 * Get OAuth start URL from backend
 * GET /auth/start
 */
export async function getOAuthStartUrl(): Promise<string> {
  const url = apiUrl('/auth/start');
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  const data = await safeJson(res);
  console.log('[SSO] OAuth start response:', { status: res.status, data });
  
  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در دریافت لینک احراز هویت", data);
  }

  // Handle different response formats
  if (data && data.redirect_uri) {
    console.log('[SSO] Found redirect_uri:', data.redirect_uri);
    return data.redirect_uri;
  }
  
  // Handle array response format: [{"redirect_uri": "..."}]
  if (Array.isArray(data) && data.length > 0 && data[0].redirect_uri) {
    console.log('[SSO] Found redirect_uri in array:', data[0].redirect_uri);
    return data[0].redirect_uri;
  }

  console.error('[SSO] Unexpected response format:', data);
  throw new ApiError(500, "فرمت پاسخ نامعتبر از سرور", data);
}

/**
 * Exchange OAuth code for JWT token
 * POST /auth/exchange-token
 */
export async function exchangeCodeForToken(code: string, state: string): Promise<TokenExchangeResponse> {
  const url = apiUrl('/auth/exchange-token');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      code,
      state
    })
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در احراز هویت", data);
  }

  return data;
}

/**
 * Set password after SSO signup
 * POST /password (requires Bearer token)
 */
export async function setPassword(
  tempToken: string,
  password: string
): Promise<SetPasswordResponse> {
  const url = apiUrl('/password');
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${tempToken}`
    },
    body: JSON.stringify({
      password
    })
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در تنظیم رمز عبور", data);
  }

  return data;
}