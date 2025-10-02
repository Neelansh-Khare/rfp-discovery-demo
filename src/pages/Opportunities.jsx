
import React, { useState, useEffect, useCallback } from "react";
import { Opportunity, OpportunityMatch, Company } from "@/entities/all";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, SlidersHorizontal, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import OpportunityCard from "../components/opportunities/OpportunityCard";
import OpportunityFilters from "../components/opportunities/OpportunityFilters";

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [matches, setMatches] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [company, setCompany] = useState(null);
  
  const [filters, setFilters] = useState({
    regions: [],
    categories: [],
    minBudget: "",
    maxBudget: "",
    minRelevance: 0,
    deadlineRange: "all",
    status: "active"
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = opportunities.filter(opp => {
      // Search term filter
      if (searchTerm && !opp.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !opp.buyer_organization.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Region filter
      if (filters.regions.length > 0 && !filters.regions.includes(opp.region)) {
        return false;
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(opp.category)) {
        return false;
      }

      // Budget filters
      if (filters.minBudget && opp.budget_max && opp.budget_max < parseInt(filters.minBudget)) {
        return false;
      }
      if (filters.maxBudget && opp.budget_min && opp.budget_min > parseInt(filters.maxBudget)) {
        return false;
      }

      // Deadline filter
      if (filters.deadlineRange !== "all") {
        const deadline = new Date(opp.deadline);
        const now = new Date();
        const daysDiff = (deadline - now) / (1000 * 60 * 60 * 24);
        
        switch (filters.deadlineRange) {
          case "7days":
            if (daysDiff > 7) return false;
            break;
          case "30days":
            if (daysDiff > 30) return false;
            break;
          case "90days":
            if (daysDiff > 90) return false;
            break;
        }
      }

      return true;
    });

    // Apply relevance filter
    if (filters.minRelevance > 0 && company) {
      filtered = filtered.filter(opp => {
        const match = matches.find(m => m.opportunity_id === opp.id);
        return match && match.relevance_score >= filters.minRelevance;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "relevance" && company) {
        const matchA = matches.find(m => m.opportunity_id === a.id);
        const matchB = matches.find(m => m.opportunity_id === b.id);
        const scoreA = matchA?.relevance_score || 0;
        const scoreB = matchB?.relevance_score || 0;
        return scoreB - scoreA;
      } else if (sortBy === "deadline") {
        return new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === "budget") {
        const budgetA = a.budget_max || a.budget_min || 0;
        const budgetB = b.budget_max || b.budget_min || 0;
        return budgetB - budgetA;
      }
      return new Date(b.created_date) - new Date(a.created_date);
    });

    setFilteredOpportunities(filtered);
  }, [opportunities, matches, searchTerm, filters, sortBy, company]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      // Get user's company
      const companies = await Company.list();
      const userCompany = companies[0];
      setCompany(userCompany);

      // Load opportunities
      const opps = await Opportunity.filter({ status: "active" }, "-created_date");
      setOpportunities(opps);

      // Load matches if company exists
      if (userCompany) {
        const companyMatches = await OpportunityMatch.filter(
          { company_id: userCompany.id }, 
          "-relevance_score"
        );
        setMatches(companyMatches);
      }

    } catch (error) {
      console.error("Error loading opportunities:", error);
    }
    setIsLoading(false);
  };

  const handleSaveOpportunity = async (opportunity) => {
    if (!company) return;
    
    // Check if match already exists
    const existingMatch = matches.find(m => m.opportunity_id === opportunity.id);
    
    if (existingMatch) {
      // Update status to saved
      await OpportunityMatch.update(existingMatch.id, { status: "saved" });
    } else {
      // Create new match
      await OpportunityMatch.create({
        company_id: company.id,
        opportunity_id: opportunity.id,
        relevance_score: 50, // Default score
        status: "saved"
      });
    }
    
    // Reload matches
    const updatedMatches = await OpportunityMatch.filter(
      { company_id: company.id }, 
      "-relevance_score"
    );
    setMatches(updatedMatches);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Filters Sidebar */}
      {showFilters && (
        <div className="w-80 bg-white border-r border-slate-200 flex-shrink-0">
          <OpportunityFilters 
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Opportunities</h1>
              <p className="text-slate-600 mt-1">
                {filteredOpportunities.length} opportunities found
              </p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex-1 md:flex-none"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline" className="flex-1 md:flex-none">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Search and Sort Bar */}
          <div className="flex gap-4 mt-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search opportunities, organizations, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-50 border-slate-300 w-full"
              />
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-shrink-0">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Best Match</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="space-y-6">
              {Array(5).fill(0).map((_, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-20 w-full mb-4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredOpportunities.length > 0 ? (
            <div className="space-y-6">
              {filteredOpportunities.map((opportunity) => {
                const match = matches.find(m => m.opportunity_id === opportunity.id);
                return (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    match={match}
                    onSave={handleSaveOpportunity}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No opportunities found</h3>
              <p className="text-slate-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
