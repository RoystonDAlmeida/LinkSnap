// src/components/dashboard/QRCodeShareMenu.tsx - Pop up component that consists of shareable options

import { Download, Share2, ClipboardCopy, Mail, MessageCircle } from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

const QRCodeShareMenu = ({
  link,
  qrData,
  showShareMenuId,
  setShowShareMenuId,
  handleDownloadQR,
  toast
}: any) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={showShareMenuId === link.id} onOpenChange={open => setShowShareMenuId(open ? link.id : null)}>
            <PopoverTrigger asChild>
              <button
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                onClick={async (e) => {
                  // Only use native share on mobile devices
                  if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
                    e.preventDefault();
                    try {
                      await navigator.share({
                        title: 'QR Code',
                        text: 'Scan this QR code to visit the link',
                        url: link.short_url
                      });
                    } catch (e) {}
                  }
                }}
              >
                <Share2 size={16} className="mr-2" /> Share QR
              </button>
            </PopoverTrigger>

            {/* Copy Link option */}
            <PopoverContent className="w-56 flex flex-col gap-2">
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                onClick={async () => {
                  await navigator.clipboard.writeText(link.short_url);
                  setShowShareMenuId(null);
                  toast({
                    title: "Link copied!",
                    description: "Short URL copied to clipboard.",
                  });
                }}
              >
                <ClipboardCopy size={16} /> Copy Link
              </button>

              {/* Whatsapp Web option */}
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(link.short_url)}`,'_blank');
                  setShowShareMenuId(null);
                  toast({
                    title: "WhatsApp Web opened",
                    description: "Share your link via WhatsApp.",
                  });
                }}
              >
                <MessageCircle size={16} /> WhatsApp Web
              </button>

              {/* Email option */}
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  window.open(`mailto:?subject=Check%20out%20this%20link&body=${encodeURIComponent(link.short_url)}`,'_blank');
                  setShowShareMenuId(null);
                  toast({
                    title: "Email client opened",
                    description: "Share your link via email.",
                  });
                }}
              >
                <Mail size={16} /> Email
              </button>

              {/* Download QR option */}
              <button
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded"
                onClick={() => {
                  if (handleDownloadQR) {
                    handleDownloadQR(link.short_url, link.id);
                  } else if (qrData) {
                    const a = document.createElement('a');
                    a.href = qrData;
                    a.download = `qr-${link.short_url.replace(/https?:\/\//, '')}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                  setShowShareMenuId(null);
                  toast({
                    title: "QR code downloaded!",
                    description: "The QR code image has been saved.",
                  });
                }}
              >
                <Download size={16} /> Download QR
              </button>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>Share QR code</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default QRCodeShareMenu; 