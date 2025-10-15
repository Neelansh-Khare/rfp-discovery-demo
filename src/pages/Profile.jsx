import React, { useState, useEffect } from "react";
import { Company, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { STANDARD_CATEGORIES } from "@/constants/categories";

// Profile edit rate limiting constants
const PROFILE_EDIT_STORAGE_KEY = 'profile_edit_history';
const MAX_EDITS_PER_WEEK = 3; // 3 edits per week

const regions = [
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "yukon", label: "Yukon" }
];

// Helper functions for rate limiting (per week)
const getEditHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem(PROFILE_EDIT_STORAGE_KEY) || '[]');
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return history.filter(timestamp => timestamp > oneWeekAgo);
  } catch {
    return [];
  }
};

const canEdit = () => {
  return getEditHistory().length < MAX_EDITS_PER_WEEK;
};

const recordEdit = () => {
  const history = getEditHistory();
  history.push(Date.now());
  localStorage.setItem(PROFILE_EDIT_STORAGE_KEY, JSON.stringify(history));
};

const getTimeUntilNextEdit = () => {
  const history = getEditHistory();
  if (history.length === 0) return null;
  const oldestEdit = Math.min(...history);
  const timeUntilReset = (oldestEdit + 7 * 24 * 60 * 60 * 1000) - Date.now();
  const days = Math.ceil(timeUntilReset / (1000 * 60 * 60 * 24));
  return days;
};

// Get button color based on edits remaining
const getButtonColor = (editsRemaining) => {
  if (editsRemaining === 0) return "bg-slate-400 hover:bg-slate-400 cursor-not-allowed opacity-60";
  if (editsRemaining === 1) return "bg-red-500 hover:bg-red-600";
  if (editsRemaining === 2) return "bg-yellow-500 hover:bg-yellow-600";
  return "bg-neura-teal hover:bg-neura-lightTeal"; // 3 edits remaining - NeuraCities green
};

export default function Profile() {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editCount, setEditCount] = useState(getEditHistory().length);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    services_capabilities: "",
    mission_values: "",
    company_overview: "",
    industry_sectors: [],
    target_regions: [],
    min_contract_value: "",
    max_contract_value: "",
    team_size: ""
  });

  useEffect(() => {
    loadCompanyProfile();
  }, []);

  const loadCompanyProfile = async () => {
    setIsLoading(true);
    try {
      const companies = await Company.list();
      if (companies.length > 0) {
        const comp = companies[0];
        setCompany(comp);
        setFormData({
          name: comp.name || "",
          services_capabilities: comp.services_capabilities || "",
          mission_values: comp.mission_values || "",
          company_overview: comp.company_overview || "",
          industry_sectors: comp.industry_sectors || [],
          target_regions: comp.target_regions || [],
          min_contract_value: comp.min_contract_value || "",
          max_contract_value: comp.max_contract_value || "",
          team_size: comp.team_size || ""
        });
      }
    } catch (error) {
      console.error("Error loading company profile:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSave = async () => {
    // Check if user can edit
    if (!canEdit()) {
      const daysUntilReset = getTimeUntilNextEdit();
      toast({
        title: "Edit limit reached",
        description: `You've reached the maximum of 3 profile edits per week. You can edit again in ${daysUntilReset} day${daysUntilReset > 1 ? 's' : ''}.`,
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        min_contract_value: formData.min_contract_value ? parseFloat(formData.min_contract_value) : null,
        max_contract_value: formData.max_contract_value ? parseFloat(formData.max_contract_value) : null
      };

      if (company) {
        await Company.update(company.id, dataToSave);
      } else {
        const newCompany = await Company.create(dataToSave);
        setCompany(newCompany);
      }

      // Record this edit
      recordEdit();
      setEditCount(getEditHistory().length);

      const editsRemaining = MAX_EDITS_PER_WEEK - getEditHistory().length;

      toast({
        title: "Profile saved successfully",
        description: `Your company profile has been updated. ${editsRemaining} edit${editsRemaining !== 1 ? 's' : ''} remaining this week.`
      });

    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Please try again.",
        variant: "destructive"
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-64 bg-slate-200 rounded"></div>
            <div className="h-48 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const editsRemaining = MAX_EDITS_PER_WEEK - editCount;
  const isLimitReached = !canEdit();

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
            <p className="text-slate-600 mt-1">Configure your preferences for better RFP matching</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLimitReached}
              className={`${getButtonColor(editsRemaining)} text-white`}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : isLimitReached ? "Edit Limit Reached" : "Save Profile"}
            </Button>
            <p className="text-xs text-slate-600">
              You have {editsRemaining} profile change{editsRemaining !== 1 ? 's' : ''} left this week
            </p>
          </div>
        </div>

        {/* Edit Limit Warning */}
        {editCount >= 2 && (
          <Card className={`border-2 ${isLimitReached ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isLimitReached ? 'text-red-600' : 'text-yellow-600'}`} />
              <div>
                <p className={`font-semibold ${isLimitReached ? 'text-red-900' : 'text-yellow-900'}`}>
                  {isLimitReached ? 'Profile Edit Limit Reached' : 'Profile Edit Limit Warning'}
                </p>
                <p className={`text-sm ${isLimitReached ? 'text-red-700' : 'text-yellow-700'}`}>
                  {isLimitReached
                    ? `You've used all 3 profile edits. You can edit again in ${getTimeUntilNextEdit()} day${getTimeUntilNextEdit() > 1 ? 's' : ''}.`
                    : `You have ${editsRemaining} profile edit${editsRemaining !== 1 ? 's' : ''} remaining this week.`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your company name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_overview">Company Overview</Label>
                <Textarea
                  id="company_overview"
                  value={formData.company_overview}
                  onChange={(e) => handleInputChange('company_overview', e.target.value)}
                  placeholder="Provide a brief overview of your company..."
                  className="min-h-24"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services_capabilities">Services & Capabilities</Label>
                <Textarea
                  id="services_capabilities"
                  value={formData.services_capabilities}
                  onChange={(e) => handleInputChange('services_capabilities', e.target.value)}
                  placeholder="Describe your core services, capabilities, and areas of expertise..."
                  className="min-h-32"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission_values">Mission & Values</Label>
                <Textarea
                  id="mission_values"
                  value={formData.mission_values}
                  onChange={(e) => handleInputChange('mission_values', e.target.value)}
                  placeholder="Share your company's mission, values, and what sets you apart..."
                  className="min-h-32"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minBudget">Min Contract Value (CAD)</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    value={formData.min_contract_value}
                    onChange={(e) => handleInputChange('min_contract_value', e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">Max Contract Value (CAD)</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    value={formData.max_contract_value}
                    onChange={(e) => handleInputChange('max_contract_value', e.target.value)}
                    placeholder="1000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Specialization */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Company Specialization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {STANDARD_CATEGORIES.map((industry) => (
                  <div key={industry.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry.value}
                      checked={formData.industry_sectors.includes(industry.value)}
                      onCheckedChange={() => toggleArrayField('industry_sectors', industry.value)}
                    />
                    <Label htmlFor={industry.value} className="text-sm">
                      {industry.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Regions */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Target Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {regions.map((region) => (
                  <div key={region.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={region.value}
                      checked={formData.target_regions.includes(region.value)}
                      onCheckedChange={() => toggleArrayField('target_regions', region.value)}
                    />
                    <Label htmlFor={region.value} className="text-sm">
                      {region.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}