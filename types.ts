
export interface ClickData {
  timestamp: number;
  source: string; // e.g., 'Direct', 'Social Media', 'Search Engine'
  location: string; // e.g., 'North America', 'Europe'
}

export interface ShortenedUrl {
  id: string;
  longUrl: string;
  shortcode: string;
  createdAt: number;
  expiresAt: number | null;
  clicks: ClickData[];
}

export interface UrlInput {
  id: number;
  longUrl: string;
  shortcode: string;
  validity: string;
}
