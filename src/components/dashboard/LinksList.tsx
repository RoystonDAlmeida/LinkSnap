// src/components/dashboard/LinksList.tsx - Component for list of links

import { useNavigate } from "react-router-dom";
import { Copy, BarChart3, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

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
        <TooltipProvider>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading your links...</div>
          ) : links.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No links found. Create your first short link above!</div>
          ) : (
            links.map((link) => (
              <div key={link.id} className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${link.status === "disabled" ? "opacity-60" : ""}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className={`font-semibold text-blue-600 ${link.status === "disabled" ? "line-through" : ""}`}>{link.short_url}</p>
                    <Badge variant={link.status === "active" ? "default" : "secondary"}>
                      {link.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{link.long_url}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {link.clicks} clicks • Created {new Date(link.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className={`flex items-center space-x-2 ml-4 ${link.status === "disabled" ? "line-through" : ""}`}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(link.short_url)}
                        aria-label="Copy short URL"
                        className="group"
                        disabled={link.status === "disabled"}
                      >
                        <Copy className="w-4 h-4 transition-colors duration-150 group-hover:text-blue-600 group-focus-visible:text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy short URL</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAnalytics(link.id)}
                        aria-label="Show Analytics"
                        className="group"
                        disabled={link.status === "disabled"}
                      >
                        <BarChart3 className="w-4 h-4 transition-colors duration-150 group-hover:text-green-600 group-focus-visible:text-green-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View analytics</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" asChild aria-label="Open short URL in new tab" className="group" disabled={link.status === "disabled"}>
                        {link.status === "disabled" ? (
                          <a
                            tabIndex={-1}
                            style={{ pointerEvents: "none" }}
                          >
                            <ExternalLink className="w-4 h-4 transition-colors duration-150 group-hover:text-purple-600 group-focus-visible:text-purple-600" />
                          </a>
                        ) : (
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
                            <ExternalLink className="w-4 h-4 transition-colors duration-150 group-hover:text-purple-600 group-focus-visible:text-purple-600" />
                          </a>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Open short URL in new tab</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))
          )}
        </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};

export default LinksList; 