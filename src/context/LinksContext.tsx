import React, { createContext, useContext, useState } from "react";

export type Link = {
  id: string;
  created_at: string;
  long_url: string;
  short_url: string;
  status: string;
  clicks: number;
};

type LinksContextType = {
  recentLinks: Link[];
  setRecentLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  linksFetched: boolean;
  setLinksFetched: React.Dispatch<React.SetStateAction<boolean>>;
};

const LinksContext = createContext<LinksContextType | undefined>(undefined);

export const LinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recentLinks, setRecentLinks] = useState<Link[]>([]);
  const [linksFetched, setLinksFetched] = useState(false);

  return (
    <LinksContext.Provider value={{ recentLinks, setRecentLinks, linksFetched, setLinksFetched }}>
      {children}
    </LinksContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(LinksContext);
  if (!context) throw new Error("useLinks must be used within a LinksProvider");
  return context;
}; 