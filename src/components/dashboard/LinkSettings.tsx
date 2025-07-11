import { useState } from "react";
import { auth } from "@/firebase";
import { getIdToken } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useLinks } from "@/context/LinksContext";

const LinkSettings = () => {
  const { recentLinks, setRecentLinks } = useLinks();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = async (linkId: string, currentStatus: string) => {
    setLoadingId(linkId);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const token = await getIdToken(user);
      const newStatus = currentStatus === "active" ? "disabled" : "active";

      // Fetch the PATCH request response while updating status of the URL
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shorten/${linkId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      setRecentLinks((links: any[]) =>
        links.map((link) =>
          link.id === linkId ? { ...link, status: newStatus } : link
        )
      );
    } catch (err: any) {
      setError(err.message || "Error updating status");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Settings</CardTitle>
        <CardDescription>
          Enable or disable your links
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {recentLinks.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">No links found.</div>
          ) : (
            recentLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between border rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-blue-600">{link.short_url}</span>
                    <span className={link.status === "active" ? "text-green-600" : "text-red-500"}>
                      {link.status === "active" ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 truncate block max-w-xs" title={link.long_url}>{link.long_url}</span>
                </div>
                <Switch
                  checked={link.status === "active"}
                  onCheckedChange={() => handleToggle(link.id, link.status)}
                  disabled={loadingId === link.id}
                />
              </div>
            ))
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>
      </CardContent>
      
    </Card>
  );
};

export default LinkSettings; 