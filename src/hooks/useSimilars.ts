import { useState, useCallback } from "react";
import { ApiError } from "../services/apiError";
import * as productService from "../services/productService";

export const useSimilars = (
  selectedProduct: any,
  basalamToken: string,
  authorizedFetch: any,
  mapSearchProduct: (p: any) => any,
  setGlobalLoading: (v: boolean) => void,
  setBasalamToken: (token: string) => void,
  navigate: (path: string) => void
) => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingMoreSimilars, setIsLoadingMoreSimilars] = useState(false);
  const [similarPage, setSimilarPage] = useState(1);
  const [hasMoreSimilarPages, setHasMoreSimilarPages] = useState(true);
  const [hasFetchedSimilars, setHasFetchedSimilars] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchSimilarProducts = useCallback(async () => {
    if (!selectedProduct || !basalamToken || !selectedProduct.title || !selectedProduct.id) {
      setSearchResults([]);
      setSimilarPage(1);
      setHasMoreSimilarPages(true);
      return;
    }

    setIsLoadingSearch(true);
    setGlobalLoading(true);
    setSearchError(null);

    try {
      const { products, page } = await productService.searchSimilarProducts(
        authorizedFetch,
        selectedProduct.title,
        selectedProduct.id,
        1
      );

      const mapped = products.map(mapSearchProduct).filter((p: any) => p.id && p.title);
      setSearchResults(mapped);
      setSimilarPage(page + 1);
      setHasMoreSimilarPages(mapped.length > 0);
      setHasFetchedSimilars(true);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setSearchError("باید دوباره لاگین کنید");
      } else {
        setSearchError(err?.message || "خطای نامشخص در جستجو");
      }
    } finally {
      setIsLoadingSearch(false);
      setGlobalLoading(false);
    }
  }, [selectedProduct, basalamToken, authorizedFetch, mapSearchProduct, setGlobalLoading, setBasalamToken, navigate]);

  const loadMoreSimilars = useCallback(async () => {
    if (!selectedProduct || !basalamToken || !selectedProduct.title || !selectedProduct.id || isLoadingMoreSimilars || !hasMoreSimilarPages) return;

    setIsLoadingMoreSimilars(true);
    setSearchError(null);

    try {
      const { products, page } = await productService.searchSimilarProducts(
        authorizedFetch,
        selectedProduct.title,
        selectedProduct.id,
        similarPage
      );

      const mapped = products.map(mapSearchProduct).filter((p: any) => p.id && p.title);
      setSearchResults(prev => [...prev, ...mapped]);
      setSimilarPage(page + 1);
      setHasMoreSimilarPages(mapped.length > 0);
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        setBasalamToken("");
        navigate("login");
        setSearchError("باید دوباره لاگین کنید");
      } else {
        setSearchError(err?.message || "خطای نامشخص در جستجو");
      }
    } finally {
      setIsLoadingMoreSimilars(false);
    }
  }, [selectedProduct, basalamToken, authorizedFetch, similarPage, isLoadingMoreSimilars, hasMoreSimilarPages, mapSearchProduct, setBasalamToken, navigate]);

  return {
    searchResults,
    isLoadingSearch,
    isLoadingMoreSimilars,
    similarPage,
    hasMoreSimilarPages,
    hasFetchedSimilars,
    searchError,
    fetchSimilarProducts,
    loadMoreSimilars,
    setSearchResults, // optional if component wants direct access
  };
};
