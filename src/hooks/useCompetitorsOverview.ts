import { useEffect, useState, useCallback } from "react";
import { fetchCompetitorsOverview, fetchCompetitorsOverviewLight } from "../services/productService";
import { ApiError } from "../services/apiError";

type Competitor = {
  id: number;
  title: string;
  price: number;
  photo: string;
  vendorIdentifier: string;
  vendorTitle: string; // Add vendorTitle field
  productUrl: string;
};

interface UseCompetitorsResult {
  isLoadingConfirmedCompetitors: boolean;
  confirmedCompetitorsError: string | null;
  lowestCompetitor: Competitor | null;
  averageCompetitorPrice: number;
  lowestCompetitorPrice: number; // ✅ new - actual min price from backend
  competitorsCount: number; // ✅ new
  lowestBadgeText: string;
  lowestBadgeClass: string;
  avgBadgeText: string;
  avgBadgeClass: string;
  refresh: (type?: 'full' | 'light') => void;
}

export function useCompetitorsOverview(
  authorizedFetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
  productId: number | string,
  productPrice: number,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void,
  refreshTrigger?: number
): UseCompetitorsResult {
  const [isLoadingConfirmedCompetitors, setIsLoading] = useState(true);
  const [confirmedCompetitorsError, setError] = useState<string | null>(null);
  const [lowestCompetitor, setLowestCompetitor] = useState<Competitor | null>(null);
  const [averageCompetitorPrice, setAvgPrice] = useState(0);
  const [lowestCompetitorPrice, setLowestPrice] = useState(0); // ✅ new - min price from backend
  const [competitorsCount, setCompetitorsCount] = useState(0); // ✅ new
  const [lowestBadgeText, setLowestBadgeText] = useState("");
  const [lowestBadgeClass, setLowestBadgeClass] = useState("");
  const [avgBadgeText, setAvgBadgeText] = useState("");
  const [avgBadgeClass, setAvgBadgeClass] = useState("");

  const load = useCallback(async (type: 'full' | 'light' = 'full') => {
    if (!productId) {
      console.log("[useCompetitorsOverview] Skipping fetch — no productId yet");
      return;
    }
    
    if (productPrice <= 0) {
      console.log("[useCompetitorsOverview] ⚠️ Skipping fetch — productPrice is 0 or invalid:", productPrice);
      return;
    }

    console.log(`[useCompetitorsOverview] 🔵 FETCHING competitors overview (type: ${type})`, {
      productId,
      productPrice,
      timestamp: new Date().toISOString()
    });
    setIsLoading(true);
    setError(null);

    try {
      const fetcher = type === 'light' ? fetchCompetitorsOverviewLight : fetchCompetitorsOverview;
      const rawData = await fetcher(authorizedFetch, productId);
      console.log("[useCompetitorsOverview] ✅ Raw API response:", rawData);

      // Normalize data from either snake_case (light) or camelCase (full)
      const data = {
        competitorsCount: rawData.competitors_count ?? rawData.competitorsCount ?? 0,
        averagePrice: rawData.average_price ?? rawData.averagePrice ?? 0,
        minPrice: rawData.min_price ?? rawData.minPrice ?? 0,
      };
      console.log("[useCompetitorsOverview] Normalized data:", data);


      // Store summary data from API
      setCompetitorsCount(data.competitorsCount);
      setAvgPrice(data.averagePrice);
      setLowestPrice(data.minPrice);

      // For the overview, we only need summary data
      // The detailed competitor list is now handled by useCompetitorsV2
      setLowestCompetitor(null); // Will be calculated differently if needed

      // --- Competitor price comparison logic ---
      let lowestBadgeText = '';
      let lowestBadgeClass = '';
      let avgBadgeText = '';
      let avgBadgeClass = '';

      console.log("[useCompetitorsOverview] 📊 Starting price comparison logic:", {
        competitorsCount: data.competitorsCount,
        productPrice,
        minPrice: data.minPrice,
        averagePrice: data.averagePrice
      });

      if (data.competitorsCount > 0 && productPrice > 0) {
        // Use API-provided average price for comparison
        const averageCompetitorPrice = data.averagePrice || 0;
        const minPrice = data.minPrice || 0;

        // Compare with lowest price if available
        if (minPrice > 0) {
          if (minPrice < productPrice) {
            lowestBadgeText = `-${Math.round((productPrice - minPrice) / minPrice * 100)}% ارزان‌تر از شما`;
            lowestBadgeClass = 'bg-red-50 text-red-700 border-red-200';
          } else if (minPrice > productPrice) {
            lowestBadgeText = `+${Math.round((minPrice - productPrice) / productPrice * 100)}% گران‌تر از شما`;
            lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
          } else {
            lowestBadgeText = 'برابر با شما';
            lowestBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
          }
        }

        // Compare with average price
        if (averageCompetitorPrice > 0) {
          if (averageCompetitorPrice < productPrice) {
            avgBadgeText = `-${Math.round((productPrice - averageCompetitorPrice) / averageCompetitorPrice * 100)}% ارزان‌تر از شما`;
            avgBadgeClass = 'bg-red-50 text-red-700 border-red-200';
          } else if (averageCompetitorPrice > productPrice) {
            avgBadgeText = `+${Math.round((averageCompetitorPrice - productPrice) / productPrice * 100)}% گران‌تر از شما`;
            avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
          } else {
            avgBadgeText = 'برابر با شما';
            avgBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
          }
        }
      } else {
        console.log("[useCompetitorsOverview] ⚠️ FALLBACK: No competitors or productPrice is 0 - setting default badge text");
        lowestBadgeText = 'قیمت شما عالی است';
        lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
        avgBadgeText = 'قیمت شما عالی است';
        avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
      }
      
      console.log("[useCompetitorsOverview] 🏁 Final badge values:", {
        lowestBadgeText,
        avgBadgeText
      });
      
      setLowestBadgeText(lowestBadgeText);
      setLowestBadgeClass(lowestBadgeClass);
      setAvgBadgeText(avgBadgeText);
      setAvgBadgeClass(avgBadgeClass);

    } catch (err) {
      console.error("[useCompetitorsOverview] Error fetching overview:", err);
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 401) {
          setBasalamToken('');
          navigate('/login');
        }
      } else {
        setError("خطا در دریافت خلاصه رقبا");
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId, productPrice, authorizedFetch, setBasalamToken, navigate]);

  useEffect(() => {
    console.log("[useCompetitorsOverview] 🔄 useEffect triggered - dependencies changed:", {
      productId,
      productPrice,
      refreshTrigger
    });
    
    let active = true;

    if (active) {
      load('full');
    }

    return () => {
      active = false;
      console.log("[useCompetitorsOverview] 🧹 Cleanup function run");
    };
  }, [productId, productPrice, authorizedFetch, refreshTrigger, load]);

  const refresh = useCallback((type: 'full' | 'light' = 'light') => {
    load(type);
  }, [load]);

  return {
    isLoadingConfirmedCompetitors,
    confirmedCompetitorsError,
    lowestCompetitor,
    averageCompetitorPrice,
    lowestCompetitorPrice, // ✅ return min price from backend
    competitorsCount, // ✅ return backend count
    lowestBadgeText,
    lowestBadgeClass,
    avgBadgeText,
    avgBadgeClass,
    refresh,
  };
}