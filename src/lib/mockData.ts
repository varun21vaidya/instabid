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
  { id: 'cat-food', slug: 'food', name: 'Food & Drink', icon: '🍜', description: 'Chefs, foodies, reviewers, & drink creators.' },
  { id: 'cat-travel', slug: 'travel', name: 'Travel & Adventure', icon: '✈️', description: 'Travelers, explorers, guides, & stay creators.' },
  { id: 'cat-beauty', slug: 'beauty', name: 'Beauty & Skincare', icon: '✨', description: 'Beauty artists, skincare experts, & product creators.' },
  { id: 'cat-gaming', slug: 'gaming', name: 'Gaming & Streaming', icon: '🎮', description: 'Gamers, streamers, esports players, & creators.' },
];

export const INITIAL_BIDS: BidItem[] = [
  {
    id: 'placeholder-top-spot',
    categoryId: 'cat-business',
    amountCents: 100,
    description: 'Open top-spot bid for the featured leaderboard slot.',
    clicks: 1,
    rank: 1,
    updatedAt: new Date().toISOString(),
    profile: {
      id: 'placeholder-profile',
      handle: 'instabid-live',
      displayName: 'Current Top Spot',
      avatarUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&q=80',
      followerCount: 1,
      bio: 'Top spot reserved at $1 for the featured leaderboard slot.',
      isVerified: true,
    },
  },
];
