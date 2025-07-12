import { Switch } from "@/components/ui/switch";
import { QrCode } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import LinkSettingsQRModal from "./LinkSettingsQRModal";

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
  toast
}: any) => {
  return (
    <div className="flex items-center justify-between border rounded-lg p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-blue-600">{link.short_url}</span>
          <span className={link.status === "active" ? "text-green-600" : "text-red-500"}>
            {link.status === "active" ? "Active" : "Disabled"}
          </span>
        </div>
        <span className="text-xs text-gray-500 truncate block max-w-xs" title={link.long_url}>{link.long_url}</span>
      </div>
      <div className="flex items-center space-x-2">
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