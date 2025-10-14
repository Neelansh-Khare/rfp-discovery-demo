import { mockCompanies, mockOpportunities, mockOpportunityMatches } from '@/lib/mockData';
import { normalizeOpportunityCategory, normalizeCompanyCategories } from '@/utils/categoryMapper';

// Simple delay function to simulate API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Entity classes that provide the same API as the original but with hardcoded data

export class Company {
  static async list() {
    await delay(300); // Simulate network delay
    return mockCompanies.map(normalizeCompanyCategories);
  }

  static async filter(criteria) {
    await delay(300);
    return mockCompanies.filter(company => {
      return Object.keys(criteria).every(key => {
        if (Array.isArray(company[key])) {
          return company[key].some(v => criteria[key].includes(v));
        }
        return company[key] === criteria[key];
      });
    });
  }

  static async get(id) {
    await delay(300);
    return mockCompanies.find(c => c.id === id);
  }

  static async update(id, data) {
    await delay(300);
    const company = mockCompanies.find(c => c.id === id);
    if (company) {
      Object.assign(company, data);
    }
    return company;
  }

  static async create(data) {
    await delay(300);
    const newCompany = {
      id: Date.now().toString(),
      ...data,
    };
    mockCompanies.push(newCompany);
    return newCompany;
  }
}

export class Opportunity {
  static async list() {
    await delay(300);
    return mockOpportunities.map(normalizeOpportunityCategory);
  }

  static async filter(criteria) {
    await delay(300);
    return mockOpportunities
      .map(normalizeOpportunityCategory)
      .filter(opp => {
        return Object.keys(criteria).every(key => {
          if (key === 'status') {
            return opp.status === criteria[key];
          }
          return opp[key] === criteria[key];
        });
      });
  }

  static async get(id) {
    await delay(300);
    const opp = mockOpportunities.find(o => o.id === id);
    return opp ? normalizeOpportunityCategory(opp) : null;
  }

  static async update(id, data) {
    await delay(300);
    const index = mockOpportunities.findIndex(o => o.id === id);
    if (index !== -1) {
      mockOpportunities[index] = { ...mockOpportunities[index], ...data };
      return mockOpportunities[index];
    }
    return null;
  }

  static async create(data) {
    await delay(300);
    const newOpp = {
      id: Date.now().toString(),
      status: 'active',
      ...data,
    };
    mockOpportunities.push(newOpp);
    return newOpp;
  }
}

export class OpportunityMatch {
  static async list() {
    await delay(300);
    return [...mockOpportunityMatches];
  }

  static async filter(criteria) {
    await delay(300);
    return mockOpportunityMatches.filter(match => {
      return Object.keys(criteria).every(key => {
        if (key === 'company_id') {
          return match.company_id === criteria[key];
        }
        if (key === 'status') {
          return match.status === criteria[key];
        }
        return match[key] === criteria[key];
      });
    });
  }

  static async get(id) {
    await delay(300);
    return mockOpportunityMatches.find(m => m.id === id);
  }

  static async update(id, data) {
    await delay(300);
    const index = mockOpportunityMatches.findIndex(m => m.id === id);
    if (index !== -1) {
      mockOpportunityMatches[index] = { ...mockOpportunityMatches[index], ...data };
      return mockOpportunityMatches[index];
    }
    return null;
  }

  static async create(data) {
    await delay(300);
    const newMatch = {
      id: Date.now().toString(),
      status: 'new',
      ...data,
    };
    mockOpportunityMatches.push(newMatch);
    return newMatch;
  }
}

// Mock User class for Profile page
export class User {
  static async getCurrent() {
    await delay(300);
    return {
      id: "68d474b503bc9d0a5709ed69",
      email: "neelansh1624@gmail.com",
      name: "Demo User",
    };
  }
}
