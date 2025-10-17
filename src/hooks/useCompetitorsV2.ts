import { useState, useEffect } from "react";
import { fetchCompetitorsV2 } from "../services/productService";
import { ApiError } from "../services/apiError";

export type CompetitorV2 = {
  id: number;
  title: string;
  price: number;
  photo: string;
  vendorIdentifier: string;
  vendorTitle: string;
  productUrl: string;
};

interface UseCompetitorsV2Result {
  competitors: CompetitorV2[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export function useCompetitorsV2(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: number | string | null,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void,
  refreshTrigger?: number
): UseCompetitorsV2Result {
  const [competitors, setCompetitors] = useState<CompetitorV2[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const parseCompetitor = (raw: any): CompetitorV2 => {
    const id = Number(raw?.id) || 0;
    const title = String(raw?.title || raw?.name || "");
    const price = Number(raw?.price) || 0;
    
    // Handle different photo structures
    const photoObj = raw?.photo;
    let photo = "";
    if (typeof photoObj === "string") {
      photo = photoObj;
    } else if (photoObj) {
      photo = photoObj.md || photoObj.original || photoObj.sm || photoObj.xs || photoObj.main?.xl || "";
    }
    
    const vendorIdentifier = raw?.vendor?.identifier || "";
    const vendorTitle = raw?.vendor?.identifier || raw?.vendor?.title || "";
    const productUrl = raw?.product_url || `https://basalam.com/${encodeURIComponent(vendorIdentifier)}/product/${encodeURIComponent(id)}`;

    return {
      id,
      title,
      price,
      photo,
      vendorIdentifier,
      vendorTitle,
      productUrl,
    };
  };

  const loadPage = async (page: number, isLoadingMore: boolean = false) => {
    if (!productId) return;

    try {
      if (isLoadingMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setError(null);
      }

      const data = await fetchCompetitorsV2(authorizedFetch, productId, page);
      const newCompetitors = data.products.map(parseCompetitor);

      if (isLoadingMore) {
        setCompetitors(prev => [...prev, ...newCompetitors]);
      } else {
        setCompetitors(newCompetitors);
      }

      setHasMore(data.hasMore);
      setCurrentPage(page);
    } catch (err) {
      console.error("[useCompetitorsV2] Error fetching competitors:", err);
      
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 401) {
          setBasalamToken('');
          navigate('/login');
        }
      } else {
        setError("خطا در دریافت رقبا");
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadPage(currentPage + 1, true);
    }
  };

  const refresh = () => {
    setCurrentPage(1);
    loadPage(1, false);
  };

  useEffect(() => {
    if (!productId) {
      setCompetitors([]);
      setError(null);
      setHasMore(false);
      return;
    }

    refresh();
  }, [productId, authorizedFetch, refreshTrigger]);

  return {
    competitors,
    isLoading,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refresh,
  };
}