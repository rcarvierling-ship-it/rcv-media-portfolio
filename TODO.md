# RCV.Media TODO

## Current Priority

Build RCV.Media into a professional photography brand website for:

- Seniors
- Portraits
- Sports
- Events
- Graduation / cap & gown
- Team media days

The site should feel premium, cinematic, dark, clean, image-first, and mobile-first.

Do not make the brand only sports-focused.

Main brand line:

> Portraits, seniors, sports, and events — captured with energy and style.

---

## High Priority Tasks

### 1. Website Content

- [x] Update homepage copy to clearly explain what RCV.Media offers
- [x] Make homepage more image-first and less text-heavy
- [ ] Add strong CTA buttons:
  - View Portfolio
  - View Pricing
  - Book a Shoot
- [x] Remove all video-related wording:
  - videography
  - video
  - highlight reel
  - clips
  - reel clips
  - video package

### 2. Portfolio

- [ ] Upload best 30–50 photos
- [x] Add categories:
  - Seniors
  - Portraits
  - Sports
  - Events
  - Graduation
- [x] Make portfolio filterable by category
- [ ] Make sure lightbox works on mobile
- [ ] Mark best photos as featured/curated

### 3. Services Page

- [ ] Add service sections:
  - Seniors
  - Portraits
  - Sports
  - Events
  - Graduation / Cap & Gown
  - Team Media Days
- [ ] Each service should include:
  - Short description
  - Best for
  - Starting price
  - Book button

### 4. Pricing Page

- [x] Add/update pricing packages:

| Package | Price | Accent |
|---|---:|---|
| Sports Shoot | $80 | neon green |
| Single Game | $125 | neon green |
| Portrait Session | $125 | neon green |
| Cap & Gown Session | $100 | neon green |
| Athlete Session | $175 | neon green |
| Senior Session | $180 | neon green |
| Team Media Day | $250 | neon green |
| Event Coverage | $250+ | neon green |
| Tournament / Extended Coverage | $400+ | neon green |

- [ ] Make pricing cards visually premium
- [ ] Add FAQ below pricing
- [ ] Add “Not sure what to book?” CTA

### 5. Booking Page

- [ ] Booking form should include:
  - Name
  - Email
  - Phone
  - Instagram handle
  - Shoot type
  - Package
  - Preferred date
  - Preferred time
  - Location
  - Message/details
- [ ] Save bookings to Supabase
- [ ] Show confirmation after submit
- [ ] Send notification to Reese if possible
- [ ] Add blocked dates support

### 6. Client Galleries

- [ ] Build `/client-galleries`
- [ ] Build `/client-galleries/[slug]`
- [ ] Support public galleries
- [ ] Support private galleries with passcodes
- [ ] Add gallery cover image
- [ ] Add image lightbox
- [ ] Add download option if wanted later

### 7. Dashboard

- [ ] Photo upload/edit/delete
- [ ] Album/client gallery management
- [ ] Booking pipeline
- [ ] Pricing package editor
- [ ] Site settings editor
- [ ] Inquiries inbox
- [ ] Private gallery passcodes
- [ ] Featured/curated photo toggles

### 8. SEO

- [x] Homepage title:
  - RCV.Media | Seniors, Portraits, Sports & Events
- [x] Homepage description:
  - RCV.Media is a photography brand by Reese Vierling specializing in seniors, portraits, sports, events, graduation sessions, and team media days.
- [ ] Add Open Graph image
- [ ] Add sitemap
- [ ] Add robots.txt
- [ ] Add local keywords naturally:
  - Muncie photographer
  - Louisville photographer
  - senior photographer
  - sports photographer
  - portrait photographer
  - event photographer

### 9. Brand Polish

- [ ] Make Instagram bio match website
- [ ] Create pricing guide PDF
- [ ] Create booking prep guides
- [ ] Add testimonials/reviews section
- [ ] Add Google Business Profile link once created
- [ ] Make email signature for RCV.Media

---

## Future Ideas

- [ ] Package recommendation quiz
- [ ] Mini-session landing pages
- [ ] Senior photo prep guide
- [ ] Portrait session prep guide
- [ ] Sports session prep guide
- [ ] Automated email confirmations
- [ ] Stripe deposits
- [ ] Google Calendar availability sync
- [ ] Client gallery downloads
- [ ] Review request automation
- [ ] Instagram feed integration
- [ ] Blog/posts for SEO

---

## Development Rules

- Always run `npm run build` after major changes.
- Never commit `.env.local`.
- Never expose API secrets in client-side code.
- Do not store images locally.
- Do not store Base64 images in Supabase.
- Store images in Cloudinary.
- Store metadata in Supabase.
- Keep public site image-first and premium.
- Keep dashboard simple and practical.