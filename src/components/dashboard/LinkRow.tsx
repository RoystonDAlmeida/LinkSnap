import { QrCode, Lock, Clock, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import LinkSettingsQRModal from "./LinkSettingsQRModal";

// Function to check if link is expired or not
const isExpired = (expiryDate: string | null | undefined) => {
  if (!expiryDate) return false;
  return new Date(expiryDate) < new Date();
};

const LinkRow = ({
  link,
  loadingId,
  onToggle,
  onShowQR,
  qrOpenId,
  onCloseQR,
  qrData,
  qrLoading,
  qrError,
  showShareMenuId,
  setShowShareMenuId,
  handleDownloadQR,
  toast,
  onEditClick
}: any) => {
  // Debug log removed
  const expired = isExpired(link.expiry_date);
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-3">
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center space-x-2 mb-1">

          {/* Make the short_url clickable */}
          {link.status === 'disabled' ? (
            <span className="font-semibold text-blue-600 line-through opacity-60">{link.short_url}</span>
          ) : (
            <a
              href={link.short_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 hover:underline"
            >
              {link.short_url}
            </a>
          )}

          {/* Show link status */}
          <span className={link.status === "active" ? "text-green-600" : "text-red-500"}>
            {link.status === "active" ? "Active" : "Disabled"}
          </span>
        </div>
        <span className={`text-xs text-gray-500 truncate block max-w-xs ${link.status === 'disabled' ? 'line-through opacity-60' : ''}`} title={link.long_url}>{link.long_url}</span>

        {/* New row for icons and controls */}
        <div className="flex items-center justify-between mt-2">
          {/* Left: clock and password icons */}
          <div className="flex items-center space-x-2">
            {link.expiry_date && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={expired ? "text-red-600 cursor-help" : "text-yellow-500"}>
                      <Clock size={16} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {expired ? (
                      <>Expired on {new Date(link.expiry_date).toLocaleString()}</>
                    ) : (
                      <>Expires on {new Date(link.expiry_date).toLocaleString()}</>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {link.password && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-gray-700">
                      <Lock size={16} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Password protected</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {/* Right: edit, QR, toggle controls (desktop only) */}
          <div className="hidden sm:flex items-center space-x-2">
            {/* Edit button to open modal for editing expiry/password - disabled for non-active links */}
            <button
              className={`text-gray-500 hover:text-blue-600 transition-colors ${link.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={link.status === "active" ? onEditClick : undefined}
              aria-label="Edit link settings"
              disabled={link.status !== "active"}
              aria-disabled={link.status !== "active"}
              tabIndex={link.status !== "active" ? -1 : 0}
            >
              <Pencil size={18} />
            </button>
            {/* QR and Switch toggle controls */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`text-gray-500 hover:text-blue-600 transition-colors ${link.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={link.status === "active" ? () => onShowQR(link) : undefined}
                    aria-label="Show QR code"
                    disabled={link.status !== "active"}
                    aria-disabled={link.status !== "active"}
                    tabIndex={link.status !== "active" ? -1 : 0}
                  >
                    <QrCode size={20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Show QR code for offline sharing</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Switch
              checked={link.status === "active"}
              onCheckedChange={() => onToggle(link.id, link.status)}
              disabled={loadingId === link.id}
            />
          </div>
          {/* Bottom right controls for mobile */}
          <div className="flex sm:hidden w-full justify-end mt-2">
            <div className="flex items-center space-x-4">
              <button
                className={`text-gray-500 hover:text-blue-600 transition-colors ${link.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={link.status === "active" ? onEditClick : undefined}
                aria-label="Edit link settings"
                disabled={link.status !== "active"}
                aria-disabled={link.status !== "active"}
                tabIndex={link.status !== "active" ? -1 : 0}
              >
                <Pencil size={18} />
              </button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`text-gray-500 hover:text-blue-600 transition-colors ${link.status !== "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={link.status === "active" ? () => onShowQR(link) : undefined}
                      aria-label="Show QR code"
                      disabled={link.status !== "active"}
                      aria-disabled={link.status !== "active"}
                      tabIndex={link.status !== "active" ? -1 : 0}
                    >
                      <QrCode size={20} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Show QR code for offline sharing</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Switch
                checked={link.status === "active"}
                onCheckedChange={() => onToggle(link.id, link.status)}
                disabled={loadingId === link.id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrOpenId === link.id && (
        <LinkSettingsQRModal
          link={link}
          qrOpen={qrOpenId === link.id}
          onClose={onCloseQR}
          qrData={qrData}
          qrLoading={qrLoading}
          qrError={qrError}
          showShareMenuId={showShareMenuId}
          setShowShareMenuId={setShowShareMenuId}
          handleDownloadQR={handleDownloadQR}
          toast={toast}
        />
      )}
    </div>
  );
};

export default LinkRow; 