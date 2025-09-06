// src/services/productService.ts
import { apiUrl } from "../lib/api";
import { ApiError } from "./apiError";

/**
 * The authorizedFetch function should be passed from your App/context
 * (it already attaches Authorization header). It has signature:
 *   (input: RequestInfo, init?: RequestInit) => Promise<Response>
 */

/** Helper to parse JSON safely */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchProductDetail(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: string | number
) {
  const url = apiUrl(`/product?id=${encodeURIComponent(String(productId))}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در دریافت اطلاعات محصول", data);
  return data;
}

export async function fetchCompetitors(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: string | number
) {
  const url = apiUrl(`/competitors?product_id=${encodeURIComponent(String(productId))}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در دریافت رقبا", data);
  // normalise possible shapes: data may be array or object
  return data;
}

export async function fetchBulkProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productIds: number[]
) {
  const url = apiUrl(`/bulk_products`);
  const res = await authorizedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_ids: productIds }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در دریافت اطلاعات محصولات", data);
  return data;
}

export async function searchSimilarProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  title: string,
  productId: string | number,
  page = 1
) {
  const url = apiUrl(`/mlt-search?title=${encodeURIComponent(title)}&product_id=${encodeURIComponent(String(productId))}&page=${page}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در جستجوی محصولات مشابه", data);
  return data;
}

export async function addCompetitor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  selfProductId: number | string,
  opProductId: number | string,
  opVendor: string
) {
  const url = apiUrl(`/competitors`);
  const res = await authorizedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      self_product: Number(selfProductId),
      op_product: Number(opProductId),
      op_vendor: opVendor
    })
  });
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در افزودن رقیب", data);
  return data;
}

export async function deleteCompetitor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  selfProductId: number | string,
  opProductId: number | string
) {
  const url = apiUrl(`/competitors?product_id=${encodeURIComponent(String(selfProductId))}&op_product=${encodeURIComponent(String(opProductId))}`);
  const res = await authorizedFetch(url, { method: "DELETE" });
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در حذف رقیب", data);
  return data;
}

/** Expensives management: /expensives endpoint PUT/DELETE */
export async function manageExpensive(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  selfProductId: number | string,
  method: "PUT" | "DELETE"
) {
  const url = apiUrl(`/expensives`);
  const res = await authorizedFetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: Number(selfProductId) })
  });
  const data = await safeJson(res);
  if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در مدیریت expensives", data);
  return data;
}
