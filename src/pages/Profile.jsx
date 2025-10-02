import React, { useState, useEffect } from "react";
import { Company, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const industries = [
  { value: "construction", label: "Construction" },
  { value: "consulting", label: "Consulting" },
  { value: "it_services", label: "IT Services" },
  { value: "professional_services", label: "Professional Services" },
  { value: "engineering", label: "Engineering" },
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security" },
  { value: "environmental", label: "Environmental" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "transportation", label: "Transportation" },
  { value: "utilities", label: "Utilities" },
  { value: "food_services", label: "Food Services" },
  { value: "equipment_supply", label: "Equipment Supply" },
  { value: "software_development", label: "Software Development" }
];

const regions = [
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "saskatchewan", label: "Saskatchewan" },
  { value: "manitoba", label: "Manitoba" },
  { value: "ontario", label: "Ontario" },
  { value: "quebec", label: "Quebec" },
  { value: "new_brunswick", label: "New Brunswick" },
  { value: "nova_scotia", label: "Nova Scotia" },
  { value: "prince_edward_island", label: "Prince Edward Island" },
  { value: "newfoundland_labrador", label: "Newfoundland & Labrador" },
  { value: "northwest_territories", label: "Northwest Territories" },
  { value: "nunavut", label: "Nunavut" },
  { value: "yukon", label: "Yukon" },
  { value: "national", label: "National" }
];

export default function Profile() {
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newExcludedKeyword, setNewExcludedKeyword] = useState("");
  const [newCapability, setNewCapability] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    industry_sectors: [],
    target_regions: [],
    capabilities: [],
    keywords: [],
    excluded_keywords: [],
    min_contract_value: "",
    max_contract_value: "",
    certifications: [],
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
          industry_sectors: comp.industry_sectors || [],
          target_regions: comp.target_regions || [],
          capabilities: comp.capabilities || [],
          keywords: comp.keywords || [],
          excluded_keywords: comp.excluded_keywords || [],
          min_contract_value: comp.min_contract_value || "",
          max_contract_value: comp.max_contract_value || "",
          certifications: comp.certifications || [],
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

  const addToArrayField = (field, value, setter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()]
      }));
      setter("");
    }
  };

  const removeFromArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
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

      toast({
        title: "Profile saved successfully",
        description: "Your company profile has been updated."
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

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
            <p className="text-slate-600 mt-1">Configure your preferences for better RFP matching</p>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-neura-coral hover:bg-neura-coralLight text-white">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
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
                  <Label>Team Size</Label>
                  <Select
                    value={formData.team_size}
                    onValueChange={(value) => handleInputChange('team_size', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
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

            {/* Industry Sectors */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Industry Sectors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {industries.map((industry) => (
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
                <div className="grid grid-cols-2 gap-3">
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

          {/* Keywords and Capabilities */}
          <div className="space-y-6">
            {/* Keywords */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Keywords to Match</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add keyword"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToArrayField('keywords', newKeyword, setNewKeyword);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArrayField('keywords', newKeyword, setNewKeyword)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeFromArrayField('keywords', index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Excluded Keywords */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Keywords to Avoid</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newExcludedKeyword}
                    onChange={(e) => setNewExcludedKeyword(e.target.value)}
                    placeholder="Add excluded keyword"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToArrayField('excluded_keywords', newExcludedKeyword, setNewExcludedKeyword);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArrayField('excluded_keywords', newExcludedKeyword, setNewExcludedKeyword)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.excluded_keywords.map((keyword, index) => (
                    <Badge key={index} variant="destructive" className="flex items-center gap-1">
                      {keyword}
                      <button
                        onClick={() => removeFromArrayField('excluded_keywords', index)}
                        className="ml-1 hover:text-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Capabilities */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Key Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    placeholder="Add capability"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToArrayField('capabilities', newCapability, setNewCapability);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArrayField('capabilities', newCapability, setNewCapability)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.capabilities.map((capability, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {capability}
                      <button
                        onClick={() => removeFromArrayField('capabilities', index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="Add certification"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addToArrayField('certifications', newCertification, setNewCertification);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => addToArrayField('certifications', newCertification, setNewCertification)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                      {cert}
                      <button
                        onClick={() => removeFromArrayField('certifications', index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}