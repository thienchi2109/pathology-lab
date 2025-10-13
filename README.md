# Lab Sample Management System

A Next.js-based web application for managing laboratory samples with a kit-first inventory approach.

## Tech Stack

- **Framework**: Next.js 15+ with App Router and TypeScript
- **Styling**: Tailwind CSS with custom pastel color theme
- **UI Components**: shadcn/ui (customized with pastel colors)
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Authentication**: Supabase Auth with JWT sessions
- **Object Storage**: Cloudflare R2 (S3-compatible) for images
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm
- Supabase account
- Cloudflare R2 account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.local.example` to `.env.local` and fill in your environment variables:

```bash
cp .env.local.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── grid/             # Data grid components
│   └── dashboard/        # Dashboard widgets
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client utilities
│   ├── r2/               # Cloudflare R2 utilities
│   └── utils.ts          # General utilities
├── types/                 # TypeScript type definitions
└── public/               # Static assets
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `R2_ACCOUNT_ID` - Your Cloudflare R2 account ID
- `R2_ACCESS_KEY_ID` - Your R2 access key ID
- `R2_SECRET_ACCESS_KEY` - Your R2 secret access key
- `R2_BUCKET_NAME` - Your R2 bucket name
- `R2_PUBLIC_URL` - Your R2 public URL

## Design System

### Color Palette (Pastel Theme)

- Primary: Soft Blue (#93C5FD)
- Secondary: Lavender (#C4B5FD)
- Success: Mint Green (#86EFAC)
- Warning: Peach (#FED7AA)
- Error: Soft Rose (#FCA5A5)
- Background: Off-white (#FAFAFA)
- Text Primary: Charcoal (#1F2937)

### Typography

- Font: Inter (sans-serif)
- Body: 16px, 400 weight
- Headings: 600 weight

## License

ISC
