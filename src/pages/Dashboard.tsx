// src/pages/Dashboard.tsx - Dashboard page
import { useState, useEffect } from "react";
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

const Dashboard = () => {
  const [longUrl, setLongUrl] = useState("");
  const [user, setUser] = useState<any>(null);
  const [unverified, setUnverified] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

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
        alert(`Short URL: ${data.shortUrl}`);
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

  const recentLinks = [
    {
      id: 1,
      shortUrl: "linksnap.co/abc123",
      originalUrl: "https://www.example.com/very-long-url-that-needs-shortening",
      clicks: 1247,
      created: "2 days ago",
      status: "active"
    },
    {
      id: 2,
      shortUrl: "linksnap.co/xyz789",
      originalUrl: "https://www.another-example.com/another-long-url",
      clicks: 856,
      created: "5 days ago",
      status: "active"
    },
    {
      id: 3,
      shortUrl: "linksnap.co/def456",
      originalUrl: "https://www.third-example.com/yet-another-url",
      clicks: 342,
      created: "1 week ago",
      status: "paused"
    }
  ];

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
                  {recentLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="font-semibold text-blue-600">{link.shortUrl}</p>
                          <Badge variant={link.status === "active" ? "default" : "secondary"}>
                            {link.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{link.originalUrl}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {link.clicks} clicks • Created {link.created}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
};

export default Dashboard;
