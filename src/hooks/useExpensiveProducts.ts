import { useState, useEffect } from "react";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

export function useExpensiveProducts(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  basalamToken: string,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void,
  setGlobalLoading: (loading: boolean) => void,
  refreshTrigger?: number
) {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map API product shape to internal Product type
  const mapExpensiveProduct = (p: any) => {
    const id = String(p?.id ?? '');
    const title = String(p?.title ?? '');
    const price = Number(p?.price ?? 0);
    const photoObj = p?.photo || {};
    const primaryPhoto = photoObj.md || photoObj.sm || photoObj.lg || photoObj.xs || photoObj.original || 'https://placehold.co/200x200/cccccc/333333?text=No+Image';
    const photos: string[] = [];
    if (primaryPhoto) photos.push(primaryPhoto);
    if (photoObj.lg && !photos.includes(photoObj.lg)) photos.push(photoObj.lg);
    if (photoObj.md && !photos.includes(photoObj.md)) photos.push(photoObj.md);
    if (photoObj.sm && !photos.includes(photoObj.sm)) photos.push(photoObj.sm);
    if (photoObj.xs && !photos.includes(photoObj.xs)) photos.push(photoObj.xs);
    if (photoObj.original && !photos.includes(photoObj.original)) photos.push(photoObj.original);
    const vendorIdentifier = p?.vendor?.identifier || 'shop';
    const basalamUrl = `https://basalam.com/${vendorIdentifier}/product/${id}`;
    const description = p?.description || 'بدون توضیحات';
    return {
      id,
      title,
      price,
      photo_id: primaryPhoto,
      photos,
      description,
      basalamUrl,
      createdAt: new Date().toISOString(),
    };
  };

  useEffect(() => {
    if (!basalamToken) {
      setProducts([]);
      return;
    }

    let cancelled = false;

    const fetchProducts = async () => {
      setIsLoading(true);
      setGlobalLoading(true);
      setError(null);
      
      try {
        const data = await productService.fetchExpensiveProducts(authorizedFetch);
        
        if (!cancelled) {
          const mappedProducts = data.products.map(mapExpensiveProduct);
          setProducts(mappedProducts);
          console.log("[useExpensiveProducts] Fetched products:", mappedProducts);
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("[useExpensiveProducts] Error:", err);
          
          // Handle 401 errors consistently with other hooks
          if (err instanceof ApiError && err.status === 401) {
            setBasalamToken("");
            navigate("login");
            setError("باید دوباره لاگین کنید");
          } else {
            setError(err?.message || "خطای نامشخص در دریافت محصولات");
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setGlobalLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [basalamToken, authorizedFetch, setBasalamToken, navigate, setGlobalLoading, refreshTrigger]);

  return {
    products,
    isLoading,
    error,
  };
}