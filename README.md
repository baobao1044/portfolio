# Astro Portfolio Deployment Guide

This repository is prepared for an Astro portfolio deployment on Vercel.

Production URL placeholder: https://your-deploy.vercel.app

## Prerequisites

- Node.js 18.17+ (or current LTS)
- npm (or your preferred package manager)
- Vercel account (for production deploy)

## Install

```bash
npm install
```

## Run In Development

```bash
npm run dev
```

Default local URL: `http://localhost:4321`

## Build For Production

```bash
npm run build
```

Astro static output is generated in `dist/`.

## Preview Production Build Locally

```bash
npm run preview
```

Default preview URL: `http://localhost:4321`

## Smoke Test Checklist

After `npm run build` and `npm run preview`:

1. Home page loads without console errors.
2. Navigation links scroll or route correctly.
3. Images and project cards render correctly.
4. Contact links/buttons are clickable and correct.
5. Final production URL responds: https://your-deploy.vercel.app

Quick production check:

```bash
curl -I https://your-deploy.vercel.app
```

Expected: HTTP `200` (or redirect followed by `200`).

## Section Overview

Portfolio content should include the following sections:

- Hero
- About
- Projects
- Philosophy
- Proof
- Contact

## Deploy To Vercel

### Option 1: Vercel Dashboard (recommended)

1. Push your code to GitHub/GitLab/Bitbucket.
2. In Vercel, click **Add New... -> Project**.
3. Import this repository.
4. Confirm framework is detected as **Astro**.
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**.

### Option 2: Vercel CLI

Install CLI:

```bash
npm i -g vercel
```

Deploy:

```bash
vercel
```

Deploy to production:

```bash
vercel --prod
```

When deployment finishes, verify the assigned URL and map/customize it as needed to:
`https://your-deploy.vercel.app`

