// Utility to map old category values to new standardized categories

const categoryMappingTable = {
  // Old categories -> New standardized categories
  'professional_services': 'policy_planning',
  'engineering': 'engineering_planning',
  'consulting': 'policy_planning',
  'it_services': 'technology',
  'construction': 'construction',
  'maintenance': 'infrastructure_planning',
  'security': 'other',
  'environmental': 'environmental_planning',
  'urban_planning': 'urban_planning',
  'urban_design': 'urban_planning',
  'public_engagement': 'engagement',
  'policy_planning': 'policy_planning',
  'community_planning': 'urban_planning',
  'transportation': 'transportation',
  'land_use': 'land_use',
  'technology': 'technology',
  'engagement': 'engagement',
  'environmental_planning': 'environmental_planning',
  'economic_development': 'economic_development',
  'infrastructure_planning': 'infrastructure_planning',
  'engineering_planning': 'engineering_planning',
  'other': 'other'
};

/**
 * Maps an old category value to the new standardized category
 * @param {string} oldCategory - The old category value
 * @returns {string} The new standardized category value
 */
export const mapCategory = (oldCategory) => {
  if (!oldCategory) return 'other';
  return categoryMappingTable[oldCategory] || 'other';
};

/**
 * Maps an array of old categories to new standardized categories
 * @param {string[]} oldCategories - Array of old category values
 * @returns {string[]} Array of new standardized category values
 */
export const mapCategories = (oldCategories) => {
  if (!Array.isArray(oldCategories)) return [];
  return [...new Set(oldCategories.map(mapCategory))]; // Remove duplicates
};

/**
 * Converts an opportunity object's category to the new standard
 * @param {Object} opportunity - The opportunity object
 * @returns {Object} Opportunity with updated category
 */
export const normalizeOpportunityCategory = (opportunity) => {
  if (!opportunity) return opportunity;
  return {
    ...opportunity,
    category: mapCategory(opportunity.category)
  };
};

/**
 * Converts a company object's industry sectors to the new standard
 * @param {Object} company - The company object
 * @returns {Object} Company with updated industry sectors
 */
export const normalizeCompanyCategories = (company) => {
  if (!company) return company;
  return {
    ...company,
    industry_sectors: mapCategories(company.industry_sectors || [])
  };
};
