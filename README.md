# RFP Discovery Platform - Client Demo

A standalone demo of the RFP Discovery platform for MODUS Planning, featuring AI-powered opportunity matching and pipeline management.

## Features

- 🎯 **Smart Discovery** - AI-powered RFP matching with relevance scoring
- 📊 **Dashboard** - Overview of opportunities, matches, and pipeline status
- 🔍 **Advanced Filtering** - Filter by region, category, budget, deadline, and relevance
- 📋 **Pipeline Management** - Track opportunities from saved to won/lost
- 🎨 **NeuraCities Branding** - Custom color scheme matching company brand

## Tech Stack

- React 19 + Vite
- React Router v7
- Tailwind CSS v3
- Lucide Icons
- Hardcoded demo data (no backend required)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploying to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `rfp-discovery-demo`
3. Choose "Public" (required for free GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Initialize Git and Push

```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RFP Discovery demo"

# Add your GitHub repo as remote (replace with your username/repo)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Configure GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Build and deployment**:
   - **Source**: Select "GitHub Actions"
4. That's it! The workflow will automatically deploy on every push to main

### Step 4: Access Your Site

After the GitHub Action completes (usually 1-2 minutes), your site will be available at:

```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

You can find the exact URL in:
- GitHub repo → **Settings** → **Pages**
- Or in the **Actions** tab → Click on the latest workflow run → Look for the deployment URL

## Updating the Site

Every time you push to the `main` branch, GitHub Actions will automatically rebuild and deploy your site:

```bash
# Make your changes, then:
git add .
git commit -m "Your commit message"
git push
```

## Configuration

### Changing the Repository Name

If you need to change your repo name, update `vite.config.js`:

```js
export default defineConfig({
  // ... other config
  base: '/your-repo-name/',  // Change this
})
```

Then rebuild and redeploy.

## Demo Data

The demo uses hardcoded data from CSV exports:
- 1 company (MODUS Planning)
- 10 opportunities
- 8 opportunity matches with relevance scores

All data is in `src/lib/mockData.js` and managed through entity abstractions in `src/entities/all.js`.

## Brand Colors

NeuraCities brand colors are defined in `tailwind.config.js`:

- Primary: `#2C3E50` (Dark Navy)
- Secondary: `#34495E` (Navy Gray)
- Teal: `#008080` (Accent)
- Coral: `#FF5747` (CTA)

## License

ISC

---

Built with ❤️ for NeuraCities
