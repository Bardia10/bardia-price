import { useState, useEffect } from "react";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

export function useProductDetail(
  selectedProduct: any,
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
    if (!selectedProduct?.id || !basalamToken) {
      setProductDetail(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setIsLoadingProductDetail(true);
      setProductDetailError(null);
      try {
        const data = await productService.fetchProductDetail(authorizedFetch, selectedProduct.id);
        if (!cancelled) setProductDetail(data);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          setBasalamToken("");
          navigate("login");
          if (!cancelled) setProductDetailError("باید دوباره لاگین کنید");
        } else {
          if (!cancelled) setProductDetailError(err?.message || "خطای نامشخص");
        }
      } finally {
        if (!cancelled) setIsLoadingProductDetail(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedProduct?.id, basalamToken, authorizedFetch, refreshKey]);

  return { productDetail, isLoadingProductDetail, productDetailError };
}
