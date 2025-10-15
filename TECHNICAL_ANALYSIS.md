# RFP Discovery Platform - Complete Technical Analysis

**Date:** October 15, 2025
**Analyzed By:** Claude Code
**Purpose:** Backend Development Specification & Frontend Architecture Documentation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Frontend Architecture](#frontend-architecture)
3. [Data Models & Schemas](#data-models--schemas)
4. [Backend API Requirements](#backend-api-requirements)
5. [Data Persistence Requirements](#data-persistence-requirements)
6. [Code Quality Audit](#code-quality-audit)
7. [Feature Proposals](#feature-proposals)

---

## Executive Summary

This is a React-based single-page application (SPA) for RFP (Request for Proposal) discovery and management. The frontend currently uses a **mock API layer** that simulates all backend operations. This document provides complete specifications for building a production backend to replace the mock layer.

**Key Technologies:**
- React 19 + Vite
- React Router v7
- Tailwind CSS
- Mock API (to be replaced with real backend)
- LocalStorage (for client-side persistence of user preferences)

**Core Business Logic:**
- AI-powered RFP matching based on company profile
- Multi-stage pipeline management (Saved → Pursuing → Submitted → Won/Lost)
- Advanced filtering and search
- Like/Dislike feedback system
- Profile-based recommendation refinement

---

## Frontend Architecture

### 1. Application Structure

```
src/
├── pages/              # Route-level components (4 pages)
│   ├── Dashboard.jsx   # Landing page with stats and top matches
│   ├── Opportunities.jsx  # Discovery page with filters
│   ├── Pipeline.jsx    # Saved RFPs workflow management
│   └── Profile.jsx     # Company profile configuration
├── components/
│   ├── Layout.jsx      # App shell with navigation
│   ├── dashboard/      # Dashboard-specific components
│   ├── opportunities/  # RFP card, filters, dialogs
│   └── ui/             # Reusable design system components
├── entities/all.js     # Mock API layer (TO BE REPLACED)
├── lib/mockData.js     # Hardcoded data (TO BE REPLACED)
└── utils/              # Helper functions
```

### 2. Routing Structure

| Route | Component | Purpose | Data Requirements |
|-------|-----------|---------|-------------------|
| `/` | Dashboard.jsx | Landing page with stats | All opportunities + matches for user's company |
| `/opportunities` | Opportunities.jsx | Discovery & search | All opportunities + matches + company profile |
| `/pipeline` | Pipeline.jsx | Saved RFPs management | Filtered matches (status: saved/pursuing/submitted/won/lost) |
| `/profile` | Profile.jsx | Company settings | Current company profile |

### 3. Component Hierarchy & Data Flow

#### **Dashboard Page**
```
Dashboard.jsx
├── Fetches: Company, Opportunities, OpportunityMatches
├── Calculates:
│   ├── Total opportunities count
│   ├── High-relevance matches (score > 75%)
│   ├── Pipeline items count
│   └── Top 20 matches with deadline < 30 days
├── DashboardStats.jsx (displays 4 metric cards)
└── OpportunityCard.jsx (compact mode, top matches list)
    └── Save/Unsave actions → Updates OpportunityMatch.status
```

**Key Logic:**
```javascript
// Dashboard calculates stats from fetched data
const totalOpportunities = opportunities.length;
const highRelevanceCount = matches.filter(m => m.relevance_score > 75).length;
const inPipelineCount = matches.filter(m =>
  ['saved', 'pursuing', 'submitted'].includes(m.status)
).length;
```

#### **Opportunities Page**
```
Opportunities.jsx
├── Fetches: Company, Opportunities, OpportunityMatches
├── State: searchTerm, filters (regions, categories, budget, etc.)
├── OpportunityFilters.jsx (sidebar)
│   ├── Pre-populated from company.target_regions & company.industry_sectors
│   └── Updates: filters state
├── OpportunityCard.jsx (full detail mode)
│   ├── Like/Dislike buttons → localStorage
│   ├── Save button → Creates/Updates OpportunityMatch
│   └── DislikeFeedbackDialog.jsx
└── ManualRFPEntryDialog.jsx → Creates new Opportunity
```

**Key Logic:**
```javascript
// Pre-select filters from company profile on mount
useEffect(() => {
  if (company) {
    setFilters({
      regions: company.target_regions || [],
      categories: company.industry_sectors || []
    });
  }
}, [company]);

// Client-side filtering
const applyFilters = () => {
  return opportunities.filter(opp => {
    // Search term matching
    if (searchTerm && !opp.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Region filtering
    if (filters.regions.length > 0 && !filters.regions.includes(opp.region)) {
      return false;
    }
    // Category filtering
    if (filters.categories.length > 0 && !filters.categories.includes(opp.category)) {
      return false;
    }
    // Budget, deadline, relevance score filtering...
    return true;
  });
};
```

#### **Pipeline Page**
```
Pipeline.jsx
├── Fetches: OpportunityMatches (filtered by company_id)
├── State: selectedTab (Saved/Pursuing/Submitted/Won/Lost)
├── Tabs Component
│   ├── Saved (status: 'saved')
│   ├── Pursuing (status: 'pursuing')
│   ├── Submitted (status: 'submitted')
│   ├── Won (status: 'won')
│   └── Lost (status: 'lost')
└── OpportunityCard.jsx (compact mode)
    ├── Status dropdown → Updates OpportunityMatch.status
    └── Notes textarea → Updates OpportunityMatch.notes
```

**Key Logic:**
```javascript
// Filter matches by status for each tab
const savedMatches = matches.filter(m => m.status === 'saved');
const pursuingMatches = matches.filter(m => m.status === 'pursuing');
// ... etc

// Update match status
const updateMatchStatus = async (matchId, newStatus) => {
  await OpportunityMatch.update(matchId, { status: newStatus });
  // Refetch to update UI
};
```

#### **Profile Page**
```
Profile.jsx
├── Fetches: Company (first company in list, simulating current user)
├── Form Fields:
│   ├── name (text)
│   ├── company_overview (textarea)
│   ├── services_capabilities (textarea)
│   ├── mission_values (textarea)
│   ├── industry_sectors[] (checkboxes)
│   ├── target_regions[] (checkboxes)
│   ├── min_contract_value (number)
│   └── max_contract_value (number)
├── Rate Limiting Logic:
│   ├── localStorage key: 'profile_edit_history'
│   ├── Max: 3 edits per 7 days
│   └── Button color: green (3 left) → yellow (2) → red (1) → grey (0)
└── Save → Updates Company entity
```

**Rate Limiting Implementation:**
```javascript
const PROFILE_EDIT_STORAGE_KEY = 'profile_edit_history';
const MAX_EDITS_PER_WEEK = 3;

const getEditHistory = () => {
  const history = JSON.parse(localStorage.getItem(PROFILE_EDIT_STORAGE_KEY) || '[]');
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return history.filter(timestamp => timestamp > oneWeekAgo);
};

const canEdit = () => getEditHistory().length < MAX_EDITS_PER_WEEK;

const recordEdit = () => {
  const history = getEditHistory();
  history.push(Date.now());
  localStorage.setItem(PROFILE_EDIT_STORAGE_KEY, JSON.stringify(history));
};
```

### 4. State Management Pattern

**No Global State:** All state is local to components using React hooks.

**Data Fetching Pattern:**
```javascript
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    const result = await Entity.list(); // Mock API call
    setData(result);
    setIsLoading(false);
  };
  loadData();
}, []);
```

**Update Pattern:**
```javascript
const handleUpdate = async (id, newData) => {
  await Entity.update(id, newData);
  // Refetch entire dataset to ensure consistency
  const refreshedData = await Entity.list();
  setData(refreshedData);
};
```

### 5. LocalStorage Usage

The frontend uses localStorage for **client-side only** persistence:

| Key | Data Type | Purpose | Backend Equivalent |
|-----|-----------|---------|-------------------|
| `liked_opportunities` | `string[]` (opportunity IDs) | User liked RFPs | Should be `UserInteraction` table |
| `disliked_opportunities` | `object[]` `{id, feedback, timestamp}` | User disliked RFPs with reasons | Should be `UserFeedback` table |
| `profile_edit_history` | `number[]` (timestamps) | Rate limiting profile edits | Should be server-side validation |

**⚠️ Important:** These should be migrated to backend storage for:
- Data persistence across devices
- Analytics and ML training
- Security (client-side data can be manipulated)

---

## Data Models & Schemas

### 1. Company Entity

**Purpose:** Represents the user's organization and their RFP matching preferences.

**Schema:**
```json
{
  "id": "string (UUID)",
  "name": "string (required)",
  "company_overview": "string (text)",
  "services_capabilities": "string (text)",
  "mission_values": "string (text)",
  "industry_sectors": [
    "policy_planning",
    "engineering_planning",
    "land_use",
    "construction",
    "transportation",
    "technology",
    "engagement",
    "environmental_planning",
    "economic_development",
    "infrastructure_planning",
    "urban_planning",
    "other"
  ],
  "target_regions": [
    "british_columbia",
    "alberta",
    "saskatchewan",
    "manitoba",
    "ontario",
    "quebec",
    "new_brunswick",
    "nova_scotia",
    "prince_edward_island",
    "newfoundland_labrador",
    "northwest_territories",
    "nunavut",
    "yukon",
    "national"
  ],
  "min_contract_value": "number (CAD)",
  "max_contract_value": "number (CAD)",
  "team_size": "enum: 1-10 | 11-50 | 51-200 | 201-500 | 500+",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Notes:**
- `industry_sectors` and `target_regions` are **critical** for matching algorithm
- Text fields (`company_overview`, `services_capabilities`, `mission_values`) should be used for semantic matching/embeddings
- Currently frontend assumes single company per user (fetches first company in list)

### 2. Opportunity Entity

**Purpose:** Represents an RFP/tender from a government or organization.

**Schema:**
```json
{
  "id": "string (UUID)",
  "title": "string (required)",
  "buyer_organization": "string (required)",
  "category": "string (required, enum - see below)",
  "description": "string (text)",
  "region": "string (required, enum - matches Company.target_regions)",
  "deadline": "datetime (required)",
  "budget_min": "number (CAD)",
  "budget_max": "number (CAD)",
  "source_url": "string (URL)",
  "documents": [
    {
      "name": "string",
      "url": "string"
    }
  ],
  "rfp_number": "string",
  "status": "enum: active | closing_soon | closed | awarded",
  "compliance_notes": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Category Enum:**
```javascript
[
  "policy_planning",
  "engineering_planning",
  "land_use",
  "construction",
  "transportation",
  "technology",
  "engagement",
  "environmental_planning",
  "economic_development",
  "infrastructure_planning",
  "urban_planning",
  "other"
]
```

**Notes:**
- Frontend currently has a `categoryMapper.js` that normalizes old category values to new standardized ones
- `deadline` is used for urgency calculations (< 7 days = urgent)
- `status` affects visibility in discovery page

### 3. OpportunityMatch Entity

**Purpose:** Junction table linking Company to Opportunity with AI-generated relevance data.

**Schema:**
```json
{
  "id": "string (UUID)",
  "company_id": "string (required, FK to Company)",
  "opportunity_id": "string (required, FK to Opportunity)",
  "relevance_score": "number (0-100, required)",
  "match_rationale": "string (LLM-generated explanation)",
  "risk_notes": "string",
  "actionability": "enum: high | medium | low",
  "tags": [
    "prime_opportunity",
    "subcontractor_suitable",
    "incumbent_risk",
    "quick_turnaround",
    "high_value",
    "strategic_fit"
  ],
  "status": "enum (required)",
  "notes": "string (user-editable internal notes)",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Status Enum (Critical for Pipeline):**
```javascript
[
  "new",        // Just matched, not yet reviewed
  "reviewed",   // User has seen it
  "saved",      // User saved for later (appears in Pipeline)
  "pursuing",   // Actively working on proposal
  "submitted",  // Proposal submitted
  "won",        // Contract awarded
  "lost",       // Did not win
  "dismissed"   // User explicitly rejected
]
```

**Status Flow:**
```
new → reviewed → saved → pursuing → submitted → won/lost
                    ↓
                dismissed
```

**Notes:**
- `relevance_score` is **calculated by backend AI/ML model** based on Company profile and Opportunity data
- `match_rationale` should explain why the match is good (displayed in tooltips)
- `tags` are backend-generated insights (e.g., "prime_opportunity" shows special badge)
- Frontend expects **one OpportunityMatch per Company-Opportunity pair**

### 4. User Entity (Minor)

**Purpose:** Basic user authentication data.

**Schema:**
```json
{
  "id": "string (UUID)",
  "email": "string (required)",
  "name": "string",
  "company_id": "string (FK to Company)",
  "created_at": "datetime"
}
```

**Notes:**
- Currently minimal usage in frontend
- Used to display user name in header
- Should be expanded for multi-user per company support

---

## Backend API Requirements

### Authentication & Authorization

**Assumption:** Bearer token authentication (JWT or similar).

**Headers Expected:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**User Context:** Backend should identify `company_id` from authenticated user.

---

### API Endpoint Specifications

#### 1. **Company Profile**

##### `GET /api/companies/me`
Get the authenticated user's company profile.

**Request:**
```
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "68de1b4b69f24e492d693ed1",
  "name": "MODUS Planning, Design & Engagement",
  "company_overview": "Leading planning and design firm...",
  "services_capabilities": "Urban planning, landscape design...",
  "mission_values": "Creating sustainable communities...",
  "industry_sectors": ["urban_planning", "policy_planning", "engagement"],
  "target_regions": ["british_columbia"],
  "min_contract_value": 50000,
  "max_contract_value": 1000000,
  "team_size": "11-50",
  "created_at": "2025-01-15T10:00:00Z",
  "updated_at": "2025-10-10T14:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid/missing token
- `404 Not Found`: No company associated with user

---

##### `PUT /api/companies/me`
Update the authenticated user's company profile.

**Request:**
```json
{
  "name": "MODUS Planning, Design & Engagement",
  "company_overview": "Updated overview text...",
  "services_capabilities": "Updated capabilities...",
  "mission_values": "Updated mission...",
  "industry_sectors": ["urban_planning", "engagement"],
  "target_regions": ["british_columbia", "alberta"],
  "min_contract_value": 75000,
  "max_contract_value": 2000000,
  "team_size": "51-200"
}
```

**Response:**
```json
{
  "id": "68de1b4b69f24e492d693ed1",
  "name": "MODUS Planning, Design & Engagement",
  // ... full updated company object
  "updated_at": "2025-10-15T16:45:00Z"
}
```

**Business Logic:**
- Validate `industry_sectors` and `target_regions` against allowed enums
- Validate `min_contract_value` ≤ `max_contract_value`
- **Rate Limiting:** Max 3 updates per 7 days per company
  - Return `429 Too Many Requests` if exceeded
  - Include `Retry-After` header with seconds until next allowed edit

**Error Responses:**
- `400 Bad Request`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded

---

#### 2. **Opportunities Discovery**

##### `GET /api/opportunities`
Get all active opportunities with optional filtering.

**Query Parameters:**
```
?search=string           # Full-text search on title, description
&regions[]=string        # Filter by region (multiple allowed)
&categories[]=string     # Filter by category (multiple allowed)
&min_budget=number       # Minimum budget
&max_budget=number       # Maximum budget
&min_relevance=number    # Minimum relevance score (0-100)
&deadline_range=enum     # 7days | 30days | 90days | all
&status=enum             # active | closing_soon | closed | awarded
&sort_by=enum            # relevance | deadline | budget | recent
&limit=number            # Default: 100
&offset=number           # Pagination
```

**Response:**
```json
{
  "data": [
    {
      "opportunity": {
        "id": "opp123",
        "title": "Urban Transit Planning Services",
        "buyer_organization": "City of Vancouver",
        "category": "transportation",
        "description": "Comprehensive transit planning...",
        "region": "british_columbia",
        "deadline": "2025-11-30T23:59:59Z",
        "budget_min": 100000,
        "budget_max": 500000,
        "source_url": "https://bids.vancouver.ca/...",
        "rfp_number": "RFP-2025-1234",
        "status": "active"
      },
      "match": {
        "id": "match456",
        "company_id": "68de1b4b69f24e492d693ed1",
        "opportunity_id": "opp123",
        "relevance_score": 87,
        "match_rationale": "Strong alignment with transportation sector...",
        "tags": ["prime_opportunity", "strategic_fit"],
        "status": "new",
        "notes": null
      }
    }
  ],
  "total": 143,
  "limit": 100,
  "offset": 0
}
```

**Business Logic:**
- Return opportunities joined with their `OpportunityMatch` for the authenticated company
- If no match exists, **create one automatically** with AI-calculated relevance score
- Apply filters to both Opportunity and Match fields
- Sort by specified field (default: relevance_score DESC)

**Notes:**
- Frontend expects **nested structure** with `opportunity` and `match` objects
- Frontend applies additional client-side filtering (can be removed if backend handles all)

---

##### `GET /api/opportunities/:id`
Get a single opportunity with match data.

**Response:**
```json
{
  "opportunity": { /* full opportunity object */ },
  "match": { /* full match object */ }
}
```

**Error Responses:**
- `404 Not Found`: Opportunity doesn't exist

---

##### `POST /api/opportunities`
Manually create a new opportunity (user-submitted RFP).

**Request:**
```json
{
  "title": "Custom RFP Title",
  "buyer_organization": "City of Calgary",
  "category": "urban_planning",
  "description": "Project description...",
  "region": "alberta",
  "deadline": "2026-03-15T23:59:59Z",
  "budget_min": 50000,
  "budget_max": 150000,
  "source_url": "https://example.com/rfp",
  "rfp_number": "CUSTOM-001"
}
```

**Response:**
```json
{
  "opportunity": { /* created opportunity */ },
  "match": { /* auto-created match */ }
}
```

**Business Logic:**
- Validate required fields (title, buyer_organization, category, region, deadline)
- Set status to "active" by default
- **Automatically create OpportunityMatch** for the user's company with relevance score
- Mark match status as "saved" since user manually added it

---

#### 3. **Match Management**

##### `GET /api/matches`
Get all opportunity matches for the authenticated user's company.

**Query Parameters:**
```
?status[]=string         # Filter by status (multiple allowed)
&min_relevance=number    # Minimum relevance score
&limit=number
&offset=number
```

**Response:**
```json
{
  "data": [
    {
      "match": {
        "id": "match789",
        "company_id": "68de1b4b69f24e492d693ed1",
        "opportunity_id": "opp456",
        "relevance_score": 92,
        "match_rationale": "Excellent fit based on...",
        "tags": ["high_value", "strategic_fit"],
        "status": "pursuing",
        "notes": "Contacted PM on Oct 10. Awaiting clarification on budget.",
        "created_at": "2025-10-01T10:00:00Z",
        "updated_at": "2025-10-10T14:00:00Z"
      },
      "opportunity": { /* full opportunity object */ }
    }
  ],
  "total": 45,
  "limit": 100,
  "offset": 0
}
```

**Notes:**
- Used by Pipeline page to display saved/pursuing/submitted/won/lost RFPs
- Includes full opportunity data for display

---

##### `PATCH /api/matches/:id`
Update a match (status, notes).

**Request:**
```json
{
  "status": "pursuing",
  "notes": "Updated notes: Met with stakeholders on Oct 12."
}
```

**Response:**
```json
{
  "match": { /* updated match object */ },
  "opportunity": { /* associated opportunity */ }
}
```

**Business Logic:**
- Validate status transitions (e.g., can't go from "won" back to "new")
- Update `updated_at` timestamp
- Allow partial updates (only provided fields)

**Error Responses:**
- `400 Bad Request`: Invalid status value
- `403 Forbidden`: Match doesn't belong to user's company
- `404 Not Found`: Match doesn't exist

---

##### `POST /api/matches`
Create a new match (save an opportunity).

**Request:**
```json
{
  "opportunity_id": "opp789",
  "status": "saved",
  "notes": "Looks promising. Need to review technical requirements."
}
```

**Response:**
```json
{
  "match": { /* created match with calculated relevance_score */ },
  "opportunity": { /* associated opportunity */ }
}
```

**Business Logic:**
- Check if match already exists for this company-opportunity pair
- If exists, update status instead of creating duplicate
- Calculate `relevance_score` using AI model
- Generate `match_rationale` and `tags`

---

#### 4. **User Interactions (Like/Dislike)**

**Current State:** Stored in localStorage (client-side only).

**Proposed Backend Storage:**

##### `POST /api/interactions`
Record a user interaction (like/dislike).

**Request:**
```json
{
  "opportunity_id": "opp456",
  "type": "like" | "dislike",
  "feedback": {
    "reasons": ["relevancy_incorrect", "data_incorrect"],
    "additional_feedback": "Budget range seems inaccurate"
  }
}
```

**Response:**
```json
{
  "id": "interaction123",
  "user_id": "user789",
  "opportunity_id": "opp456",
  "type": "dislike",
  "feedback": { /* saved feedback */ },
  "created_at": "2025-10-15T16:00:00Z"
}
```

**Business Logic:**
- Store interaction for analytics and ML training
- If dislike with feedback, use it to improve matching algorithm
- If user toggles (like → unlike), delete the interaction record

---

##### `GET /api/interactions`
Get user's interaction history.

**Response:**
```json
{
  "liked_opportunities": ["opp123", "opp456"],
  "disliked_opportunities": [
    {
      "opportunity_id": "opp789",
      "feedback": { /* feedback object */ },
      "timestamp": "2025-10-10T12:00:00Z"
    }
  ]
}
```

**Notes:**
- Frontend uses this to restore like/dislike button states
- Should be fetched on app initialization

---

##### `DELETE /api/interactions/:opportunity_id`
Remove a like/dislike interaction (toggle off).

**Response:**
```json
{
  "message": "Interaction removed"
}
```

---

#### 5. **Dashboard Statistics**

##### `GET /api/dashboard/stats`
Get aggregated statistics for dashboard.

**Response:**
```json
{
  "total_opportunities": 143,
  "high_relevance_matches": 28,
  "in_pipeline_count": 12,
  "closing_soon_count": 5,
  "top_matches": [
    {
      "opportunity": { /* full opportunity */ },
      "match": { /* full match */ }
    }
  ]
}
```

**Calculations:**
- `total_opportunities`: Count of active opportunities
- `high_relevance_matches`: Matches with score > 75%
- `in_pipeline_count`: Matches with status in [saved, pursuing, submitted]
- `closing_soon_count`: Opportunities with deadline < 30 days
- `top_matches`: Top 20 matches by relevance score with deadline < 30 days

**Notes:**
- This endpoint optimizes dashboard loading (single request vs. multiple)
- Frontend currently calculates these client-side

---

#### 6. **CSV Export**

##### `GET /api/opportunities/export`
Export opportunities as CSV file.

**Query Parameters:**
```
?filters=same_as_opportunities_endpoint
```

**Response:**
```
Content-Type: text/csv
Content-Disposition: attachment; filename="opportunities_2025-10-15.csv"

Title,Organization,Category,Region,Deadline,Budget Min,Budget Max,Relevance Score,Status
"Urban Transit Planning","City of Vancouver","transportation","british_columbia","2025-11-30",100000,500000,87,"new"
...
```

**Notes:**
- Frontend currently implements CSV export client-side
- Backend version would respect same filters as main opportunities endpoint

---

## Data Persistence Requirements

### What Data Needs to Go to Backend

#### 1. **Company Profile Updates**
**When:** User saves profile on `/profile` page.

**Data:**
```javascript
{
  name, company_overview, services_capabilities, mission_values,
  industry_sectors[], target_regions[],
  min_contract_value, max_contract_value, team_size
}
```

**Endpoint:** `PUT /api/companies/me`

**Side Effects:**
- Trigger recalculation of relevance scores for all opportunities
- Update user's OpportunityMatch records
- May be computationally expensive (hence rate limiting)

---

#### 2. **Save/Unsave Opportunity**
**When:** User clicks "Save" button on OpportunityCard.

**Data:**
```javascript
{
  opportunity_id: "opp123",
  status: "saved",
  notes: "Optional initial notes"
}
```

**Endpoint:**
- If match exists: `PATCH /api/matches/:match_id`
- If new: `POST /api/matches`

**Frontend Behavior:**
- Shows dialog to collect optional notes
- Updates card UI to show "Saved" button
- Card appears in Pipeline page

---

#### 3. **Like/Dislike Interactions**
**When:** User clicks thumbs up/down on OpportunityCard.

**Data:**
```javascript
// Like
{
  opportunity_id: "opp456",
  type: "like"
}

// Dislike (after feedback dialog)
{
  opportunity_id: "opp789",
  type: "dislike",
  feedback: {
    reasons: ["relevancy_incorrect", "no_service_match"],
    additional_feedback: "This is for electrical work, not planning"
  }
}
```

**Endpoint:** `POST /api/interactions`

**Purpose:**
- Train/refine AI matching algorithm
- Analytics on user preferences
- Improve relevance scoring

**Frontend Behavior:**
- Toggleable (click again to unlike/undislike)
- Dislike shows feedback dialog on first click
- Visual feedback (filled icon, colored background)
- Currently stored in localStorage (should migrate to backend)

---

#### 4. **Status Updates (Pipeline Management)**
**When:** User changes status dropdown on Pipeline page.

**Data:**
```javascript
{
  match_id: "match123",
  status: "pursuing" // or submitted, won, lost
}
```

**Endpoint:** `PATCH /api/matches/:match_id`

**Status Transitions:**
```
saved → pursuing → submitted → won
                            → lost
```

---

#### 5. **Internal Notes**
**When:** User edits notes textarea on Pipeline page.

**Data:**
```javascript
{
  match_id: "match123",
  notes: "Updated internal notes about this RFP..."
}
```

**Endpoint:** `PATCH /api/matches/:match_id`

**Frontend Behavior:**
- Autosave on blur (loses focus)
- Debounced saves if typing continuously

---

#### 6. **Manual RFP Entry**
**When:** User fills out "Add RFP" dialog on Opportunities page.

**Data:**
```javascript
{
  title: "Custom RFP",
  buyer_organization: "City of Calgary",
  category: "urban_planning",
  description: "Full description...",
  region: "alberta",
  deadline: "2026-03-15T23:59:59Z",
  budget: 100000, // Note: frontend sends single budget, not min/max
  source_url: "https://example.com",
  relevancy_score: 85 // User-provided estimate
}
```

**Endpoint:** `POST /api/opportunities`

**Backend Logic:**
- Create Opportunity entity
- Auto-create OpportunityMatch with status="saved" for user's company
- Use `relevancy_score` if provided, otherwise calculate
- Return created opportunity + match

---

## Code Quality Audit

### 🟢 Strengths

1. **Clean Architecture**
   - Clear separation: pages, components, entities, utilities
   - Consistent naming conventions
   - Logical file structure

2. **Reusable Components**
   - Well-designed UI component library in `src/components/ui/`
   - Consistent design system using Tailwind
   - Component composition over inheritance

3. **Mock API Abstraction**
   - Excellent pattern for demo purposes
   - Easy to swap for real backend (just change imports)
   - Simulates real async behavior with delays

4. **Type Safety via JSON Schemas**
   - Data entity schemas in `src/data/entities/` serve as documentation
   - Clear contracts for data structures

5. **Responsive Design**
   - Mobile-friendly with `mobile.css`
   - Aggressive size adjustments for small screens

---

### 🟡 Code Smells & Issues

#### 1. **Inefficient Data Fetching**
**Problem:** Full refetch after every mutation.

**Example:**
```javascript
const handleSaveOpportunity = async (opportunity, notes) => {
  // Update match
  await OpportunityMatch.update(matchId, { status: 'saved', notes });

  // Refetch entire dataset
  const refreshedMatches = await OpportunityMatch.list();
  const refreshedOpportunities = await Opportunity.list();
  setMatches(refreshedMatches);
  setOpportunities(refreshedOpportunities);
};
```

**Why It's Bad:**
- Unnecessary network requests
- Slow UX on large datasets
- Inefficient with real backend

**Solution:**
- Implement optimistic updates
- Use React Query or SWR for cache management
- Only refetch changed data

**Example Fix:**
```javascript
const handleSaveOpportunity = async (opportunity, notes) => {
  // Optimistically update UI
  setMatches(prev => prev.map(m =>
    m.id === matchId ? { ...m, status: 'saved', notes } : m
  ));

  // Update backend
  try {
    await OpportunityMatch.update(matchId, { status: 'saved', notes });
  } catch (error) {
    // Rollback on error
    setMatches(originalMatches);
  }
};
```

---

#### 2. **Prop Drilling**
**Problem:** Passing data and callbacks through multiple component levels.

**Example:**
```javascript
// Dashboard.jsx
<OpportunityCard
  onSave={handleSaveOpportunity}
  onUnsave={handleUnsaveOpportunity}
  onDislike={handleDislikeOpportunity}
/>
```

**Why It's Bad:**
- Hard to maintain as app grows
- Component becomes tightly coupled

**Solution:**
- Context API for shared state (user, company profile)
- Custom hooks for common operations (useOpportunityActions)
- Consider Zustand for lightweight global state

---

#### 3. **Client-Side Filtering**
**Problem:** All filtering happens in browser after fetching ALL data.

**Location:** `Opportunities.jsx` `applyFilters()` function

**Why It's Bad:**
- Doesn't scale (fetches 1000s of opportunities)
- Slow on large datasets
- Wastes bandwidth

**Solution:**
- Move filtering to backend
- Use query parameters in API calls
- Only fetch filtered results

---

#### 4. **Hardcoded User/Company Association**
**Problem:** Fetches first company in list, assumes single company per user.

**Example:**
```javascript
const companies = await Company.list();
if (companies.length > 0) {
  setCompany(companies[0]); // Always takes first
}
```

**Why It's Bad:**
- Doesn't support multiple companies per user
- Fragile (breaks if array is empty)

**Solution:**
- Add user authentication context
- Fetch user's associated company explicitly
- Backend: `GET /api/companies/me`

---

#### 5. **LocalStorage for Critical Data**
**Problem:** Like/dislike stored only in browser.

**Why It's Bad:**
- Lost when user switches devices
- Can't be used for ML training
- User can manipulate data

**Solution:**
- Move to backend storage (see API specs above)
- Sync localStorage with backend on app load
- Use localStorage as cache only

---

#### 6. **No Error Handling**
**Problem:** Most async operations lack try/catch or error states.

**Example:**
```javascript
const loadData = async () => {
  setIsLoading(true);
  const data = await Entity.list(); // What if this fails?
  setData(data);
  setIsLoading(false);
};
```

**Solution:**
```javascript
const loadData = async () => {
  setIsLoading(true);
  setError(null);
  try {
    const data = await Entity.list();
    setData(data);
  } catch (err) {
    setError('Failed to load data. Please try again.');
    console.error(err);
  } finally {
    setIsLoading(false);
  }
};
```

---

#### 7. **Magic Numbers**
**Problem:** Hardcoded values without constants.

**Examples:**
```javascript
const highRelevanceCount = matches.filter(m => m.relevance_score > 75).length;
const daysUntil = 30;
const maxEdits = 3;
```

**Solution:**
```javascript
const RELEVANCE_THRESHOLD = {
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
};

const DEADLINE_RANGES = {
  URGENT: 7,
  SOON: 30,
  LATER: 90
};

const RATE_LIMITS = {
  PROFILE_EDITS_PER_WEEK: 3
};
```

---

#### 8. **Duplicate Code**
**Problem:** Same logic repeated across components.

**Example:** Date calculations appear in multiple files:
```javascript
const daysTillDeadline = Math.ceil(
  (new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24)
);
```

**Solution:**
```javascript
// utils/dateHelpers.js
export const daysUntilDeadline = (deadlineISO) => {
  return Math.ceil(
    (new Date(deadlineISO) - new Date()) / (1000 * 60 * 60 * 24)
  );
};

export const isUrgent = (deadlineISO, threshold = 7) => {
  return daysUntilDeadline(deadlineISO) <= threshold;
};
```

---

#### 9. **Unused Code**
**Found:**
- `src/components/original/` directory (legacy code)
- Root `Layout.js` file (superseded by `src/components/Layout.jsx`)
- Commented-out code in several files

**Action:** Delete unused files to reduce confusion.

---

### 🔴 Critical Issues

#### 1. **No Authentication**
**Problem:** No login, no token management, no protected routes.

**Impact:** Can't deploy to production.

**Solution:**
- Implement JWT authentication
- Add login/signup pages
- Protected route wrapper:
```javascript
<Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

#### 2. **Rate Limiting on Client Side**
**Problem:** Profile edit rate limiting uses localStorage (easily bypassed).

**Impact:** User can edit profile unlimited times by clearing localStorage.

**Solution:**
- Move rate limiting to backend
- Return `429 Too Many Requests` with `Retry-After` header
- Frontend displays server-provided limit status

---

#### 3. **No Input Validation**
**Problem:** Forms accept any input without validation.

**Example:** ManualRFPEntryDialog allows negative budgets, past deadlines.

**Solution:**
- Add validation library (Zod, Yup)
- Validate on submit before API call
- Display field-level error messages

---

### 📋 Recommended Refactors

#### Priority 1 (Immediate)
1. Replace mock API with real backend integration
2. Implement authentication and protected routes

#### Priority 2 (Short-term)
3. Add error handling and error boundaries
4. Remove unused code
5. Implement React Query or SWR for data fetching
6. Move filtering to backend
7. Create custom hooks for common operations
8. Add form validation

#### Priority 3 (Long-term)
9. Add TypeScript for type safety
10. Implement automated testing (Vitest + React Testing Library)
11. Add E2E tests (Playwright)
12. Performance optimization (code splitting, lazy loading)

---

## Feature Proposals

### Feature 1: Intelligent Notifications System

#### Overview
Provide users with timely, actionable notifications about RFP activities, including new matches, approaching deadlines, and changes to saved opportunities.

---

#### Notification Types

##### 1. **New Opportunities Matched**
**Trigger:** Backend runs periodic ingestion job (e.g., every 12 hours) that:
- Scrapes new RFPs from government portals
- Runs matching algorithm for all companies
- Identifies newly created `OpportunityMatch` records

**Notification:**
```json
{
  "type": "new_matches",
  "title": "5 new opportunities match your profile",
  "description": "We found 5 new RFPs in your target regions",
  "data": {
    "count": 5,
    "highest_relevance_score": 92,
    "opportunities": [
      {
        "id": "opp123",
        "title": "Urban Planning Services",
        "relevance_score": 92
      }
    ]
  },
  "created_at": "2025-10-15T08:00:00Z",
  "read": false,
  "action_url": "/opportunities?filter=new"
}
```

---

##### 2. **Deadline Approaching**
**Trigger:** Daily job checks for:
- Saved opportunities with deadline within 7 days
- Previously notified deadlines (don't spam)

**Notification:**
```json
{
  "type": "deadline_warning",
  "title": "RFP deadline in 3 days",
  "description": "Urban Transit Planning Services - City of Vancouver",
  "data": {
    "opportunity_id": "opp456",
    "opportunity_title": "Urban Transit Planning Services",
    "deadline": "2025-10-18T23:59:59Z",
    "days_remaining": 3,
    "match_status": "pursuing"
  },
  "created_at": "2025-10-15T09:00:00Z",
  "read": false,
  "priority": "high",
  "action_url": "/pipeline?tab=pursuing"
}
```

---

##### 3. **Opportunity Updated**
**Trigger:** Backend detects changes to a saved opportunity:
- Deadline extended
- Budget changed
- Status changed (e.g., closed, awarded)

**Notification:**
```json
{
  "type": "opportunity_changed",
  "title": "RFP deadline extended",
  "description": "Downtown Redevelopment Plan deadline moved to Nov 30",
  "data": {
    "opportunity_id": "opp789",
    "changes": {
      "deadline": {
        "old": "2025-11-15T23:59:59Z",
        "new": "2025-11-30T23:59:59Z"
      }
    }
  },
  "created_at": "2025-10-15T11:30:00Z",
  "read": false,
  "action_url": "/opportunities/opp789"
}
```

---

##### 4. **Profile Match Improvement**
**Trigger:** User updates company profile (new industry sectors/regions).

**Notification:**
```json
{
  "type": "profile_updated",
  "title": "Profile updated successfully",
  "description": "We found 12 additional opportunities based on your new preferences",
  "data": {
    "new_matches_count": 12,
    "recalculated_matches_count": 143
  },
  "created_at": "2025-10-15T14:00:00Z",
  "read": false,
  "action_url": "/opportunities"
}
```

---

#### Backend Implementation

##### Database Schema

**Table: `notifications`**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- new_matches, deadline_warning, etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB, -- Flexible payload for notification-specific data
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_unread (user_id, read, created_at DESC),
  INDEX idx_company_type (company_id, type)
);
```

##### Backend Jobs (Cron/Scheduled Tasks)

**1. RFP Ingestion Job** (runs every 4 hours)
```python
async def run_rfp_ingestion():
    # 1. Scrape new RFPs from government portals
    new_opportunities = await scrape_rfp_sources()

    # 2. Save to database
    for opp in new_opportunities:
        await Opportunity.create(opp)

    # 3. Run matching for all companies
    companies = await Company.list_all()
    for company in companies:
        matches = await calculate_matches(company.id, new_opportunities)

        # 4. Create notifications if high-relevance matches found
        high_matches = [m for m in matches if m.relevance_score > 75]
        if high_matches:
            await Notification.create({
                'user_id': company.user_id,
                'company_id': company.id,
                'type': 'new_matches',
                'title': f'{len(high_matches)} new high-relevance opportunities',
                'data': {
                    'count': len(high_matches),
                    'opportunities': high_matches[:3]  # Top 3
                }
            })

    # 5. Store last run timestamp
    await SystemConfig.set('last_rfp_ingestion_run', datetime.now())
```

**2. Deadline Warning Job** (runs daily at 9am)
```python
async def send_deadline_warnings():
    # Find all saved opportunities with approaching deadlines
    warning_thresholds = [7, 3, 1]  # days before deadline

    for threshold in warning_thresholds:
        target_date = datetime.now() + timedelta(days=threshold)

        matches = await OpportunityMatch.filter({
            'status': ['saved', 'pursuing'],
            'opportunity.deadline': target_date
        })

        for match in matches:
            # Check if already notified for this threshold
            existing = await Notification.exists({
                'company_id': match.company_id,
                'type': 'deadline_warning',
                'data.opportunity_id': match.opportunity_id,
                'data.days_remaining': threshold
            })

            if not existing:
                await Notification.create({
                    'user_id': match.company.user_id,
                    'company_id': match.company_id,
                    'type': 'deadline_warning',
                    'title': f'RFP deadline in {threshold} days',
                    'description': match.opportunity.title,
                    'priority': 'high' if threshold <= 3 else 'normal',
                    'data': {
                        'opportunity_id': match.opportunity_id,
                        'days_remaining': threshold,
                        'deadline': match.opportunity.deadline
                    }
                })
```

**3. Opportunity Change Detector** (runs every hour)
```python
async def detect_opportunity_changes():
    # Get last check timestamp
    last_check = await SystemConfig.get('last_change_detection')

    # Find opportunities updated since last check
    changed_opportunities = await Opportunity.filter({
        'updated_at__gt': last_check
    })

    for opp in changed_opportunities:
        # Find companies that have saved this opportunity
        matches = await OpportunityMatch.filter({
            'opportunity_id': opp.id,
            'status': ['saved', 'pursuing', 'submitted']
        })

        # Get previous version to detect what changed
        changes = await get_change_diff(opp.id, last_check)

        for match in matches:
            await Notification.create({
                'user_id': match.company.user_id,
                'company_id': match.company_id,
                'type': 'opportunity_changed',
                'title': f'RFP updated: {get_change_summary(changes)}',
                'description': opp.title,
                'data': {
                    'opportunity_id': opp.id,
                    'changes': changes
                }
            })

    await SystemConfig.set('last_change_detection', datetime.now())
```

---

#### API Endpoints

##### `GET /api/notifications`
Get user's notifications.

**Query Parameters:**
```
?unread_only=boolean   # Only unread notifications
&limit=number          # Default: 50
&offset=number
&type=string           # Filter by notification type
```

**Response:**
```json
{
  "data": [
    {
      "id": "notif123",
      "type": "new_matches",
      "title": "5 new opportunities match your profile",
      "description": "We found 5 new RFPs in your target regions",
      "data": { /* type-specific payload */ },
      "priority": "normal",
      "read": false,
      "action_url": "/opportunities?filter=new",
      "created_at": "2025-10-15T08:00:00Z"
    }
  ],
  "unread_count": 8,
  "total": 143
}
```

---

##### `PATCH /api/notifications/:id/read`
Mark notification as read.

**Response:**
```json
{
  "id": "notif123",
  "read": true,
  "read_at": "2025-10-15T16:30:00Z"
}
```

---

##### `POST /api/notifications/mark-all-read`
Mark all notifications as read.

**Response:**
```json
{
  "marked_count": 8
}
```

---

##### `GET /api/notifications/unread-count`
Get count of unread notifications (for badge).

**Response:**
```json
{
  "unread_count": 8
}
```

---

#### Frontend Implementation

##### Header Notification Bell

**Location:** `src/components/Layout.jsx`

**Updates Needed:**
```javascript
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [showDropdown, setShowDropdown] = useState(false);

useEffect(() => {
  // Fetch unread count
  const fetchUnreadCount = async () => {
    const { unread_count } = await fetch('/api/notifications/unread-count');
    setUnreadCount(unread_count);
  };

  fetchUnreadCount();

  // Poll every 60 seconds
  const interval = setInterval(fetchUnreadCount, 60000);
  return () => clearInterval(interval);
}, []);

const handleBellClick = async () => {
  setShowDropdown(!showDropdown);

  if (!showDropdown) {
    // Fetch recent notifications
    const { data } = await fetch('/api/notifications?limit=10');
    setNotifications(data);
  }
};

const handleMarkAsRead = async (notificationId) => {
  await fetch(`/api/notifications/${notificationId}/read`, { method: 'PATCH' });
  setUnreadCount(prev => prev - 1);
  setNotifications(prev => prev.map(n =>
    n.id === notificationId ? { ...n, read: true } : n
  ));
};
```

**UI Component:**
```jsx
<div className="relative">
  <button onClick={handleBellClick} className="relative">
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount}
      </span>
    )}
  </button>

  {showDropdown && (
    <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <button onClick={markAllAsRead}>Mark all as read</button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.map(notif => (
          <NotificationItem
            key={notif.id}
            notification={notif}
            onMarkAsRead={handleMarkAsRead}
          />
        ))}
      </div>
    </div>
  )}
</div>
```

---

##### Notification Item Component

```jsx
function NotificationItem({ notification, onMarkAsRead }) {
  const icon = {
    'new_matches': <Sparkles className="text-blue-500" />,
    'deadline_warning': <Clock className="text-orange-500" />,
    'opportunity_changed': <AlertCircle className="text-yellow-500" />,
    'profile_updated': <CheckCircle className="text-green-500" />
  }[notification.type];

  return (
    <div
      className={`p-4 border-b hover:bg-slate-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
      onClick={() => {
        onMarkAsRead(notification.id);
        window.location.href = notification.action_url;
      }}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className="font-semibold text-sm">{notification.title}</p>
          <p className="text-xs text-slate-600">{notification.description}</p>
          <p className="text-xs text-slate-400 mt-1">
            {formatDistanceToNow(new Date(notification.created_at))} ago
          </p>
        </div>
        {!notification.read && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  );
}
```

---

#### System Configuration Requirements

**New Backend Config Table:**
```sql
CREATE TABLE system_config (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initial values
INSERT INTO system_config (key, value) VALUES
  ('last_rfp_ingestion_run', NULL),
  ('last_change_detection', NULL),
  ('notification_retention_days', '90');
```

---

### Feature 2: Smart RFP Import from URL

#### Overview
Allow users to paste an RFP URL and have the backend automatically extract and populate RFP details, saving manual data entry time.

---

#### User Flow

1. User clicks "Add RFP" button on Opportunities page
2. Dialog shows two tabs: "Manual Entry" and "Import from URL"
3. User pastes URL (e.g., `https://bids.vancouver.ca/RFP-2025-1234`)
4. Frontend calls backend parsing API
5. Backend fetches page, extracts data, returns structured JSON
6. Frontend pre-populates form fields with extracted data
7. User reviews/edits and saves

---

#### Backend Implementation

##### Parsing Pipeline

**1. URL Validation & Fetching**
```python
async def parse_rfp_from_url(url: str) -> dict:
    # 1. Validate URL
    if not is_valid_rfp_url(url):
        raise ValueError("Invalid or unsupported URL")

    # 2. Fetch page content
    try:
        response = await httpx.get(url, timeout=10.0)
        response.raise_for_status()
    except httpx.HTTPError:
        raise ValueError("Failed to fetch URL")

    # 3. Detect source type (BC Bid, BuyAndSell.gc.ca, etc.)
    source_type = detect_rfp_source(url)

    # 4. Use appropriate parser
    if source_type == 'bcbid':
        parsed_data = await parse_bcbid(response.text, url)
    elif source_type == 'buyandsell':
        parsed_data = await parse_buyandsell(response.text, url)
    else:
        # Fallback: Generic LLM-based extraction
        parsed_data = await parse_with_llm(response.text, url)

    return parsed_data
```

**2. Source-Specific Parsers**

**Example: BC Bid Parser**
```python
from bs4 import BeautifulSoup

async def parse_bcbid(html: str, url: str) -> dict:
    soup = BeautifulSoup(html, 'html.parser')

    return {
        'title': soup.select_one('.opp-title').text.strip(),
        'buyer_organization': soup.select_one('.buyer-name').text.strip(),
        'rfp_number': soup.select_one('.rfp-number').text.strip(),
        'description': soup.select_one('.description').text.strip(),
        'deadline': parse_datetime(soup.select_one('.closing-date').text),
        'category': infer_category(soup.select_one('.category').text),
        'region': infer_region(soup.select_one('.location').text),
        'budget_min': extract_budget(soup, 'min'),
        'budget_max': extract_budget(soup, 'max'),
        'source_url': url,
        'documents': [
            {
                'name': link.text.strip(),
                'url': urljoin(url, link['href'])
            }
            for link in soup.select('.document-links a')
        ]
    }
```

**3. LLM-Based Fallback Parser**
```python
async def parse_with_llm(html: str, url: str) -> dict:
    # Clean HTML (remove scripts, styles)
    cleaned_text = extract_main_content(html)

    # Use LLM to extract structured data
    prompt = f"""
    Extract RFP/tender information from the following text.
    Return JSON with these fields:
    - title (string)
    - buyer_organization (string)
    - rfp_number (string, if available)
    - description (string, max 500 words)
    - deadline (ISO datetime, if available)
    - category (string, one of: {CATEGORY_ENUM})
    - region (string, Canadian province/territory)
    - budget_min (number, CAD, if mentioned)
    - budget_max (number, CAD, if mentioned)

    Text:
    {cleaned_text[:5000]}
    """

    response = await openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an RFP data extraction assistant."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )

    parsed_data = json.loads(response.choices[0].message.content)
    parsed_data['source_url'] = url

    return parsed_data
```

**4. Data Enrichment**
```python
async def enrich_parsed_data(parsed_data: dict) -> dict:
    # Infer category if not found
    if not parsed_data.get('category'):
        parsed_data['category'] = await infer_category_from_text(
            parsed_data['title'] + ' ' + parsed_data['description']
        )

    # Infer region if not found
    if not parsed_data.get('region'):
        parsed_data['region'] = await infer_region_from_organization(
            parsed_data['buyer_organization']
        )

    # Set default status
    parsed_data['status'] = 'active'

    return parsed_data
```

---

#### API Endpoint

##### `POST /api/opportunities/parse-url`
Parse RFP from URL.

**Request:**
```json
{
  "url": "https://bids.vancouver.ca/RFP-2025-1234"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "title": "Urban Transit Planning Services",
    "buyer_organization": "City of Vancouver",
    "rfp_number": "RFP-2025-1234",
    "category": "transportation",
    "description": "The City of Vancouver is seeking qualified consultants...",
    "region": "british_columbia",
    "deadline": "2025-11-30T16:00:00Z",
    "budget_min": 100000,
    "budget_max": 500000,
    "source_url": "https://bids.vancouver.ca/RFP-2025-1234",
    "documents": [
      {
        "name": "RFP Document.pdf",
        "url": "https://bids.vancouver.ca/docs/RFP-2025-1234.pdf"
      }
    ]
  },
  "confidence": 0.92,
  "warnings": []
}
```

**Response (Partial Success with Warnings):**
```json
{
  "success": true,
  "data": {
    "title": "Downtown Redevelopment Plan",
    "buyer_organization": "City of Calgary",
    "category": "urban_planning",
    "description": "Extracted description...",
    "region": "alberta",
    "deadline": null,  // Could not extract
    "budget_min": null,
    "budget_max": null,
    "source_url": "https://example.com/rfp"
  },
  "confidence": 0.65,
  "warnings": [
    "Could not extract deadline. Please enter manually.",
    "Budget information not found in document."
  ]
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Failed to parse URL",
  "message": "The URL could not be fetched or does not contain recognizable RFP data.",
  "suggestions": [
    "Check if the URL is accessible",
    "Try using the manual entry form instead"
  ]
}
```

---

#### Frontend Implementation

##### Updated ManualRFPEntryDialog Component

**Add URL Import Tab:**
```jsx
function ManualRFPEntryDialog({ open, onOpenChange }) {
  const [activeTab, setActiveTab] = useState('url'); // 'url' or 'manual'
  const [url, setUrl] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    buyer_organization: '',
    category: '',
    // ... etc
  });

  const handleParseURL = async () => {
    setIsParsing(true);
    try {
      const response = await fetch('/api/opportunities/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();

      if (result.success) {
        // Pre-populate form
        setFormData(result.data);

        // Show warnings if any
        if (result.warnings.length > 0) {
          toast({
            title: 'Partial Success',
            description: result.warnings.join(' '),
            variant: 'warning'
          });
        } else {
          toast({
            title: 'Success',
            description: 'RFP details extracted successfully'
          });
        }

        // Switch to manual tab for review/edit
        setActiveTab('manual');
      } else {
        toast({
          title: 'Parsing Failed',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to parse URL. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add RFP</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="url">Import from URL</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label>RFP URL</Label>
              <Input
                type="url"
                placeholder="https://bids.vancouver.ca/RFP-2025-1234"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Paste a link to an RFP from BC Bid, BuyAndSell.gc.ca, or other government portals
              </p>
            </div>

            <Button
              onClick={handleParseURL}
              disabled={!url || isParsing}
              className="w-full"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Parsing URL...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Extract RFP Details
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            {/* Existing manual entry form */}
            <FormField label="Title" value={formData.title} onChange={...} />
            {/* ... rest of form fields ... */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

---

#### Supported Sources & Confidence Scoring

**Tier 1 (High Confidence):** Custom parsers with 90%+ accuracy
- BC Bid (British Columbia)
- BuyAndSell.gc.ca (Federal Government)
- Bids & Tenders (Alberta)
- MERX (National)

**Tier 2 (Medium Confidence):** LLM-based extraction, 70-90% accuracy
- Municipal websites with standard formats
- Well-structured HTML pages

**Tier 3 (Low Confidence):** PDFs and complex layouts
- May require OCR
- Manual review recommended

**Confidence Score Calculation:**
```python
def calculate_confidence(parsed_data: dict, source_type: str) -> float:
    confidence = 0.0

    # Base confidence by source type
    base_confidence = {
        'bcbid': 0.95,
        'buyandsell': 0.90,
        'merx': 0.90,
        'municipal': 0.75,
        'llm_fallback': 0.60
    }
    confidence = base_confidence.get(source_type, 0.50)

    # Adjust based on extracted fields
    required_fields = ['title', 'buyer_organization', 'category', 'deadline']
    extracted_count = sum(1 for f in required_fields if parsed_data.get(f))
    confidence *= (extracted_count / len(required_fields))

    return round(confidence, 2)
```

---

#### Error Handling & Fallbacks

**Error Scenarios:**

1. **URL Not Accessible**
   - Return error with suggestion to check URL
   - Frontend allows manual entry

2. **Page Timeout**
   - Retry up to 2 times
   - Return error after retries exhausted

3. **Parsing Confidence Too Low (< 50%)**
   - Return partial data with warnings
   - Recommend manual review

4. **No Recognizable Data**
   - Return error with link to manual entry

**Frontend Fallback:**
```javascript
if (result.confidence < 0.7) {
  // Show warning banner
  showWarning('Automated extraction may be incomplete. Please review all fields carefully.');
}
```

---

#### Backend Rate Limiting

**Prevent Abuse:**
- Max 10 URL parsing requests per user per hour
- Implement with Redis or similar
- Return `429 Too Many Requests` if exceeded

**Example:**
```python
from redis import Redis

redis = Redis()

async def check_parse_rate_limit(user_id: str) -> bool:
    key = f"parse_limit:{user_id}"
    count = redis.incr(key)
    if count == 1:
        redis.expire(key, 3600)  # 1 hour
    return count <= 10
```

---

## Summary of Backend Development Requirements

### High-Priority Endpoints (MVP)

1. **Authentication**
   - `POST /api/auth/login`
   - `POST /api/auth/register`
   - `POST /api/auth/refresh`

2. **Company Profile**
   - `GET /api/companies/me`
   - `PUT /api/companies/me` (with rate limiting)

3. **Opportunities**
   - `GET /api/opportunities` (with filtering, sorting, pagination)
   - `GET /api/opportunities/:id`
   - `POST /api/opportunities` (manual entry)

4. **Matches**
   - `GET /api/matches`
   - `POST /api/matches` (save opportunity)
   - `PATCH /api/matches/:id` (update status/notes)

5. **User Interactions**
   - `POST /api/interactions` (like/dislike)
   - `GET /api/interactions`
   - `DELETE /api/interactions/:opportunity_id`

### Medium-Priority Endpoints

6. **Dashboard**
   - `GET /api/dashboard/stats`

7. **Notifications** (Feature 1)
   - `GET /api/notifications`
   - `PATCH /api/notifications/:id/read`
   - `POST /api/notifications/mark-all-read`
   - `GET /api/notifications/unread-count`

8. **Smart Import** (Feature 2)
   - `POST /api/opportunities/parse-url`

### Background Jobs Required

1. RFP Ingestion (every 4 hours)
2. Deadline Warnings (daily at 9am)
3. Opportunity Change Detection (hourly)
4. Relevance Score Recalculation (on profile update)

---

## Appendix: Migration Checklist

### Phase 1: Core Backend (Weeks 1-2)
- [ ] Set up database schema (Company, Opportunity, OpportunityMatch, User)
- [ ] Implement authentication (JWT)
- [ ] Build core API endpoints (companies, opportunities, matches)
- [ ] Deploy backend with CORS enabled for frontend origin

### Phase 2: Frontend Integration (Weeks 3-4)
- [ ] Replace mock API with real API calls
- [ ] Add authentication flow (login, token management)
- [ ] Implement error handling and loading states
- [ ] Add React Query for data fetching
- [ ] Test all user flows end-to-end

### Phase 3: Data Migration (Week 5)
- [ ] Migrate localStorage interactions to backend
- [ ] Import existing mock data as seed data
- [ ] Set up profile edit rate limiting on backend

### Phase 4: Advanced Features (Weeks 6-8)
- [ ] Implement notifications system
- [ ] Build smart RFP import
- [ ] Set up background jobs (ingestion, warnings)
- [ ] Add analytics tracking

### Phase 5: Testing & Launch (Weeks 9-10)
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Deploy to production

---

**End of Technical Analysis Document**

*This document should be shared with backend developers to ensure alignment on data structures, API contracts, and business logic.*
