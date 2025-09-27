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
}

export const AppContext = createContext<AppContextType | null>(null);
