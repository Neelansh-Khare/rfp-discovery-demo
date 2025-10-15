import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { STANDARD_CATEGORIES } from "@/constants/categories";

const regions = [
  { value: "british_columbia", label: "British Columbia" },
  { value: "alberta", label: "Alberta" },
  { value: "yukon", label: "Yukon" },
  { value: "ontario", label: "Ontario" },
  { value: "quebec", label: "Quebec" },
  { value: "saskatchewan", label: "Saskatchewan" },
  { value: "manitoba", label: "Manitoba" },
  { value: "new_brunswick", label: "New Brunswick" },
  { value: "nova_scotia", label: "Nova Scotia" },
  { value: "national", label: "National" }
];

export default function ManualRFPEntryDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    buyer_organization: '',
    category: '',
    region: '',
    description: '',
    deadline: '',
    budget: '',
    relevancy_score: '',
    source_url: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.buyer_organization.trim()) {
      newErrors.buyer_organization = 'Organization is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.region) {
      newErrors.region = 'Region is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
    }

    // Validate relevancy score if provided
    if (formData.relevancy_score) {
      const score = parseFloat(formData.relevancy_score);
      if (isNaN(score) || score < 0 || score > 100) {
        newErrors.relevancy_score = 'Relevancy score must be between 0 and 100';
      }
    }

    // Validate URL if provided
    if (formData.source_url && !isValidUrl(formData.source_url)) {
      newErrors.source_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const opportunityData = {
      ...formData,
      budget_min: formData.budget ? parseFloat(formData.budget) : null,
      budget_max: formData.budget ? parseFloat(formData.budget) : null,
      relevancy_score: formData.relevancy_score ? parseFloat(formData.relevancy_score) : null,
      status: 'active',
      created_date: new Date().toISOString()
    };

    onSubmit(opportunityData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      buyer_organization: '',
      category: '',
      region: '',
      description: '',
      deadline: '',
      budget: '',
      relevancy_score: '',
      source_url: ''
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClick={handleClose} />
        <DialogHeader>
          <DialogTitle>Add Manual RFP Entry</DialogTitle>
          <DialogDescription>
            Enter the details of the RFP opportunity you'd like to track. Fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Urban Planning Services for City Centre"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          {/* Organization */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization *</Label>
            <Input
              id="organization"
              value={formData.buyer_organization}
              onChange={(e) => handleChange('buyer_organization', e.target.value)}
              placeholder="e.g., City of Vancouver"
              className={errors.buyer_organization ? 'border-red-500' : ''}
            />
            {errors.buyer_organization && <p className="text-sm text-red-500">{errors.buyer_organization}</p>}
          </div>

          {/* Specialization and Region - Side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Specialization *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  {STANDARD_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region *</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => handleChange('region', value)}
              >
                <SelectTrigger className={errors.region ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(reg => (
                    <SelectItem key={reg.value} value={reg.value}>
                      {reg.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.region && <p className="text-sm text-red-500">{errors.region}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a detailed description of the RFP..."
              className={`min-h-24 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline *</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={errors.deadline ? 'border-red-500' : ''}
            />
            {errors.deadline && <p className="text-sm text-red-500">{errors.deadline}</p>}
          </div>

          {/* Budget Value */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget Value (CAD) - Optional</Label>
            <Input
              id="budget"
              type="number"
              placeholder="Enter budget value"
              value={formData.budget}
              onChange={(e) => handleChange('budget', e.target.value)}
              min="0"
              className={errors.budget ? 'border-red-500' : ''}
            />
            {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
          </div>

          {/* Relevancy Score */}
          <div className="space-y-2">
            <Label htmlFor="relevancy_score">Relevancy Score (0-100) - Optional</Label>
            <Input
              id="relevancy_score"
              type="number"
              placeholder="Enter relevancy score"
              value={formData.relevancy_score}
              onChange={(e) => handleChange('relevancy_score', e.target.value)}
              min="0"
              max="100"
              className={errors.relevancy_score ? 'border-red-500' : ''}
            />
            {errors.relevancy_score && <p className="text-sm text-red-500">{errors.relevancy_score}</p>}
            <p className="text-xs text-slate-500">Set a custom relevancy score for this opportunity (0-100)</p>
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <Label htmlFor="source_url">Source URL - Optional</Label>
            <Input
              id="source_url"
              type="url"
              value={formData.source_url}
              onChange={(e) => handleChange('source_url', e.target.value)}
              placeholder="https://example.com/rfp"
              className={errors.source_url ? 'border-red-500' : ''}
            />
            {errors.source_url && <p className="text-sm text-red-500">{errors.source_url}</p>}
          </div>
        </form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-neura-teal hover:bg-neura-lightTeal text-white"
            type="submit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add RFP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
