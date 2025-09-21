import { useState, useEffect } from "react";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

export function useProductDetail(
  productId: string | undefined, // Changed to accept direct product ID
  basalamToken: string,
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void,
  refreshKey: number
) {
  const [productDetail, setProductDetail] = useState<any>(null);
  const [isLoadingProductDetail, setIsLoadingProductDetail] = useState(false);
  const [productDetailError, setProductDetailError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[useProductDetail] Effect triggered with:', {
      productId,
      hasBasalamToken: !!basalamToken,
      refreshKey
    });
    
    if (!productId || !basalamToken) {
      console.log('[useProductDetail] Skipping fetch - missing productId or token');
      setProductDetail(null);
      return;
    }
    
    let cancelled = false;
    const run = async () => {
      console.log('[useProductDetail] Starting fetch for productId:', productId);
      setIsLoadingProductDetail(true);
      setProductDetailError(null);
      try {
        const data = await productService.fetchProductDetail(authorizedFetch, productId);
        if (!cancelled) {
          setProductDetail(data);
          console.log("[useProductDetail] productDetail returned:", data);
        }
      } catch (err: any) {
        console.error("[useProductDetail] Error fetching product detail:", err);
        if (err instanceof ApiError && err.status === 401) {
          setBasalamToken("");
          navigate("login");
          if (!cancelled) setProductDetailError("باید دوباره لاگین کنید");
        } else {
          if (!cancelled) setProductDetailError(err?.message || "خطای نامشخص");
        }
      } finally {
        if (!cancelled) {
          console.log('[useProductDetail] Fetch completed, setting loading to false');
          setIsLoadingProductDetail(false);
        }
      }
    };
    run();
    return () => { 
      console.log('[useProductDetail] Cleanup called');
      cancelled = true; 
    };
  }, [productId, basalamToken, authorizedFetch, refreshKey]);

  return { productDetail, isLoadingProductDetail, productDetailError };
}