import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { seedContent } from "../../shared/seedContent";
import type { PortfolioContent } from "../../shared/types";
import { api } from "../services/api";

interface ContentContextValue {
  content: PortfolioContent;
  ready: boolean;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<PortfolioContent>(seedContent);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await api.getPublicContent();
      if (response?.content) setContent(response.content);
    } catch {
      // The seeded content keeps the public site fully functional if the API is unreachable.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(() => void refresh(), 60000);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const value = useMemo(() => ({ content, ready, refresh }), [content, ready, refresh]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used inside ContentProvider");
  return context;
}
