import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import DislikeFeedbackDialog from "./DislikeFeedbackDialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getCategoryColor, getCategoryLabel } from "@/constants/categories";
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
  ChevronUp,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

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

// Generate mock tooltip explanation
const generateTooltipExplanation = (opportunity, score) => {
  const categoryMatch = `Strong alignment with ${opportunity.category?.replace(/_/g, ' ')} sector`;
  const regionMatch = `Located in your target region: ${regionNames[opportunity.region] || opportunity.region}`;
  const budgetMatch = "Budget range matches your capacity";
  const keywordsMatch = "Keywords match your capabilities profile";
  const pastExperience = "Similar past project experience detected";

  const explanations = [categoryMatch, regionMatch, budgetMatch, keywordsMatch, pastExperience];

  // Return 1-2 reasons based on score
  if (score > 85) {
    return explanations.slice(0, 2).join('. ') + '.';
  } else if (score > 75) {
    return explanations[0] + '.';
  }
  return "Moderate match based on profile analysis.";
};

// LocalStorage keys for like/dislike persistence
const LIKED_OPPORTUNITIES_KEY = 'liked_opportunities';
const DISLIKED_OPPORTUNITIES_KEY = 'disliked_opportunities';

// Helper functions for localStorage
const getLikedOpportunities = () => {
  try {
    return JSON.parse(localStorage.getItem(LIKED_OPPORTUNITIES_KEY) || '[]');
  } catch {
    return [];
  }
};

const getDislikedOpportunities = () => {
  try {
    return JSON.parse(localStorage.getItem(DISLIKED_OPPORTUNITIES_KEY) || '[]');
  } catch {
    return [];
  }
};

const toggleLikedOpportunity = (opportunityId) => {
  const liked = getLikedOpportunities();
  const isLiked = liked.includes(opportunityId);

  if (isLiked) {
    // Remove from liked
    const updated = liked.filter(id => id !== opportunityId);
    localStorage.setItem(LIKED_OPPORTUNITIES_KEY, JSON.stringify(updated));
    return false;
  } else {
    // Add to liked
    liked.push(opportunityId);
    localStorage.setItem(LIKED_OPPORTUNITIES_KEY, JSON.stringify(liked));
    return true;
  }
};

const toggleDislikedOpportunity = (opportunityId, feedback) => {
  const disliked = getDislikedOpportunities();
  const existingIndex = disliked.findIndex(item => item.id === opportunityId);

  if (existingIndex !== -1) {
    // Remove from disliked
    disliked.splice(existingIndex, 1);
    localStorage.setItem(DISLIKED_OPPORTUNITIES_KEY, JSON.stringify(disliked));
    return false;
  } else {
    // Add to disliked
    disliked.push({ id: opportunityId, feedback, timestamp: Date.now() });
    localStorage.setItem(DISLIKED_OPPORTUNITIES_KEY, JSON.stringify(disliked));
    return true;
  }
};

export default function OpportunityCard({ opportunity, match, compact = false, onSave, onUnsave, onDislike }) {
  const [isSaved, setIsSaved] = React.useState(
    match?.status && ['saved', 'pursuing', 'submitted', 'won', 'lost'].includes(match.status)
  );
  const [showNoteDialog, setShowNoteDialog] = React.useState(false);
  const [showDislikeDialog, setShowDislikeDialog] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [shouldShowReadMore, setShouldShowReadMore] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isDisliked, setIsDisliked] = React.useState(false);
  const descriptionRef = React.useRef(null);
  const daysTillDeadline = Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysTillDeadline <= 7;

  // Load like/dislike state from localStorage on mount
  React.useEffect(() => {
    const likedOpportunities = getLikedOpportunities();
    const dislikedOpportunities = getDislikedOpportunities();
    setIsLiked(likedOpportunities.includes(opportunity.id));
    setIsDisliked(dislikedOpportunities.some(item => item.id === opportunity.id));
  }, [opportunity.id]);

  // Update isSaved when match prop changes
  React.useEffect(() => {
    setIsSaved(
      match?.status && ['saved', 'pursuing', 'submitted', 'won', 'lost'].includes(match.status)
    );
  }, [match?.status]);

  // Check if description exceeds 3 lines
  React.useEffect(() => {
    if (!compact && descriptionRef.current && opportunity.description) {
      const element = descriptionRef.current;
      const lineHeight = parseInt(window.getComputedStyle(element).lineHeight);
      const maxHeight = lineHeight * 3; // 3 lines
      setShouldShowReadMore(element.scrollHeight > maxHeight);
    }
  }, [opportunity.description, compact]);

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

  const handleLike = () => {
    const newLikedState = toggleLikedOpportunity(opportunity.id);
    setIsLiked(newLikedState);
    console.log(newLikedState ? 'Liked opportunity:' : 'Unliked opportunity:', opportunity.title);
  };

  const handleDislike = () => {
    // If already disliked, toggle it off immediately
    if (isDisliked) {
      const newDislikedState = toggleDislikedOpportunity(opportunity.id, null);
      setIsDisliked(newDislikedState);
      console.log('Removed dislike from opportunity:', opportunity.title);
    } else {
      // Show dialog to collect feedback
      setShowDislikeDialog(true);
    }
  };

  const handleDislikeFeedbackSubmit = (feedback) => {
    // Save dislike with feedback to localStorage
    const newDislikedState = toggleDislikedOpportunity(opportunity.id, feedback);
    setIsDisliked(newDislikedState);
    console.log('Disliked opportunity:', opportunity.title, 'Feedback:', feedback);
    // No longer remove the card from view
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
                  {match.relevance_score > 75 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${getRelevanceColor(match.relevance_score)} border font-semibold hover:bg-transparent cursor-help`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {match.relevance_score}% Relevance Score
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs whitespace-normal">
                        {generateTooltipExplanation(opportunity, match.relevance_score)}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Badge className={`${getRelevanceColor(match.relevance_score)} border font-semibold hover:bg-transparent`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {match.relevance_score}% Relevance Score
                    </Badge>
                  )}
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
              <p
                ref={descriptionRef}
                className={isExpanded ? "" : "line-clamp-3"}
              >
                {opportunity.description}
              </p>
              {shouldShowReadMore && (
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

          {/* Details Grid with Like/Dislike buttons */}
          <div className="flex justify-between items-end gap-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
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
                <Badge className={`${getCategoryColor(opportunity.category)} border text-xs`}>
                  {getCategoryLabel(opportunity.category)}
                </Badge>
              </div>
            </div>

            {/* Like/Dislike buttons - bottom right */}
            {match && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`h-8 px-3 ${isLiked ? 'bg-green-50 text-green-600' : 'hover:bg-green-50 hover:text-green-600'} transition-colors`}
                  title="Like this opportunity"
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDislike}
                  className={`h-8 px-3 ${isDisliked ? 'bg-red-50 text-red-600' : 'hover:bg-red-50 hover:text-red-600'} transition-colors`}
                  title="Dislike this opportunity"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDisliked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            )}
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

    {/* Dislike Feedback Dialog */}
    <DislikeFeedbackDialog
      open={showDislikeDialog}
      onOpenChange={setShowDislikeDialog}
      opportunityTitle={opportunity.title}
      onSubmit={handleDislikeFeedbackSubmit}
    />
  </>
  );
}