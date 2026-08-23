export interface Category {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
}

export interface Profile {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  followerCount: number;
  bio: string;
  isVerified: boolean;
}

export interface BidItem {
  id: string;
  profile: Profile;
  categoryId: string;
  amountCents: number;
  description: string;
  clicks: number;
  rank: number;
  updatedAt: string;
}

export const CATEGORIES: Category[] = [
  { id: 'cat-fashion', slug: 'fashion', name: 'Fashion & Style', icon: '👗', description: 'Top luxury, street style, & aesthetic creators.' },
  { id: 'cat-fitness', slug: 'fitness', name: 'Fitness & Wellness', icon: '🏋️', description: 'Athletes, bodybuilders, & health coaches.' },
  { id: 'cat-memes', slug: 'memes', name: 'Memes & Culture', icon: '😂', description: 'Viral meme pages, comedy accounts, & pop culture.' },
  { id: 'cat-business', slug: 'business', name: 'Business & Tech', icon: '🚀', description: 'Founders, investors, indie hackers, & tech gurus.' },
  { id: 'cat-music', slug: 'music', name: 'Music & Art', icon: '🎨', description: 'Producers, artists, designers, & DJs.' },
  { id: 'cat-crypto', slug: 'crypto', name: 'Web3 & Crypto', icon: '💎', description: 'DeFi degens, NFT collectors, & Web3 founders.' },
];

export const INITIAL_BIDS: BidItem[] = [
  // Fashion & Style
  {
    id: 'bid-1',
    categoryId: 'cat-fashion',
    amountCents: 45000, // $450
    description: 'High fashion editorial & vintage streetwear drops.',
    clicks: 1420,
    rank: 1,
    updatedAt: '2026-08-22T10:00:00Z',
    profile: {
      id: 'prof-1',
      handle: 'sophie.styled',
      displayName: 'Sophie Laurent',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      followerCount: 245000,
      bio: 'Paris & NYC 🇫🇷🇺🇸 | Daily outfit inspo & luxury unboxing',
      isVerified: true,
    },
  },
  {
    id: 'bid-2',
    categoryId: 'cat-fashion',
    amountCents: 28000, // $280
    description: 'Sustainable fashion curator & thrifting guides.',
    clicks: 890,
    rank: 2,
    updatedAt: '2026-08-22T08:30:00Z',
    profile: {
      id: 'prof-2',
      handle: 'marcus_fits',
      displayName: 'Marcus Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      followerCount: 118000,
      bio: 'Minimalist menswear | Tokyo street style scout',
      isVerified: true,
    },
  },
  {
    id: 'bid-3',
    categoryId: 'cat-fashion',
    amountCents: 15000, // $150
    description: 'Haute couture accessories & shoe design.',
    clicks: 520,
    rank: 3,
    updatedAt: '2026-08-21T19:15:00Z',
    profile: {
      id: 'prof-3',
      handle: 'elena_couture',
      displayName: 'Elena Rostova',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      followerCount: 92000,
      bio: 'Handmade Italian leather & bespoke styling',
      isVerified: true,
    },
  },

  // Fitness & Wellness
  {
    id: 'bid-4',
    categoryId: 'cat-fitness',
    amountCents: 52000, // $520
    description: 'Scientific hypertrophy training & contest prep coach.',
    clicks: 2150,
    rank: 1,
    updatedAt: '2026-08-22T11:45:00Z',
    profile: {
      id: 'prof-4',
      handle: 'alex_ironphysique',
      displayName: 'Alex Rivers',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      followerCount: 410000,
      bio: 'IFBB Pro | Online Coaching (3 spots open) 🏋️‍♂️',
      isVerified: true,
    },
  },
  {
    id: 'bid-5',
    categoryId: 'cat-fitness',
    amountCents: 31000, // $310
    description: 'Pilates, mobility drills, & post-injury rehab.',
    clicks: 1130,
    rank: 2,
    updatedAt: '2026-08-22T09:20:00Z',
    profile: {
      id: 'prof-5',
      handle: 'mindful.maya',
      displayName: 'Maya Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      followerCount: 185000,
      bio: 'Holistic wellness & daily morning routines 🧘‍♀️',
      isVerified: true,
    },
  },

  // Memes & Culture
  {
    id: 'bid-6',
    categoryId: 'cat-memes',
    amountCents: 65000, // $650
    description: 'Original high-relatability tech & corporate memes.',
    clicks: 3890,
    rank: 1,
    updatedAt: '2026-08-22T12:10:00Z',
    profile: {
      id: 'prof-6',
      handle: 'corporate_humor_daily',
      displayName: 'Corporate Overlords',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      followerCount: 890000,
      bio: 'Crying in Zoom calls since 2020 ☕ DM for promos',
      isVerified: true,
    },
  },

  // Business & Tech
  {
    id: 'bid-7',
    categoryId: 'cat-business',
    amountCents: 75000, // $750
    description: 'Building micro-SaaS in public to $50k MRR.',
    clicks: 2940,
    rank: 1,
    updatedAt: '2026-08-22T13:00:00Z',
    profile: {
      id: 'prof-7',
      handle: 'david_indiehacker',
      displayName: 'David K. Miller',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      followerCount: 320000,
      bio: 'Shipped 12 apps in 12 months 🚀 Founder @ NextFlow',
      isVerified: true,
    },
  },

  // Crypto & Web3
  {
    id: 'bid-8',
    categoryId: 'cat-crypto',
    amountCents: 98000, // $980
    description: 'DeFi yield strategies & Solana ecosystem updates.',
    clicks: 4120,
    rank: 1,
    updatedAt: '2026-08-22T13:30:00Z',
    profile: {
      id: 'prof-8',
      handle: 'solana_whale_alpha',
      displayName: 'Solana Alpha Desk',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80',
      followerCount: 540000,
      bio: 'Daily Solana & Ethereum on-chain breakdown 📈',
      isVerified: true,
    },
  },
];
