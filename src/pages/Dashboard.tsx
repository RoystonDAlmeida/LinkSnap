// src/pages/Dashboard.tsx - Dashboard page
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import { io as socketIOClient } from "socket.io-client";

import Header from "@/components/Header";
import LinkSnapLoader from "@/components/LinkSnapLoader";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import below components that compose the dashboard component
import AnalyticsOverview from "@/components/dashboard/AnalyticsOverview";
import LinkSettings from "@/components/dashboard/LinkSettings";
import LinksList from "@/components/dashboard/LinksList";
import QuickStats from "@/components/dashboard/QuickStats";
import ShortenUrlForm from "@/components/dashboard/ShortenUrlForm";
import ShortUrlModal from "@/components/dashboard/ShortUrlModal";
import { useLinks } from "@/context/LinksContext";

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [user, setUser] = useState<any>(null);
  const [unverified, setUnverified] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [showShortUrlModal, setShowShortUrlModal] = useState(false);
  const hasWelcomed = useRef(false);

  // Use global links context
  const { recentLinks, setRecentLinks, linksFetched, setLinksFetched } = useLinks();
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      
      if (!currentUser) {
        navigate("/");
      } else if (!currentUser.emailVerified) {
        setUnverified(true);
        setTimeout(async () => {
          await signOut(auth);
          navigate("/");
        }, 3000);
      } else {
        // Use localStorage to persist welcome state per user
        const welcomeKey = `welcomed_${currentUser.uid}`;
        if (!localStorage.getItem(welcomeKey)) {
          toast({
            title: `Welcome back, ${currentUser.displayName || currentUser.email || "User"}!`,
            description: "Glad to see you again.",
          });
          localStorage.setItem(welcomeKey, "true");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Set the window title
  useEffect(() => {
    document.title = "LinkSnap | Dashboard";
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  // Handler for shortening URL on form submission
  const handleShortenUrl = async () => {
    if (!longUrl || !user) return;

    setLoading(true);
    setShortUrl("");
    setShowShortUrlModal(false);

    try {
      // Get the authenticated user ID
      const token = await getIdToken(user);

      // Fetch the backend response for shortening the URL
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ longUrl }),
      });

      // Decode the JSON response
      const data = await response.json();

      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        setShowShortUrlModal(true);
        setLongUrl("");

        fetchLinks(); // Fetch links after shortening
      } else {
        toast({
          title: "Failed to shorten URL",
          description: data.message || "An error occurred while shortening the URL.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Network or server error",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for fetching analytics of all links
  const fetchLinks = async () => {
    if (!user) return;

    setLinksLoading(true);

    try {
      const token = await getIdToken(user);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/links/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      let links = Array.isArray(data.links) ? data.links : [];
      
      // Sort by created_at descending (most recent first)
      links.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setRecentLinks(links);
    } catch (err) {
      setRecentLinks([]);
    } finally {
      setLinksLoading(false);
      setLinksFetched(true);
    }
  };

  // Fetch links after user is authenticated
  useEffect(() => {
    if (user) fetchLinks();
  }, [user]);

  // WebSocket: listen for real-time click updates
  useEffect(() => {
    if (!user) return;
    const socket = socketIOClient(import.meta.env.VITE_BACKEND_URL);
    socket.on('clicksUpdated', ({ userId, id, newClicks }) => {
      if (userId === user.uid) {
        setRecentLinks((links) =>
          links.map((link) =>
            link.id === id ? { ...link, clicks: newClicks } : link
          )
        );
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Access totalLinks, totalClicks, thisMonth links and topLinks
  const totalLinks = recentLinks.length;
  const totalClicks = recentLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
  const thisMonth = recentLinks.filter(link => {
    const created = new Date(link.created_at);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).reduce((sum, link) => sum + (link.clicks || 0), 0);

  // Find the link with the most clicks
  const topLinkObj = recentLinks.reduce((max, link) => (link.clicks > (max?.clicks || 0) ? link : max), null);
  const topLinkClicks = topLinkObj ? topLinkObj.clicks : 0;
  const topLinkUrl = topLinkObj ? topLinkObj.short_url : "-";

  // Handlers for LinksList
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied to clipboard!",
      description: "The short URL has been copied.",
    });
  };

  const handleAnalytics = (id: string) => {
    navigate(`/dashboard/analytics/${id}`);
  };

  const handleRefresh = () => {
    fetchLinks();
  };

  // Handler for ShortUrlModal
  const handleModalCopy = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  if (!authChecked || !linksFetched) {
    // Fallback loader while checking authentication or loading links
    return <LinkSnapLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {unverified && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-center mt-4 max-w-xl mx-auto">
          Your email is not verified. Please check your inbox and verify your email address. You will be signed out.
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Stats */}
        <QuickStats
          totalLinks={linksLoading ? undefined : totalLinks}
          totalClicks={linksLoading ? undefined : totalClicks}
          thisMonth={linksLoading ? undefined : thisMonth}
          topLinkClicks={linksLoading ? undefined : topLinkClicks}
          topLinkUrl={linksLoading ? undefined : topLinkUrl}
          loading={linksLoading}
        />

        {/* URL Shortener */}
        <ShortenUrlForm
          longUrl={longUrl}
          setLongUrl={setLongUrl}
          loading={loading}
          handleShortenUrl={handleShortenUrl}
        />

        {/* Links Management */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Link Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <LinksList
              links={recentLinks}
              loading={linksLoading}
              onCopy={handleCopy}
              onAnalytics={handleAnalytics}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="settings">
            <LinkSettings />
          </TabsContent>
        </Tabs>
      </div>

      <ShortUrlModal
        shortUrl={shortUrl}
        open={showShortUrlModal}
        onClose={() => setShowShortUrlModal(false)}
        onCopy={handleModalCopy}
      />
    </div>
  );
};

export default Dashboard;