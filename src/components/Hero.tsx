import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Zap, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ShortUrlModal from "./dashboard/ShortUrlModal";
import { auth } from "@/firebase";
import { onAuthStateChanged, getIdToken } from "firebase/auth";

const Hero = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Handler for the Shorten URL button
  const handleShorten = async () => {
    if (!user) {
      navigate("/signup");
      return;
    }

    if (longUrl.trim() !== "") {
      setLoading(true);

      try {
        const token = await getIdToken(user);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shorten`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ longUrl: longUrl }),
        });
        const data = await response.json();
        
        setShortUrl(data.shortUrl);
        setShowModal(true);
        setLongUrl("");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <section className="py-20 px-4 text-center bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
            Shorten URLs with
            <br />
            Lightning Speed
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your long URLs into powerful, trackable short links. 
            Boost your click-through rates and gain valuable insights.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 max-w-2xl mx-auto border">
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Enter your long URL here..." 
              className="flex-1 h-14 text-lg border-2 border-gray-200 focus:border-purple-500"
              value={longUrl}
              onChange={e => setLongUrl(e.target.value)}
              disabled={loading}
            />
            <Button
              className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg font-semibold flex items-center justify-center"
              onClick={handleShorten}
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                "Shorten URL"
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Registration required for basic shortening
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Generate short links in milliseconds</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Custom Links</h3>
            <p className="text-gray-600">Create branded, memorable URLs</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-gray-600">Enterprise-grade security</p>
          </div>
        </div>
        
        {/* Show this div only if user is unauthenticated */}
        { !user && (
          <div className="mt-12">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg px-8 py-4 h-auto">
                Start Shortening for Free
              </Button>
            </Link>
          </div>
        ) }
      </div>

      {/* Show ShortUrlModal only if authenticated and a short URL is available */}
      {user && showModal && shortUrl && (
        <ShortUrlModal
          shortUrl={shortUrl}
          open={showModal}
          onClose={() => setShowModal(false)}
          onCopy={handleCopy}
        />
      )}
    </section>
  );
};

export default Hero;