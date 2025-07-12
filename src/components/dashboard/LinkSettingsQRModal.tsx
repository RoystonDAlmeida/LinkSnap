import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import QRCodeShareMenu from "./QRCodeShareMenu";

// QR Popup Modal and Share Menu for a single link
const LinkSettingsQRModal = ({
  link,
  qrOpen,
  onClose,
  qrData,
  qrLoading,
  qrError,
  showShareMenuId,
  setShowShareMenuId,
  handleDownloadQR,
  toast
}: any) => {
  return (
    <Dialog open={qrOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code for {link.short_url}</DialogTitle>
        </DialogHeader>
        
        {qrLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="flex flex-col items-center">
            {qrError && <div className="text-red-500 text-sm mb-2">{qrError}</div>}
            {qrData ? (
              // Backend QR code (PNG)
              <>
                <img src={qrData} alt="QR Code" className="mx-auto" />
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = qrData;
                      a.download = `qr-${link.short_url.replace(/https?:\/\//, '')}.png`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      toast({
                        title: "QR code downloaded!",
                        description: "The QR code image has been saved.",
                      });
                    }}
                  >
                    <Download size={16} className="mr-2" /> Download QR
                  </button>
                  <QRCodeShareMenu
                    link={link}
                    qrData={qrData}
                    showShareMenuId={showShareMenuId}
                    setShowShareMenuId={setShowShareMenuId}
                    handleDownloadQR={handleDownloadQR}
                    toast={toast}
                  />
                </div>
              </>
            ) : (
              // Fallback QR code (SVG)
              <>
                <QRCodeSVG id={`qr-svg-${link.id}`} value={link.short_url} size={200} />
                <div className="mt-4 flex gap-2">
                  <button
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    onClick={() => { handleDownloadQR(link.short_url, link.id); toast({ title: "QR code downloaded!", description: "The QR code image has been saved." }); }}
                  >
                    <Download size={16} className="mr-2" /> Download QR
                  </button>
                  <QRCodeShareMenu
                    link={link}
                    qrData={qrData}
                    showShareMenuId={showShareMenuId}
                    setShowShareMenuId={setShowShareMenuId}
                    handleDownloadQR={handleDownloadQR}
                    toast={toast}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LinkSettingsQRModal; 