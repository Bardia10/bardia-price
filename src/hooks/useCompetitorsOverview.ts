import { useEffect, useState } from "react";
import { fetchCompetitorsOverview } from "../services/productService";
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

  useEffect(() => {
    if (!productId) {
      console.log("[useCompetitorsOverview] Skipping fetch — no productId yet");
      return;
    }

    let active = true;

    async function load() {
      console.log("[useCompetitorsOverview] Fetching competitors overview for productId:", productId);
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchCompetitorsOverview(authorizedFetch, productId);
        console.log("[useCompetitorsOverview] API response:", data);

        if (!active) return;

        // Store summary data from API
        setCompetitorsCount(data.competitorsCount || 0);
        setAvgPrice(data.averagePrice || 0);
        setLowestPrice(data.minPrice || 0); // ✅ store min price from backend

        // For the overview, we only need summary data
        // The detailed competitor list is now handled by useCompetitorsV2
        setLowestCompetitor(null); // Will be calculated differently if needed

        // --- Competitor price comparison logic ---
        let lowestBadgeText = '';
        let lowestBadgeClass = '';
        let avgBadgeText = '';
        let avgBadgeClass = '';

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
          lowestBadgeText = 'قیمت شما عالی است';
          lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
          avgBadgeText = 'قیمت شما عالی است';
          avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
        }
        
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
        if (active) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
      console.log("[useCompetitorsOverview] Cleanup function run");
    };
  }, [productId, productPrice, authorizedFetch, refreshTrigger]);

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
  };
}