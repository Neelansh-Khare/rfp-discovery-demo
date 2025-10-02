import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Building2, 
  TrendingUp, 
  ExternalLink,
  Bookmark,
  Clock
} from "lucide-react";
import { format } from "date-fns";

const categoryColors = {
  construction: "bg-orange-100 text-orange-800 border-orange-200",
  consulting: "bg-blue-100 text-blue-800 border-blue-200",
  it_services: "bg-purple-100 text-purple-800 border-purple-200",
  professional_services: "bg-green-100 text-green-800 border-green-200",
  engineering: "bg-indigo-100 text-indigo-800 border-indigo-200",
  maintenance: "bg-yellow-100 text-yellow-800 border-yellow-200",
  security: "bg-red-100 text-red-800 border-red-200",
  environmental: "bg-emerald-100 text-emerald-800 border-emerald-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

const regionNames = {
  british_columbia: "British Columbia",
  alberta: "Alberta",
  ontario: "Ontario",
  quebec: "Quebec",
  saskatchewan: "Saskatchewan",
  manitoba: "Manitoba",
  new_brunswick: "New Brunswick",
  nova_scotia: "Nova Scotia",
  prince_edward_island: "Prince Edward Island",
  newfoundland_labrador: "Newfoundland & Labrador",
  northwest_territories: "Northwest Territories",
  nunavut: "Nunavut",
  yukon: "Yukon",
  national: "National"
};

export default function OpportunityCard({ opportunity, match, compact = false, onSave }) {
  const daysTillDeadline = Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysTillDeadline <= 7;
  
  const getRelevanceColor = (score) => {
    if (score >= 80) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-200";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatBudget = (min, max) => {
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()} CAD`;
    }
    if (min) {
      return `$${min.toLocaleString()}+ CAD`;
    }
    if (max) {
      return `Up to $${max.toLocaleString()} CAD`;
    }
    return "Budget not disclosed";
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 border-slate-200 ${compact ? '' : 'mb-4'}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">
                {opportunity.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                <Building2 className="w-4 h-4" />
                <span className="font-medium">{opportunity.buyer_organization}</span>
                {opportunity.rfp_number && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="font-mono text-xs">{opportunity.rfp_number}</span>
                  </>
                )}
              </div>
            </div>
            
            {match && (
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${getRelevanceColor(match.relevance_score)} border font-semibold`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {match.relevance_score}% Match
                </Badge>
                {match.tags?.includes("prime_opportunity") && (
                  <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                    Prime Opportunity
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          {!compact && opportunity.description && (
            <p className="text-slate-600 text-sm line-clamp-2">
              {opportunity.description}
            </p>
          )}

          {/* Match Rationale */}
          {match?.match_rationale && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r">
              <p className="text-sm text-blue-800 font-medium">Why this matches:</p>
              <p className="text-sm text-blue-700 mt-1">{match.match_rationale}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="w-4 h-4" />
              <span>{regionNames[opportunity.region]}</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-600">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">{formatBudget(opportunity.budget_min, opportunity.budget_max)}</span>
            </div>
            
            <div className={`flex items-center gap-2 ${isUrgent ? 'text-red-600' : 'text-slate-600'}`}>
              {isUrgent ? <Clock className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              <span className="font-medium">
                {daysTillDeadline > 0 ? `${daysTillDeadline} days left` : 'Deadline passed'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge className={`${categoryColors[opportunity.category]} border text-xs`}>
                {opportunity.category.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <div className="flex gap-2">
              {opportunity.source_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Original
                  </a>
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onSave?.(opportunity)}
                className="hover:bg-blue-50"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}