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
}

export const AppContext = createContext<AppContextType | null>(null);
