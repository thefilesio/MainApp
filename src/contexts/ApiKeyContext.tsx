import { createContext, useContext } from "react";
import { useApiKey } from "@/hooks/useApiKey";

const ApiKeyContext = createContext<ReturnType<typeof useApiKey> | undefined>(undefined);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const apiKeyState = useApiKey();
  return <ApiKeyContext.Provider value={apiKeyState}>{children}</ApiKeyContext.Provider>;
}

export function useApiKeyContext() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKeyContext must be used within ApiKeyProvider");
  return ctx;
} 