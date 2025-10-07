import React, { useState, useEffect } from "react";
import { Opportunity, OpportunityMatch, Company } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText,
  AlertCircle,
  ArrowRight,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

import DashboardStats from "../components/dashboard/DashboardStats";
import OpportunityCard from "../components/opportunities/OpportunityCard";

export default function Dashboard() {
  const [topMatches, setTopMatches] = useState([]);
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    highMatches: 0,
    inPipeline: 0,
    closingSoon: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get user's company profile
      const companies = await Company.list();
      const userCompany = companies[0];
      setCompany(userCompany);

      // Get all opportunities
      const opportunities = await Opportunity.list('-created_date');

      // Get matches for this company
      const matches = userCompany ?
        await OpportunityMatch.filter({ company_id: userCompany.id }, '-relevance_score', 10) :
        [];

      // Calculate stats
      const highMatches = matches.filter(m => m.relevance_score >= 70).length;
      const savedCount = matches.filter(m => ['saved', 'pursuing', 'submitted'].includes(m.status)).length;
      const closingSoon = opportunities.filter(o => {
        const deadline = new Date(o.deadline);
        const now = new Date();
        const daysDiff = (deadline - now) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7 && daysDiff > 0;
      }).length;

      setStats({
        totalOpportunities: opportunities.length,
        highMatches,
        inPipeline: savedCount,
        closingSoon
      });

      // Get top 3 matches by highest relevance score
      const sortedMatches = [...matches].sort((a, b) => b.relevance_score - a.relevance_score);
      const topMatchesWithDetails = [];
      for (const match of sortedMatches.slice(0, 3)) {
        const opportunity = opportunities.find(o => o.id === match.opportunity_id);
        if (opportunity) {
          topMatchesWithDetails.push({ ...match, opportunity });
        }
      }
      setTopMatches(topMatchesWithDetails);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  const handleSaveOpportunity = async (opportunity, note = '') => {
    if (!company) return;

    try {
      // Find the existing match
      const existingMatch = topMatches.find(m => m.opportunity_id === opportunity.id);

      if (existingMatch) {
        // Update status to saved and add note
        await OpportunityMatch.update(existingMatch.id, { status: "saved", notes: note });
      } else {
        // Create new match if it doesn't exist
        await OpportunityMatch.create({
          company_id: company.id,
          opportunity_id: opportunity.id,
          relevance_score: 50,
          status: "saved",
          notes: note
        });
      }

      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error("Error saving opportunity:", error);
    }
  };

  const handleUnsaveOpportunity = async (matchId) => {
    try {
      // Reload dashboard data after unsave
      await loadDashboardData();
    } catch (error) {
      console.error("Error unsaving opportunity:", error);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Your personalized RFP intelligence overview</p>
        </div>

        {/* Stats Cards */}
        <DashboardStats stats={stats} isLoading={isLoading} />

        {/* Top Matches */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">
                  Top Matches for You
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">Updated On: 09/10/2025</p>
              </div>
              <Link to={createPageUrl("Opportunities")}>
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-slate-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : topMatches.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {topMatches.map((match) => (
                  <div key={match.id} className="p-6 hover:bg-slate-50 transition-colors">
                    <OpportunityCard
                      opportunity={match.opportunity}
                      match={match}
                      compact={true}
                      onSave={handleSaveOpportunity}
                      onUnsave={handleUnsaveOpportunity}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-lg font-medium">No matches yet</p>
                <p className="text-sm mt-2">Complete your company profile to get personalized matches</p>
                <Link to={createPageUrl("Profile")} className="mt-4 inline-block">
                  <Button size="sm">Set Up Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}