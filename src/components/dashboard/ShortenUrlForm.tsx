// src/components/dashboard/ShortenUrlForm - Component for shorten URL form

import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ShortenUrlFormProps {
  longUrl: string;
  setLongUrl: (url: string) => void;
  loading: boolean;
  handleShortenUrl: () => void;
}

const ShortenUrlForm = ({ longUrl, setLongUrl, loading, handleShortenUrl }: ShortenUrlFormProps) => (
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
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Enter your long URL here..."
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          className="flex-1 h-12"
        />
        <Button
          className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          onClick={handleShortenUrl}
          disabled={loading || !longUrl}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </Button>
      </div>
    </CardContent>
    
  </Card>
);

export default ShortenUrlForm; 