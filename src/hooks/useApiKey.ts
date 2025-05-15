import { useCallback, useEffect, useState } from "react";

export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const key = localStorage.getItem("openai_api_key");
    setApiKeyState(key);
    setIsLoading(false);
  }, []);

  const saveApiKey = useCallback((key: string) => {
    localStorage.setItem("openai_api_key", key);
    setApiKeyState(key);
  }, []);

  const deleteApiKey = useCallback(() => {
    localStorage.removeItem("openai_api_key");
    setApiKeyState(null);
  }, []);

  return { apiKey, isLoading, saveApiKey, deleteApiKey };
} 