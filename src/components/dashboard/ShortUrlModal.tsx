// src/components/dashboard/SHortUrlModal.tsx - SHort URL Modal generated after shortening long URL
import { Link } from "lucide-react";

interface ShortUrlModalProps {
  shortUrl: string;
  open: boolean;
  onClose: () => void;
  onCopy: () => void;
}

const ShortUrlModal = ({ shortUrl, open, onClose, onCopy }: ShortUrlModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-2 text-blue-600 flex items-center justify-center gap-2">
            <Link className="w-6 h-6 text-blue-500" />
            Short URL Created!
          </h2>
          <p className="text-gray-700 mb-4">Your new short link is:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded font-mono break-all hover:underline mb-2"
          >
            {shortUrl}
          </a>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          onClick={onCopy}
        >
          Copy to Clipboard
        </button>
      </div>
    </div>
  );
};

export default ShortUrlModal; 