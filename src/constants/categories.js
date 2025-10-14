// Standardized industry categories used across the application
export const STANDARD_CATEGORIES = [
  { value: "policy_planning", label: "Policy Planning" },
  { value: "engineering_planning", label: "Engineering Planning" },
  { value: "land_use", label: "Land Use" },
  { value: "construction", label: "Construction" },
  { value: "transportation", label: "Transportation" },
  { value: "technology", label: "Technology" },
  { value: "engagement", label: "Engagement" },
  { value: "environmental_planning", label: "Environmental Planning" },
  { value: "economic_development", label: "Economic Development" },
  { value: "infrastructure_planning", label: "Infrastructure Planning" },
  { value: "urban_planning", label: "Urban Planning" },
  { value: "other", label: "Other" }
];

// Category colors for badges
export const categoryColors = {
  policy_planning: "bg-blue-100 text-blue-800 border-blue-200",
  engineering_planning: "bg-indigo-100 text-indigo-800 border-indigo-200",
  land_use: "bg-green-100 text-green-800 border-green-200",
  construction: "bg-orange-100 text-orange-800 border-orange-200",
  transportation: "bg-purple-100 text-purple-800 border-purple-200",
  technology: "bg-cyan-100 text-cyan-800 border-cyan-200",
  engagement: "bg-pink-100 text-pink-800 border-pink-200",
  environmental_planning: "bg-emerald-100 text-emerald-800 border-emerald-200",
  economic_development: "bg-yellow-100 text-yellow-800 border-yellow-200",
  infrastructure_planning: "bg-slate-100 text-slate-800 border-slate-200",
  urban_planning: "bg-teal-100 text-teal-800 border-teal-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

// Helper function to get category label from value
export const getCategoryLabel = (value) => {
  const category = STANDARD_CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value?.replace(/_/g, ' ') || 'Unknown';
};

// Helper function to get category color
export const getCategoryColor = (value) => {
  return categoryColors[value] || categoryColors.other;
};
