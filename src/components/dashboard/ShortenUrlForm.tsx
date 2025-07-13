// src/components/dashboard/ShortenUrlForm - Component for shorten URL form

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { z } from "zod";

interface ShortenUrlFormProps {
  longUrl: string;
  setLongUrl: (url: string) => void;
  loading: boolean;
  handleShortenUrl: (options?: { password?: string; expiresAt?: string }) => void;
  error?: string | null;
}

const urlSchema = z.object({
  longUrl: z.string()
    .url("Please enter a valid URL (must start with http:// or https://)")
    .refine(val => /^https?:\/\//.test(val), {
      message: "URL must start with http:// or https://"
    }),

  password: z.string().refine(val => {
    if (val.length === 0) return true; // Optional
    // At least 8 chars, one uppercase, one lowercase, one number, one special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(val);
  }, {
    message: "Password must be at least 8 characters, include upper and lower case letters, a number, and a special character."
  }),
  
  expiresAt: z.string().optional().refine(val => {
    if (!val) return true;
    return !isNaN(Date.parse(val)) && new Date(val) > new Date();
  }, {
    message: "Expiration date must be a valid future date"
  }),
});

const ShortenUrlForm = ({ longUrl, setLongUrl, loading, handleShortenUrl, error: propsError }: ShortenUrlFormProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // Password field
  const [expiresAt, setExpiresAt] = useState(""); // Expiry-date field
  const [error, setError] = useState<string | null>(null);

  // Helper to clear all fields
  const clearFields = () => {
    setLongUrl("");
    setPassword("");
    setExpiresAt("");
    setShowPassword(false);
  };

  // Wrap handleShortenUrl to clear fields after submission
  const handleSubmit = async () => {
    setError(null);
    const result = urlSchema.safeParse({ longUrl, password, expiresAt });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }
    await handleShortenUrl({ password, expiresAt });
    clearFields();
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Create New Short Link
        </CardTitle>
        <CardDescription>
          Enter a long URL to create a shortened version
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Error message above input and button */}
        {(error || propsError) && (
          <div className="flex items-center text-red-500 text-sm mb-2 text-left w-full" aria-live="polite">
            <span className="mr-1">⚠️</span>
            {error || propsError}
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Enter your long URL here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="flex-1 h-12"
          />
          <Button
            className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handleSubmit}
            disabled={loading || !longUrl}
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Set a password to protect your link (optional)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="h-12"
            />
            <label className="text-xs flex items-center mt-1">
              <input type="checkbox" checked={showPassword} onChange={() => setShowPassword(v => !v)} className="mr-1" />
              Show password
            </label>
            <div className="text-xs text-gray-500 mt-1">Anyone visiting the link will need to enter this password.</div>
          </div>
          <div className="flex-1">
            <Input
              type="datetime-local"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="h-12"
              min={new Date().toISOString().slice(0, 16)}
              placeholder="Set an expiration date/time (optional)"
            />
            <label className="text-xs mt-1 block">Expiration date (optional)</label>
            <div className="text-xs text-gray-500 mt-1">After this date, the link will no longer work.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShortenUrlForm; 