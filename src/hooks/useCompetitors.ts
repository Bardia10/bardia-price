import { useState, useEffect } from "react";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

export type ConfirmedCompetitorDetail = {
  id: number;
  title: string;
  price: number;
  photo: string;
  vendorIdentifier: string;
  vendorTitle: string;
  productUrl: string;
};

export function useCompetitors(
  selectedProduct: any,
  authorizedFetch: any,
  basalamToken: string,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void,
  refreshTrigger: number
) {
  const [confirmedCompetitorDetails, setConfirmedCompetitorDetails] = useState<ConfirmedCompetitorDetail[]>([]);
  const [isLoadingConfirmedCompetitors, setIsLoadingConfirmedCompetitors] = useState(false);
  const [confirmedCompetitorsError, setConfirmedCompetitorsError] = useState<string | null>(null);

  useEffect(() => {
    const productId = selectedProduct?.id ? String(selectedProduct.id) : "";
    const isNumericId = /^\d+$/.test(productId);

    if (!basalamToken || !selectedProduct || !isNumericId) {
      setConfirmedCompetitorDetails([]);
      setConfirmedCompetitorsError(null);
      return;
    }

    let cancelled = false;

    const parseCoreDetail = (data: any, vendorIdentifier: string): ConfirmedCompetitorDetail => {
      const id = Number(data?.id ?? data?.product?.id) || 0;
      const title = (data?.title ?? data?.product?.title) || "";
      const price =
        Number(
          data?.price ??
            data?.variants?.[0]?.price ??
            data?.product?.price ??
            data?.product?.variants?.[0]?.price ??
            0
        ) || 0;

      const photoObj = data?.photo || data?.product?.photo || null;
      const photo =
        typeof photoObj === "string"
          ? photoObj
          : photoObj?.md || photoObj?.original || photoObj?.sm || photoObj?.xs || "";

      const vendorTitle =
        data?.vendor?.title ??
        data?.product?.vendor?.title ??
        "";

      return {
        id,
        title,
        price,
        photo,
        vendorIdentifier,
        vendorTitle,
        productUrl: `https://basalam.com/${encodeURIComponent(vendorIdentifier)}/product/${encodeURIComponent(id)}`
      };
    };

    const run = async () => {
      setIsLoadingConfirmedCompetitors(true);
      setConfirmedCompetitorsError(null);

      try {
        // 1) fetch competitors (via service)
        const compData = await productService.fetchCompetitors(authorizedFetch, productId);

        const list = Array.isArray(compData)
          ? compData[0]?.competitors || []
          : compData?.competitors || [];

        const items = (Array.isArray(list) ? list : [])
          .filter((c: any) => c && c.op_product)
          .map((c: any) => ({ op_product: Number(c.op_product), op_vendor: String(c.op_vendor || "") }));

        const competitorIds = items.map(i => i.op_product);

        if (competitorIds.length === 0) {
          if (!cancelled) setConfirmedCompetitorDetails([]);
          return;
        }

        // 2) bulk fetch details for competitor ids (via service)
        const bulkData = await productService.fetchBulkProducts(authorizedFetch, competitorIds);
        let products = Array.isArray(bulkData?.data) ? bulkData.data : [];

        // ✅ Filter only products with status === 2976 and inventory > 0
        products = products.filter((prod: any) => {
          const status = prod?.status.value ?? prod?.product?.status.value;
          const inventory = prod?.inventory ?? prod?.product?.inventory;
          return String(status) === "2976" && Number(inventory) > 0;
        });

        const details: ConfirmedCompetitorDetail[] = products.map((prod: any) => {
          const vendorIdentifier = items.find(i => i.op_product === prod.id)?.op_vendor || "";
          return parseCoreDetail(prod, vendorIdentifier);
        });

        if (!cancelled) setConfirmedCompetitorDetails(details);
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          setBasalamToken("");
          navigate("login");
          if (!cancelled) setConfirmedCompetitorsError("باید دوباره لاگین کنید");
        } else {
          if (!cancelled) setConfirmedCompetitorsError(err?.message || "خطای نامشخص");
        }
      } finally {
        if (!cancelled) setIsLoadingConfirmedCompetitors(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [selectedProduct, authorizedFetch, basalamToken, refreshTrigger, setBasalamToken, navigate]);

  return { confirmedCompetitorDetails, isLoadingConfirmedCompetitors, confirmedCompetitorsError };
}
