import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import {
  MapPin,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  ExternalLink,
  Bookmark,
  Clock,
  ChevronDown,
  ChevronUp
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

export default function OpportunityCard({ opportunity, match, compact = false, onSave, onUnsave }) {
  const [isSaved, setIsSaved] = React.useState(
    match?.status && ['saved', 'pursuing', 'submitted', 'won', 'lost'].includes(match.status)
  );
  const [showNoteDialog, setShowNoteDialog] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const daysTillDeadline = Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysTillDeadline <= 7;

  // Update isSaved when match prop changes
  React.useEffect(() => {
    setIsSaved(
      match?.status && ['saved', 'pursuing', 'submitted', 'won', 'lost'].includes(match.status)
    );
  }, [match?.status]);

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

  const handleSaveClick = () => {
    if (!isSaved) {
      setShowNoteDialog(true);
    } else {
      handleUnsave();
    }
  };

  const handleSaveWithNote = () => {
    setIsSaved(true);
    setShowNoteDialog(false);
    onSave?.(opportunity, noteText);
    setNoteText('');
  };

  const handleUnsave = async () => {
    // When unsaving, set status back to 'new'
    if (match) {
      const { OpportunityMatch } = await import('@/entities/all');
      await OpportunityMatch.update(match.id, { status: 'new' });
      setIsSaved(false);
      // Call the onUnsave callback to update parent component
      if (onUnsave) {
        onUnsave(match.id);
      }
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all duration-200 border-slate-200 ${compact ? '' : 'mb-4'}`}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2">
                  {opportunity.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span className="font-medium">{opportunity.buyer_organization}</span>
                  </div>
                  {opportunity.source_url && (
                    <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-neura-teal hover:text-neura-teal hover:bg-teal-50">
                      <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-xs">View Original</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>

              {match && (
                <div className="flex items-center gap-2">
                  <Badge className={`${getRelevanceColor(match.relevance_score)} border font-semibold hover:bg-transparent`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {match.relevance_score}% Match
                  </Badge>
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="sm"
                    onClick={handleSaveClick}
                    className={`h-7 px-3 ${isSaved ? "bg-neura-teal hover:bg-neura-lightTeal text-white" : "hover:bg-teal-50 border-neura-teal text-neura-teal"}`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                    <span className="text-xs">{isSaved ? 'Saved' : 'Save'}</span>
                  </Button>
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
            <div className="text-slate-600 text-sm">
              <p className={isExpanded ? "" : "line-clamp-2"}>
                {opportunity.description}
              </p>
              {opportunity.description.length > 150 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 h-7 px-2 text-neura-teal hover:text-neura-teal hover:bg-teal-50"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 mr-1" />
                      Read More
                    </>
                  )}
                </Button>
              )}
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

        </div>
      </CardContent>
    </Card>

    {/* Note Dialog */}
    <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
      <DialogContent>
        <DialogClose onClick={() => setShowNoteDialog(false)} />
        <DialogHeader>
          <DialogTitle>Add a Note</DialogTitle>
          <DialogDescription>
            Add an internal note for this opportunity. You can view and edit this later in the Saved page.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder="Add your notes about this opportunity..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-32"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setShowNoteDialog(false);
              setNoteText('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveWithNote}
            className="bg-neura-teal hover:bg-neura-lightTeal text-white"
          >
            Save Opportunity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}