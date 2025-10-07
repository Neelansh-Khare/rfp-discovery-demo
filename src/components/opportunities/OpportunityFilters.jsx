import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, RotateCcw } from "lucide-react";

const regions = [
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "ontario", label: "Ontario" },
  { value: "quebec", label: "Quebec" },
  { value: "saskatchewan", label: "Saskatchewan" },
  { value: "manitoba", label: "Manitoba" },
  { value: "new_brunswick", label: "New Brunswick" },
  { value: "nova_scotia", label: "Nova Scotia" },
  { value: "national", label: "National" }
];

const categories = [
  { value: "construction", label: "Construction" },
  { value: "consulting", label: "Consulting" },
  { value: "it_services", label: "IT Services" },
  { value: "professional_services", label: "Professional Services" },
  { value: "engineering", label: "Engineering" },
  { value: "maintenance", label: "Maintenance" },
  { value: "environmental", label: "Environmental" }
];

export default function OpportunityFilters({ filters, onFiltersChange, onClose }) {
  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    updateFilter(key, updated);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      regions: [],
      categories: [],
      minBudget: "",
      maxBudget: "",
      minRelevance: 0,
      deadlineRange: "all",
      status: "active",
      sortBy: "relevance"
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Sort By */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Sort By</Label>
          <Select
            value={filters.sortBy || "relevance"}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Best Match</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Relevance Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">Minimum Relevance Score</Label>
            <span className="text-sm font-semibold text-neura-teal">{filters.minRelevance}%</span>
          </div>
          <div className="px-3">
            <Slider
              value={[filters.minRelevance]}
              onValueChange={([value]) => updateFilter('minRelevance', value)}
              max={100}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Budget Range (CAD)</Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="minBudget" className="text-xs text-slate-500">Min</Label>
              <Input
                id="minBudget"
                type="number"
                placeholder="0"
                value={filters.minBudget}
                onChange={(e) => updateFilter('minBudget', e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="maxBudget" className="text-xs text-slate-500">Max</Label>
              <Input
                id="maxBudget"
                type="number"
                placeholder="No limit"
                value={filters.maxBudget}
                onChange={(e) => updateFilter('maxBudget', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Deadline Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Deadline</Label>
          <Select
            value={filters.deadlineRange}
            onValueChange={(value) => updateFilter('deadlineRange', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deadlines</SelectItem>
              <SelectItem value="7days">Next 7 days</SelectItem>
              <SelectItem value="30days">Next 30 days</SelectItem>
              <SelectItem value="90days">Next 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}