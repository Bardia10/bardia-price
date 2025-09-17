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
  confirmedCompetitorDetails: Competitor[];
  lowestCompetitor: Competitor | null;
  averageCompetitorPrice: number;
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
  refreshTrigger?: number
): UseCompetitorsResult {
  const [isLoadingConfirmedCompetitors, setIsLoading] = useState(true);
  const [confirmedCompetitorsError, setError] = useState<string | null>(null);
  const [confirmedCompetitorDetails, setDetails] = useState<Competitor[]>([]);
  const [lowestCompetitor, setLowestCompetitor] = useState<Competitor | null>(null);
  const [averageCompetitorPrice, setAvgPrice] = useState(0);
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

        // Transform raw competitors into your expected shape
        const transformed: Competitor[] = (data.competitors || []).map((raw: any) => ({
          id: raw.id,
          title: raw.title,
          price: raw.price,
          photo: raw.photo.md, // 🔧 change to raw.photo.main.xl if needed
          vendorIdentifier: raw.vendor?.identifier || "",
          vendorTitle: raw.vendor?.identifier || "", // Add vendorTitle for modal display
          productUrl: raw.product_url || "",
        }));

        setDetails(transformed);
        setCompetitorsCount(data.competitorsCount || 0); // ✅ store backend count

        // Calculate lowest competitor from the top 5
        let lowest: Competitor | null = null;
        if (transformed.length > 0) {
          lowest = transformed.reduce(
            (min: Competitor, c: Competitor) => (c.price < min.price ? c : min),
            transformed[0]
          );
        }
        setLowestCompetitor(lowest);

        // Set average price from API
        setAvgPrice(data.averagePrice || 0);

        // --- Competitor price comparison logic ---
        let lowestBadgeText = '';
        let lowestBadgeClass = '';
        let avgBadgeText = '';
        let avgBadgeClass = '';

        if (transformed && transformed.length > 0 && productPrice > 0) {
          const pricedCompetitors = transformed.filter(c => typeof c.price === 'number' && c.price > 0);
          const lowestCompetitor = pricedCompetitors.length > 0 ? pricedCompetitors.reduce((min, c) => (c.price < min.price ? c : min), pricedCompetitors[0]) : null;
          // Use API-provided average price instead of recalculating
          const averageCompetitorPrice = data.averagePrice || 0;

          if (lowestCompetitor) {
            if (lowestCompetitor.price < productPrice) {
              lowestBadgeText = `-${Math.round((productPrice - lowestCompetitor.price) / lowestCompetitor.price * 100)}% ارزان‌تر از شما`;
              lowestBadgeClass = 'bg-red-50 text-red-700 border-red-200';
            } else if (lowestCompetitor.price > productPrice) {
              lowestBadgeText = `+${Math.round((lowestCompetitor.price - productPrice) / productPrice * 100)}% گران‌تر از شما`;
              lowestBadgeClass = 'bg-green-50 text-green-700 border-green-200';
            } else {
              lowestBadgeText = '=';
              lowestBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
            }
          }

          if (averageCompetitorPrice > 0) {
            if (averageCompetitorPrice < productPrice) {
              avgBadgeText = `-${Math.round((productPrice - averageCompetitorPrice) / averageCompetitorPrice * 100)}% ارزان‌تر از شما`;
              avgBadgeClass = 'bg-red-50 text-red-700 border-red-200';
            } else if (averageCompetitorPrice > productPrice) {
              avgBadgeText = `+${Math.round((averageCompetitorPrice - productPrice) / productPrice * 100)}% گران‌تر از شما`;
              avgBadgeClass = 'bg-green-50 text-green-700 border-green-200';
            } else {
              avgBadgeText = '=';
              avgBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
            }
          }
        }

        setLowestBadgeText(lowestBadgeText);
        setLowestBadgeClass(lowestBadgeClass);
        setAvgBadgeText(avgBadgeText);
        setAvgBadgeClass(avgBadgeClass);

        console.log("[useCompetitorsOverview] State updated:", {
          competitors: transformed,
          competitorsCount: data.competitorsCount,
          lowestCompetitor: lowest,
          averagePrice: data.averagePrice
        });
      } catch (err) {
        if (!active) return;
        console.error("[useCompetitorsOverview] Error fetching competitors overview:", err);

        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("خطا در دریافت رقبا");
        }
      } finally {
        if (active) {
          setIsLoading(false);
          console.log("[useCompetitorsOverview] Loading finished");
        }
      }
    }

    load();

    return () => {
      active = false;
      console.log("[useCompetitorsOverview] Cleanup — request cancelled");
    };
  }, [authorizedFetch, productId, productPrice, refreshTrigger]);

  return {
    isLoadingConfirmedCompetitors,
    confirmedCompetitorsError,
    confirmedCompetitorDetails,
    lowestCompetitor,
    averageCompetitorPrice,
    competitorsCount, // ✅ return backend count
    lowestBadgeText,
    lowestBadgeClass,
    avgBadgeText,
    avgBadgeClass,
  };
}