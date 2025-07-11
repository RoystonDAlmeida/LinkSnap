import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import LinkSnapLoader from "@/components/LinkSnapLoader";
import { getIdToken } from "firebase/auth";
import { auth } from "@/firebase";

const AnalyticsOverview = () => {
  const [loading, setLoading] = useState(true);
  const [geodataByLink, setGeodataByLink] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchGeodata() {
      setLoading(true);
      setError(null);

      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Not authenticated");

        const token = await getIdToken(user);

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/links/analytics/geodata-by-link`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch geodata");
        const data = await response.json();

        // Set geodata after component is mounted
        if (isMounted) setGeodataByLink(data.geodataByLink);
      } catch (err: any) {
        if (isMounted) setError(err.message || "Error fetching geodata");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchGeodata();
    return () => { isMounted = false; };
  }, []);

  // Aggregate clicks by country
  const countryData = useMemo(() => {
    if (!geodataByLink) return [];
    
    const countryCounts: Record<string, number> = {};
    Object.values(geodataByLink).flat().forEach((g: any) => {
      if (g.country) {
        countryCounts[g.country] = (countryCounts[g.country] || 0) + 1;
      }
    });
    return Object.entries(countryCounts).map(([country, count]) => ({ country, count }));
  }, [geodataByLink]);

  if (loading) {
    return <LinkSnapLoader message="Loading Link Analytics..." />;
  }

  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>
          Detailed insights about your link performance
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="h-96 flex flex-col items-center justify-center text-gray-500">
          {countryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={countryData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#6366f1" name="Clicks" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-400 py-8">No geolocation data available yet.</div>
          )}
        </div>
      </CardContent>

    </Card>
  );
};

export default AnalyticsOverview; 