import { useEffect } from "react";
import * as productService from "../services/productService";
import { ApiError } from "../services/apiError";

/**
 * ✅ DISABLED: This hook is currently disabled and not being used
 * It was previously used to automatically manage products in the "expensives" list
 * based on price comparison with competitors.
 * 
 * The hook is kept here for future reference if needed.
 */

interface UseExpensiveManagementProps {
  selectedProduct: any;
  productDetail: any;
  confirmedCompetitorDetails: any[];
  authorizedFetch: any;
  basalamToken: string;
  setBasalamToken: (token: string) => void;
  navigate: (path: string) => void;
}

export const useExpensiveManagement = ({
  selectedProduct,
  productDetail,
  confirmedCompetitorDetails,
  authorizedFetch,
  basalamToken,
  setBasalamToken,
  navigate
}: UseExpensiveManagementProps) => {
  useEffect(() => {
    if (!selectedProduct?.id || !productDetail?.price || confirmedCompetitorDetails.length === 0 || !basalamToken) {
      return;
    }

    const priced = confirmedCompetitorDetails.filter(c => typeof c.price === "number" && c.price > 0);
    if (priced.length === 0) return;

    const lowest = priced.reduce((min, c) => (c.price < min.price ? c : min), priced[0]);

    const run = async () => {
      try {
        if (productDetail.price < lowest.price) {
          await productService.manageExpensive(authorizedFetch, selectedProduct.id, "DELETE");
          console.log(`Product ${selectedProduct.id} deleted from expensives - price lower than competitors`);
        } else {
          await productService.manageExpensive(authorizedFetch, selectedProduct.id, "PUT");
          console.log(`Product ${selectedProduct.id} added to expensives - price not lower than competitors`);
        }
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 401) {
          setBasalamToken("");
          navigate("login");
          console.error("باید دوباره لاگین کنید");
        } else {
          console.error(err?.message || "خطا در مدیریت expensives");
        }
      }
    };

    run();
  }, [confirmedCompetitorDetails, productDetail, selectedProduct, authorizedFetch, basalamToken, setBasalamToken, navigate]);
};
