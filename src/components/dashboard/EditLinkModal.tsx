import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface EditLinkModalProps {
  link: any;
  onClose: () => void;
  onSave: (linkId: string, updates: { expiry_date?: string | null, password?: string | null }) => void;
}

// Helper to convert UTC date string to local datetime-local input value
function toLocalDatetimeInputValue(dateString: string | null | undefined) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  // Pad the year, month, date, hours and minutes
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());

  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

const EditLinkModal: React.FC<EditLinkModalProps> = ({ link, onClose, onSave }) => {
  // Use local time for initial value
  const initialExpiry = toLocalDatetimeInputValue(link.expiry_date);
  const [expiryDate, setExpiryDate] = useState<string | null>(initialExpiry);
  const [password, setPassword] = useState<string | null>(link.password || "");
  const [saving, setSaving] = useState(false);
  const [expiryError, setExpiryError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Validation: expiry date must not be in the past
  const nowLocal = new Date();
  const minDateTime = nowLocal.toISOString().slice(0, 16);
  const isExpiryInPast = expiryDate && new Date(expiryDate) < nowLocal;

  // Handler for save button
  const handleSave = async () => {
    if (isExpiryInPast) {
      setExpiryError("Expiry date/time cannot be in the past.");
      return;
    }

    setSaving(true);
    // Convert expiryDate (YYYY-MM-DDTHH:mm) to timestamp string if set, else null
    let expiryTimestamp = null;
    if (expiryDate) {
      // Convert to ISO string, then remove the 'Z' to keep as local time, or send as is if backend expects UTC
      expiryTimestamp = new Date(expiryDate).toISOString();
    }
    await onSave(link.id, {
      expiry_date: expiryTimestamp,
      password: password || null,
    });
    setSaving(false);
  };

  // Handler for removing expiry date
  const handleRemoveExpiry = () => {
    setExpiryDate("");
    setExpiryError(null);
  };

  // Handler for removing password
  const handleRemovePassword = () => setPassword("");

  // Clear error on change
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(e.target.value);
    setExpiryError(null);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Link Settings</DialogTitle>
          <DialogDescription>
            Set, update, or remove expiry date and password for this link.
          </DialogDescription>
        </DialogHeader>

        {/* Expiry Date Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Expiry Date & Time</label>
          <input
            type="datetime-local"
            className="border rounded px-2 py-1 w-full"
            value={expiryDate || ""}
            onChange={handleExpiryChange}
            min={minDateTime}
          />
          {expiryDate && (
            <button className="text-xs text-red-500 mt-1" onClick={handleRemoveExpiry} type="button">
              Remove expiry date
            </button>
          )}
          {expiryError && <div className="text-xs text-red-500 mt-1">{expiryError}</div>}
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="border rounded px-2 py-1 w-full pr-10"
              value={password || ""}
              onChange={e => setPassword(e.target.value)}
              placeholder="Set a password (optional)"
            />
            {/* Eye icon to toggle password visibility */}
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <button className="text-xs text-red-500 mt-1" onClick={handleRemovePassword} type="button">
              Remove password
            </button>
          )}
        </div>
        
        <DialogFooter>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded mr-2 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || isExpiryInPast}
            type="button"
          >
            Save
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditLinkModal; 