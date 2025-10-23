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

/** Search similar products: /mlt-search endpoint */
export async function searchSimilarProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  title: string,
  productId: number | string,
  page: number = 1
) {
  const encodedTitle = encodeURIComponent(title.trim());
  const encodedId = encodeURIComponent(String(productId));
  const url = apiUrl(`/mlt-search?title=${encodedTitle}&product_id=${encodedId}&page=${page}`);

  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در جستجوی محصولات مشابه", data);
  }

  return {
    products: Array.isArray(data?.products) ? data.products : [],
    page: typeof data?.page === "number" ? data.page : page,
  };
}

/** Text-based search: /text-search endpoint */
export async function searchByText(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  query: string,
  productId: number | string,
  page: number = 1
) {
  const encodedQuery = encodeURIComponent(query.trim());
  const encodedId = encodeURIComponent(String(productId));
  const url = apiUrl(`/text-search?q=${encodedQuery}&product_id=${encodedId}&page=${page}`);

  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در جستجوی متنی", data);
  }

  return {
    products: Array.isArray(data?.products) ? data.products : [],
    page: typeof data?.page === "number" ? data.page : page,
  };
}

// export async function addCompetitor(
//   authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
//   selfProductId: number | string,
//   opProductId: number | string,
//   opVendor: string
// ) {
//   const url = apiUrl(`/competitors`);
//   const res = await authorizedFetch(url, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       self_product: Number(selfProductId),
//       op_product: Number(opProductId),
//       op_vendor: opVendor
//     })
//   });
//   const data = await safeJson(res);
//   if (!res.ok) throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در افزودن رقیب", data);
//   return data;
// }

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

/** Add competitor: POST /competitors */
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
    }),
  });
  const data = await safeJson(res);
  if (!res.ok) {
    throw new ApiError(res.status, (data && (data.message || data.error)) || "خطا در افزودن رقیب", data);
  }
  return data;
}

/** Fetch competitors overview: GET /v1/competitors-overview */
export async function fetchCompetitorsOverview(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: string | number
) {
  const url = apiUrl(`/v1/competitors-overview?product_id=${encodeURIComponent(String(productId))}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت خلاصه رقبا",
      data
    );
  }

  return {
    minPrice: typeof data?.min_price === "number" ? data.min_price : 0,
    averagePrice: typeof data?.average_price === "number" ? data.average_price : 0,
    competitorsCount: typeof data?.competitors_count === "number" ? data.competitors_count : 0,
    competitors: Array.isArray(data?.competitors) ? data.competitors : [],
  };
}

/** Fetch competitors overview (light version): GET /v1/competitors-overview/light */
export async function fetchCompetitorsOverviewLight(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: string | number
) {
  const url = apiUrl(`/v1/competitors-overview/light?product_id=${encodeURIComponent(String(productId))}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت خلاصه رقبا (light)",
      data
    );
  }

  return data;
}

/** Fetch competitors v2 (paginated): GET /v2/competitors */
export async function fetchCompetitorsV2(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: string | number,
  page: number = 1
) {
  const url = apiUrl(`/v2/competitors?product_id=${encodeURIComponent(String(productId))}&page=${page}`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت رقبا",
      data
    );
  }

  return {
    products: Array.isArray(data?.products) ? data.products : [],
    hasMore: Array.isArray(data?.products) && data.products.length > 0,
  };
}

/** Fetch expensive products: GET /v2/expensives */
export async function fetchExpensiveProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  const url = apiUrl(`/v2/expensives`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت محصولات غیر رقابتی",
      data
    );
  }

  return {
    products: Array.isArray(data?.products) ? data.products : [],
  };
}

/** Trigger reevaluation of expensive products: POST /expensives */
export async function triggerExpensiveReevaluation(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  const url = apiUrl(`/expensives`);
  const res = await authorizedFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در ارزیابی دوباره محصولات",
      data
    );
  }

  return data;
}

/** Fetch cheap products: GET /v1/cheaps */
export async function fetchCheapProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  const url = apiUrl(`/v1/cheaps`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت محصولات ارزان",
      data
    );
  }

  return {
    products: Array.isArray(data?.products) ? data.products : [],
  };
}

/** Get cheap factor: GET /cheapfactor */
export async function getCheapFactor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  const url = apiUrl(`/cheapfactor`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت فرمول ارزانی",
      data
    );
  }

  return {
    cheapFactor: parseFloat(data?.cheap_factor || "0.9"),
  };
}

/** Update cheap factor: PUT /cheap_factor */
export async function updateCheapFactor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  cheapFactor: number
) {
  const url = apiUrl(`/cheap_factor`);
  const res = await authorizedFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cheap_factor: cheapFactor }),
  });
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در بروزرسانی فرمول ارزانی",
      data
    );
  }

  return data;
}

/** Get expensive factor: GET /expensive_factor */
export async function getExpensiveFactor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
) {
  const url = apiUrl(`/expensive_factor`);
  const res = await authorizedFetch(url);
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در دریافت فرمول گرانی",
      data
    );
  }

  return {
    expensiveFactor: parseFloat(data?.expensive_factor || "1.0"),
  };
}

/** Update expensive factor: PUT /expensive_factor */
export async function updateExpensiveFactor(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  expensiveFactor: number
) {
  const url = apiUrl(`/expensive_factor`);
  const res = await authorizedFetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expensive_factor: expensiveFactor }),
  });
  const data = await safeJson(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      (data && (data.message || data.error)) || "خطا در بروزرسانی فرمول گرانی",
      data
    );
  }

  return data;
}


