// src/pages/AnalyticsPage.tsx - Analytics Page for short url

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import chartData from "@/components/analytics/chartData";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { auth } from "@/firebase";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, ChevronLeft, ChevronRight, Link } from "lucide-react";
import LinkSnapLoader from "@/components/LinkSnapLoader";

export default function AnalyticsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    setLoading(true);
    setError(null);
    setData(null);

    // Fetch the analytics data for 'id' short URL
    const fetchData = async () => {
      try {
        const token = user ? await getIdToken(user) : null;
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/links/analytics/${id}` + window.location.search, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (!res.ok) throw new Error("Failed to fetch analytics");
        const result = await res.json();

        if (isMounted) setData(result);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Error fetching analytics");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (user) fetchData();
    return () => { isMounted = false; };
  }, [id, user]);

  // Previous and Next button functionality of carousel
  const handlePrev = () => setCurrent((current - 1 + chartData.length) % chartData.length);
  const handleNext = () => setCurrent((current + 1) % chartData.length);

  const { label, icon, color, description, component: ChartComp, dataKey } = chartData[current];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Back button absolutely at the extreme left, heading centered */}
      <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center mt-6 mb-8" style={{ minHeight: 56 }}>
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 text-left"
            style={{ minWidth: 0 }}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back</span>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-blue-700 text-center w-full">
          Analytics for <span className="font-mono text-base text-blue-900">{id}</span>
        </h1>
      </div>
      <div className="container mx-auto px-4 max-w-3xl">
        {loading ? (
          <div className="w-full mb-4">
            <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-xl p-4 sm:p-6 min-h-[320px] flex items-center justify-center">
              <LinkSnapLoader message="Loading Analytics Data.." />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full mb-4">
              <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-xl p-4 sm:p-6 transition-all duration-200">
                <div className="relative w-full flex flex-col items-center">
                  {/* Label and nav row absolutely positioned above the chart */}
                  <div className="absolute top-0 left-0 w-full z-10 flex flex-col">
                    <span
                      className={`font-semibold text-lg flex items-center gap-2 ${color} w-full justify-center text-center mb-2 pt-2`}
                      style={{ minHeight: 32 }}
                    >
                      <span className="text-2xl">{icon}</span> {label}
                    </span>
                    <div className="flex flex-row w-full items-center justify-between mb-2 px-2">
                      <Button variant="outline" onClick={handlePrev} aria-label="Previous Chart">
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="flex-1" />
                      <Button variant="outline" onClick={handleNext} aria-label="Next Chart">
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  <div className="w-full" style={{ height: 32 + 40 + 8 }} /> {/* Spacer for label+nav */}
                </div>
                <p className="text-gray-500 mb-6 sm:mb-4 text-sm text-center">{description}</p>
                <div className="bg-gray-50 rounded-lg p-2 sm:p-4 min-h-[260px] sm:min-h-[220px] flex items-center justify-center overflow-hidden mt-2 pt-16">
                  <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl">
                    <ChartComp data={data?.[dataKey] || []} />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              {chartData.map((c, idx) => (
                <button
                  key={c.label}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 border border-gray-300 ${idx === current ? "bg-blue-600" : "bg-gray-300"}`}
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to ${c.label}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 