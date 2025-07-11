// src/components/dashboard/QuickStats.tsx - Component for displaying Quick Stats

import { Card, CardContent } from "@/components/ui/card";
import { Link, MousePointer, Calendar, BarChart3 } from "lucide-react";

// QuickStatsProps interface
interface QuickStatsProps {
  totalLinks?: number;
  totalClicks?: number;
  thisMonth?: number;
  topLinkClicks?: number;
  topLinkUrl?: string;
  loading?: boolean;
}

const QuickStats = ({ totalLinks, totalClicks, thisMonth, topLinkClicks, topLinkUrl, loading }: QuickStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

    {/* Total Links Card */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Links</p>
            <p className="text-2xl font-bold">{loading ? '-' : totalLinks}</p>
          </div>
          <Link className="w-8 h-8 text-blue-500" />
        </div>
      </CardContent>
    </Card>

    {/* Total Clicks Card */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Clicks</p>
            <p className="text-2xl font-bold">{loading ? '-' : totalClicks}</p>
          </div>
          <MousePointer className="w-8 h-8 text-green-500" />
        </div>
      </CardContent>
    </Card>

    {/* Total number of clicks this month */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-2xl font-bold">{loading ? '-' : thisMonth}</p>
          </div>
          <Calendar className="w-8 h-8 text-purple-500" />
        </div>
      </CardContent>
    </Card>

    {/* Top link(based on number of clicks) this month */}
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Top Link</p>
            <p className="text-2xl font-bold">{loading ? '-' : topLinkClicks}</p>
            {(!loading && topLinkUrl && topLinkUrl !== '-') ? (

              <a
                href={topLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 truncate hover:underline"
                title={topLinkUrl}
              >
                {topLinkUrl}
              </a>
            ) : (
              <p className="text-xs text-blue-600 truncate">-</p>
            )}
          </div>
          <BarChart3 className="w-8 h-8 text-orange-500" />
        </div>
      </CardContent>
    </Card>
    
  </div>
);

export default QuickStats; 