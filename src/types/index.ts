export interface Account {
  id: number;
  nickname: string;
  email: string;
  password: string;
  friendCode: string;
  dynamax: boolean;
  categories: Record<string, CategoryData>;
  friend?: string;
  referral?: string;
  note?: string;
}

export interface CategoryData {
  total: number;
  subColumns: Record<string, number>;
}

export interface CategoryDefinition {
  key: string;
  label: string;
  subColumns: { key: string; label: string }[];
}

export interface DailyRecord {
  year: string;
  date: string;
  accountIndex: number;
  km: number | null;
  catches: number | null;
  stops: number | null;
  xp: number | null;
  stardust: number | null;
  coins: number | null;
  superBalls: number | null;
  hyperBalls: number | null;
}

export interface ManholeMarker {
  id: number;
  region: string;
  subRegion: string;
  city: string;
  lat: number;
  lng: number;
  pokemon: string;
  stopName: string;
  detailUrl: string;
}

export interface JejuLocation {
  lat: number;
  lng: number;
  name: string;
  type: 'gym' | 'eliteGym' | 'stop' | 'showcaseStop' | 'powerSpot';
  district: string;
  address: string;
}

export interface MegaEvolutions {
  regular: string[];
  za: string[];
}

export interface RegionalData {
  pokemon: { pokemon: string; region: string }[];
  trimian: { form: string; region: string }[];
}

export interface VivillonPattern {
  englishName: string;
  koreanName: string;
}

export interface CommunityDay {
  year: number;
  month: number | null;
  day: number | null;
  pokemon: string;
  move: string;
}

export interface Medal {
  name: string;
  nameEn: string;
  description: string;
  bronze: number;
  silver: number;
  gold: number;
  platinum: number;
}

export interface EventData {
  collections: { no: number; title: string; date: string }[];
  specials: { no: number; title: string; scope: string; date: string }[];
  schedule: {
    year: number;
    date: string;
    content: string;
    location: string;
    details: string;
    eventPokemon: string;
    link: string;
  }[];
}
