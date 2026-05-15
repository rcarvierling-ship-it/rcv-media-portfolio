# RCV.Media // Project Memory

**RCV.Media** is a premium photography and media brand by Reese Vierling, architected as a high-performance operational hub for portraits, seniors, sports, and events.

---

## 🏛️ Project Architecture

### Tech Stack
- **Framework**: Next.js (App Router, Turbopack)
- **Database**: Supabase (PostgreSQL, Auth, RLS)
- **Media**: Cloudinary (High-speed asset storage)
- **Styling**: Tailwind CSS (Cinematic Dark Mode)
- **Animations**: Framer Motion (Micro-interactions)
- **Icons**: Lucide React

### Database Schema (Supabase)
- `bookings`: Lead pipeline and shoot details.
- `contracts`: Digital agreements (Plain-text, UUID-linked).
- `albums`: Digital galleries and collections.
- `photos`: Asset metadata (Cloudinary URLs).
- `analytics_events`: Granular engagement data (Heatmaps, durations).
- `site_settings`: Global agency configuration.

---

## 🏗️ What Has Been Built

### 1. Strategic Pipeline (Command Center)
- **Unified Hub**: Combines inquiries, active leads, and archived projects into a single high-performance view.
- **Optimize Workflow**: Tactical automation to archive stale inquiries (older than 14 days) and clean up the pipeline.
- **Inquiry Engine**: Secure client-facing booking form that feeds directly into the command center.

### 2. Contract Engine
- **Digital Signing**: Secure, UUID-linked agreement view for clients.
- **Clean-Text Delivery**: Agreements are strictly plain text (no markdown markers) for absolute professionalism.
- **Automated Generation**: Creates contracts directly from booking data with pre-configured terms.

### 3. Visual Intelligence Hub (Advanced Analytics)
- **Granular Tracking**: Captures tactile engagement (hovers) and view duration for every asset.
- **Heatmap Intelligence**: Visualizes "Engagement Nodes" on photos to identify client focus.
- **Agency Pulse**: Real-time metrics for vault views, downloads, and conversion flows.

### 4. Digital Gallery & Curation
- **Curation Hub**: Interactive tool for the photographer to star/unstar assets for the public portfolio.
- **Digital Albums**: Secure, cinematic galleries with high-resolution lightbox and download features.
- **Asset Management**: Full CRUD support for photos and albums via the admin dashboard.

---

## 🎨 Brand & Design Narrative

### Brand Positioning
- **Core Identity**: Portraits, seniors, sports, and events — captured with energy and style.
- **Style Rules**: Premium, Dark, Cinematic, Image-first, Mobile-first, Clean.
- **Atmosphere**: Not hacker/terminal themed; high-contrast accent colors (Blue/Emerald/Violet).

### Tactical Constraints (Things NOT to do)
- **No Video Wording**: Absolutely no mention of "videography", "highlight reels", or "video packages".
- **Storage Rules**: Never store images locally; never store Base64 in the database.
- **Design Rules**: No generic colors (pure red/blue); use curated HSL palettes. No simple MVPs—every view must feel premium.

---

## 💰 Pricing & Packages

| Package | Accent Color |
| :--- | :--- |
| Sports Shoot | Blue |
| Single Game | Emerald |
| Portrait Session | Violet |
| Senior Session | Pink |
| Team Media Day | Green |
| Event Coverage | Orange |

---

## 🚀 Current Status & TODOs

### Active Priorities
- [ ] **Third-Party Payment Transition**: Stripe has been surgically removed; the workflow now needs integration with an external payment system.
- [ ] **Automated Notifications**: Expand the **Resend** integration to notify clients of contract delivery and gallery releases.
- [ ] **SEO Optimization**: Implement local keyword optimization (Muncie/Louisville) and structured data for assets.
- [ ] **Public Site Polish**: Finalize the Services and Pricing pages with the brand-new accent logic.

### Known Work / Gaps
- **Payment State**: `is_deposit_paid` and `is_final_paid` flags in the DB are currently manual since Stripe was removed.
- **Dashboard UI**: Some admin sections require further refinement for a fully unified "Command Center" aesthetic.

---
*Last Pulse: May 15, 2026*
