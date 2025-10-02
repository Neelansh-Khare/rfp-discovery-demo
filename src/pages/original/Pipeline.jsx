import React, { useState, useEffect } from "react";
import { OpportunityMatch, Opportunity, Company } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bookmark, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  Target,
  FileText,
  Edit3,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

import OpportunityCard from "../components/opportunities/OpportunityCard";

export default function Pipeline() {
  const [matches, setMatches] = useState([]);
  const [opportunities, setOpportunities] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [company, setCompany] = useState(null);
  const [editingMatch, setEditingMatch] = useState(null);
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    setIsLoading(true);
    try {
      // Get user's company
      const companies = await Company.list();
      const userCompany = companies[0];
      setCompany(userCompany);

      if (!userCompany) return;

      // Get all matches for this company that are saved or in progress
      const savedMatches = await OpportunityMatch.filter(
        { company_id: userCompany.id },
        '-updated_date'
      );

      const pipelineMatches = savedMatches.filter(match => 
        ['saved', 'pursuing', 'submitted', 'won', 'lost'].includes(match.status)
      );

      setMatches(pipelineMatches);

      // Load opportunity details for each match
      const opportunityData = {};
      const allOpportunities = await Opportunity.list();
      
      for (const match of pipelineMatches) {
        const opp = allOpportunities.find(o => o.id === match.opportunity_id);
        if (opp) {
          opportunityData[match.opportunity_id] = opp;
        }
      }
      
      setOpportunities(opportunityData);

    } catch (error) {
      console.error("Error loading pipeline data:", error);
    }
    setIsLoading(false);
  };

  const updateMatchStatus = async (matchId, newStatus) => {
    try {
      await OpportunityMatch.update(matchId, { status: newStatus });
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, status: newStatus } : match
      ));
    } catch (error) {
      console.error("Error updating match status:", error);
    }
  };

  const updateMatchNotes = async (matchId, notes) => {
    try {
      await OpportunityMatch.update(matchId, { notes });
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, notes } : match
      ));
      setEditingMatch(null);
      setNewNotes("");
    } catch (error) {
      console.error("Error updating match notes:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'saved': return <Bookmark className="w-4 h-4 text-blue-500" />;
      case 'pursuing': return <Target className="w-4 h-4 text-amber-500" />;
      case 'submitted': return <Clock className="w-4 h-4 text-purple-500" />;
      case 'won': return <Trophy className="w-4 h-4 text-green-500" />;
      case 'lost': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'saved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pursuing': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'submitted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'won': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterMatchesByStatus = (status) => {
    if (status === 'all') return matches;
    return matches.filter(match => match.status === status);
  };

  const getTabCounts = () => {
    const counts = {
      all: matches.length,
      saved: matches.filter(m => m.status === 'saved').length,
      pursuing: matches.filter(m => m.status === 'pursuing').length,
      submitted: matches.filter(m => m.status === 'submitted').length,
      won: matches.filter(m => m.status === 'won').length,
      lost: matches.filter(m => m.status === 'lost').length,
    };
    return counts;
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const counts = getTabCounts();

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Pipeline</h1>
            <p className="text-slate-600 mt-1">Track your RFP opportunities from discovery to completion</p>
          </div>
        </div>

        {/* Pipeline Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-6 w-full max-w-2xl bg-slate-100">
            <TabsTrigger value="all" className="data-[state=active]:bg-white">
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-white">
              Saved ({counts.saved})
            </TabsTrigger>
            <TabsTrigger value="pursuing" className="data-[state=active]:bg-white">
              Pursuing ({counts.pursuing})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-white">
              Submitted ({counts.submitted})
            </TabsTrigger>
            <TabsTrigger value="won" className="data-[state=active]:bg-white">
              Won ({counts.won})
            </TabsTrigger>
            <TabsTrigger value="lost" className="data-[state=active]:bg-white">
              Lost ({counts.lost})
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          {['all', 'saved', 'pursuing', 'submitted', 'won', 'lost'].map(status => (
            <TabsContent key={status} value={status} className="mt-8">
              <div className="space-y-6">
                {filterMatchesByStatus(status).length > 0 ? (
                  filterMatchesByStatus(status).map(match => {
                    const opportunity = opportunities[match.opportunity_id];
                    if (!opportunity) return null;

                    return (
                      <Card key={match.id} className="shadow-sm border-slate-200">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Opportunity Info with Status */}
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <OpportunityCard 
                                  opportunity={opportunity}
                                  match={match}
                                  compact={true}
                                />
                              </div>
                              <div className="ml-6 flex flex-col gap-3">
                                <Badge className={`${getStatusColor(match.status)} border flex items-center gap-1`}>
                                  {getStatusIcon(match.status)}
                                  {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                                </Badge>
                                <Select
                                  value={match.status}
                                  onValueChange={(newStatus) => updateMatchStatus(match.id, newStatus)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="saved">Saved</SelectItem>
                                    <SelectItem value="pursuing">Pursuing</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="won">Won</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Notes Section */}
                            <div className="border-t border-slate-100 pt-4">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-slate-900">Internal Notes</h4>
                                {editingMatch !== match.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingMatch(match.id);
                                      setNewNotes(match.notes || "");
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {editingMatch === match.id ? (
                                <div className="space-y-3">
                                  <Textarea
                                    value={newNotes}
                                    onChange={(e) => setNewNotes(e.target.value)}
                                    placeholder="Add your notes about this opportunity..."
                                    className="min-h-20"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => updateMatchNotes(match.id, newNotes)}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setEditingMatch(null);
                                        setNewNotes("");
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-sm text-slate-600">
                                  {match.notes ? (
                                    <p className="bg-slate-50 p-3 rounded border">{match.notes}</p>
                                  ) : (
                                    <p className="text-slate-400 italic">No notes yet. Click edit to add notes.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 text-slate-300">
                      {getStatusIcon(status)}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No {status === 'all' ? 'pipeline' : status} opportunities
                    </h3>
                    <p className="text-slate-600">
                      {status === 'all' 
                        ? 'Save opportunities from the browser to start building your pipeline'
                        : `No opportunities in ${status} status yet`
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}