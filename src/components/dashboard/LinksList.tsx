// src/components/dashboard/LinksList.tsx - Component for list of links

import { useNavigate } from "react-router-dom";
import { Copy, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface Link {
  id: string;
  short_url: string;
  long_url: string;
  clicks: number;
  created_at: string;
  status: string;
}

interface LinksListProps {
  links: Link[];
  loading: boolean;
  onCopy: (url: string) => void;
  onAnalytics: (id: string) => void;
  onRefresh: () => void;
}

const LinksList = ({ links, loading, onCopy, onAnalytics, onRefresh }: LinksListProps) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Links</CardTitle>

        <CardDescription>
          Manage and track your shortened URLs
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading your links...</div>
          ) : links.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No links found. Create your first short link above!</div>
          ) : (
            links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-semibold text-blue-600">{link.short_url}</p>
                    <Badge variant={link.status === "active" ? "default" : "secondary"}>
                      {link.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{link.long_url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {link.clicks} clicks • Created {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCopy(link.short_url)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAnalytics(link.id)}
                    aria-label="Show Analytics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={link.short_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setTimeout(() => {
                          onRefresh();
                        }, 1000);
                      }}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinksList; 