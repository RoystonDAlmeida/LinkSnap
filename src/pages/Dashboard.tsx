// src/pages/Dashboard.tsx - Dashboard page
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link, Copy, BarChart3, Settings, Plus, ExternalLink, Calendar, MousePointer } from "lucide-react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LinkSnapLoader from "@/components/LinkSnapLoader";
import { toast } from "@/components/ui/use-toast";
import { io as socketIOClient } from "socket.io-client";

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [user, setUser] = useState<any>(null);
  const [unverified, setUnverified] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [showShortUrlModal, setShowShortUrlModal] = useState(false);
  const [recentLinks, setRecentLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(false);
  const hasWelcomed = useRef(false);
  const [analyticsLink, setAnalyticsLink] = useState<any>(null);

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
      } else if (!hasWelcomed.current) {
        toast({
          title: `Welcome back, ${currentUser.displayName || currentUser.email || "User"}!`,
          description: "Glad to see you again.",
        });
        hasWelcomed.current = true;
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    document.title = "LinkSnap | Dashboard";
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/signin");
  };

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
      } 
      else {
        alert("Failed to shorten URL");
      }
    } catch (err) {
      alert("Error shortening URL");
    } finally {
      setLoading(false);
    }
  };

  const fetchLinks = async () => {
    if (!user) return;
    setLinksLoading(true);
    try {
      const token = await getIdToken(user);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/links/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRecentLinks(Array.isArray(data.links) ? data.links : []);
    } catch (err) {
      setRecentLinks([]);
    } finally {
      setLinksLoading(false);
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

  if (!authChecked) {
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Links</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Link className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">2,445</p>
                </div>
                <MousePointer className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">1,287</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Link</p>
                  <p className="text-2xl font-bold">1,247</p>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* URL Shortener */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Create New Short Link
            </CardTitle>
            <CardDescription>
              Enter a long URL to create a shortened version
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Enter your long URL here..."
                value={longUrl}
                onChange={(e) => setLongUrl(e.target.value)}
                className="flex-1 h-12"
              />
              <Button
                className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={handleShortenUrl}
                disabled={loading || !longUrl}
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Links Management */}
        <Tabs defaultValue="recent" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent Links</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Link Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>
                  Manage and track your shortened URLs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {linksLoading ? (
                    <div className="text-center text-gray-500 py-8">Loading your links...</div>
                  ) : recentLinks.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No links found. Create your first short link above!</div>
                  ) : (
                    recentLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="font-semibold text-blue-600">{link.short_url}</p>
                            <Badge variant={link.status === "active" ? "default" : "secondary"}>
                              {link.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{link.long_url}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {link.clicks} clicks • Created {new Date(link.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(link.short_url);
                              toast({
                                title: "Copied to clipboard!",
                                description: "The short URL has been copied.",
                              });
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/dashboard/analytics/${link.id}`)}
                            aria-label="Show Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={link.short_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => {
                                setTimeout(() => {
                                  fetchLinks();
                                }, 1000); // Wait 1 second for backend to update
                              }}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Overview</CardTitle>
                <CardDescription>
                  Detailed insights about your link performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  Analytics charts and graphs would be displayed here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Link Settings</CardTitle>
                <CardDescription>
                  Configure your link preferences and options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">Link customization and security settings would be available here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showShortUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center relative animate-fade-in">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
              onClick={() => setShowShortUrlModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2 text-blue-600 flex items-center justify-center gap-2">
                <Link className="w-6 h-6 text-blue-500" />
                Short URL Created!
              </h2>
              <p className="text-gray-700 mb-4">Your new short link is:</p>
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded font-mono break-all hover:underline mb-2"
              >
                {shortUrl}
              </a>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
