# Mona Wear Storefront SDK

A modern, high-performance headless e-commerce storefront for Mona Wear, built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, and integrated with the **Sazito Client SDK**.

---

## 🌟 Key Features

- **Modern Architecture**: Decoupled headless storefront powered by Next.js 15 App Router and React 19.
- **Backend-for-Frontend (BFF)**: Secure server-side proxy layer ensuring upstream credentials and JWT tokens are protected via `HttpOnly` cookies.
- **Full RTL & Typography**: Native Persian typography and responsive RTL layouts powered by the Vazirmatn font.
- **Interactive Size Guide**: Built-in smart size calculator tailored for lingerie and fashion apparel to enhance conversion and minimize returns.
- **Complete Checkout Flow**: Seamless multi-step purchasing flow, dynamic province/city selection, Iranian payment gateways, and guest order tracking.
- **SEO & Performance Optimized**: Full SSR/SSG rendering, JSON-LD structured data schemas, automatic WebP image optimization, and dynamic sitemaps.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [Radix UI](https://www.radix-ui.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Integration**: `@sazito/client-sdk`
- **Containerization**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mehradkoulaei/monawear-sazito-sdk.git
   cd monawear-sazito-sdk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Configure the following variables in `.env.local`:
   ```env
   SAZITO_DOMAIN=monawear.ir
   SAZITO_API_KEY=your_api_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 📦 Production Deployment

### Standard Build

```bash
npm run build
npm start
```

### Docker Deployment

To build and run the production container:

```bash
docker compose up -d --build
```

---

## 📜 Scripts

| Script | Command | Description |
|---|---|---|
| `dev` | `next dev` | Start development server |
| `build` | `next build` | Build production standalone bundle |
| `start` | `next start` | Run production build |
| `lint` | `eslint .` | Lint codebase with ESLint |
| `typecheck` | `tsc --noEmit` | Validate TypeScript types |

---

## 📄 License

Private & Proprietary. All rights reserved.
