import { createContext } from "react";

// Define the context type with proper TypeScript interfaces
export interface AppContextType {
  navigate: (path: string, options?: { productId?: string; from?: string }) => void;
  selectedProduct: any;
  setSelectedProduct: (product: any) => void;
  basalamToken: string;
  setBasalamToken: (token: string) => void;
  authorizedFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  setGlobalLoading: (loading: boolean) => void;
  lastNavigation: any;
  // SSO-related state
  tempToken: string;
  setTempToken: (token: string) => void;
  ssoFlow: 'login' | 'signup' | null;
  setSsoFlow: (flow: 'login' | 'signup' | null) => void;
  // My Products state preservation
  myProductsState: {
    products: any[];
    currentPage: number;
    searchTerm: string;
    hasMorePages: boolean;
    scrollPosition: number;
    isInitialized: boolean;
  };
  setMyProductsState: (state: Partial<AppContextType['myProductsState']>) => void;
  clearMyProductsState: () => void;
  // Expensive Products state preservation
  expensiveProductsState: {
    products: any[];
    scrollPosition: number;
    isInitialized: boolean;
  };
  setExpensiveProductsState: (state: Partial<AppContextType['expensiveProductsState']>) => void;
  clearExpensiveProductsState: () => void;
  // Cheap Products state preservation
  cheapProductsState: {
    products: any[];
    scrollPosition: number;
    isInitialized: boolean;
  };
  setCheapProductsState: (state: Partial<AppContextType['cheapProductsState']>) => void;
  clearCheapProductsState: () => void;
}

export const AppContext = createContext<AppContextType | null>(null);
