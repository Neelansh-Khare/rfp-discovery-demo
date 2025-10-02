import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, Bookmark, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const StatCard = ({ title, value, icon: Icon, color, change }) => (
  <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          {change && (
            <p className="text-sm text-emerald-600 mt-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function DashboardStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i} className="shadow-sm border-slate-200">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Opportunities"
        value={stats.totalOpportunities.toLocaleString()}
        icon={FileText}
        color="bg-neura-blueGray"
      />
      <StatCard
        title="Top Matches"
        value={stats.highMatches}
        icon={TrendingUp}
        color="bg-neura-teal"
      />
      <StatCard
        title="In Your Pipeline"
        value={stats.inPipeline}
        icon={Bookmark}
        color="bg-neura-slate"
      />
      <StatCard
        title="Closing Soon"
        value={stats.closingSoon}
        icon={Clock}
        color="bg-neura-coral"
        change="< 7 days remaining"
      />
    </div>
  );
}