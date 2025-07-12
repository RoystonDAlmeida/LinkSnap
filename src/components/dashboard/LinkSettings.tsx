import { useState } from "react";
import { auth } from "@/firebase";
import { getIdToken } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useLinks } from "@/context/LinksContext";
import LinkRow from "./LinkRow";

const LinkSettings = () => {
  const { recentLinks, setRecentLinks } = useLinks();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrOpenId, setQrOpenId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [showShareMenuId, setShowShareMenuId] = useState<string | null>(null);

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

  // Handler function for showing QR code
  const handleShowQR = async (link: any) => {
    setQrOpenId(link.id);
    setQrData(null);
    setQrError(null);
    setQrLoading(true);

    try {
      const user = auth.currentUser;
      const headers: any = {};
      if (user) {
        const token = await getIdToken(user);
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/shorten/${link.id}/qrcode`,
        { headers }
      );
      
      if (!response.ok) throw new Error("Failed to fetch QR code");
      const data = await response.json();

      setQrData(data.qr);
    } catch (err: any) {
      setQrError("Failed to load QR code from server. Using fallback.");
    }
    setQrLoading(false);
  };

  // Closing the QR Code Modal
  const handleCloseQR = () => {
    setQrOpenId(null);
    setQrData(null);
    setQrError(null);
    setQrLoading(false);
  };

  // Handler for downloading QR code
  const handleDownloadQR = (shortUrl: string, linkId: string) => {
    const svg = document.getElementById(`qr-svg-${linkId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `qr-${shortUrl.replace(/https?:\/\//, "")}.svg`;
      document.body.appendChild(a);

      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
              <LinkRow
                key={link.id}
                link={link}
                loadingId={loadingId}
                onToggle={handleToggle}
                onShowQR={handleShowQR}
                qrOpenId={qrOpenId}
                onCloseQR={handleCloseQR}
                qrData={qrData}
                qrLoading={qrLoading}
                qrError={qrError}
                showShareMenuId={showShareMenuId}
                setShowShareMenuId={setShowShareMenuId}
                handleDownloadQR={handleDownloadQR}
                toast={toast}
              />
            ))
          )}
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        </div>
      </CardContent>
      
    </Card>
  );
};

export default LinkSettings;