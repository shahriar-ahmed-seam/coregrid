/**
 * Curated photography sourced from Unsplash (build-time selection).
 * Each entry keeps photographer attribution so we can credit creators, in line
 * with the Unsplash API guidelines. URLs point at the Unsplash image CDN and
 * are parametrized on demand via `img()` for crisp, right-sized delivery.
 */
export interface Photo {
  base: string;
  author: string;
  authorUrl: string;
  alt: string;
}

export const PHOTOS = {
  hero: {
    base: "https://images.unsplash.com/photo-1613694699951-0f4c6c6cb9c2",
    author: "Vitor Paladini",
    authorUrl: "https://unsplash.com/@vtrpldn",
    alt: "Illuminated corporate towers against a deep blue night sky",
  },
  grid: {
    base: "https://images.unsplash.com/photo-1644088379091-d574269d422f",
    author: "Conny Schneider",
    authorUrl: "https://unsplash.com/@choys_",
    alt: "Abstract network of connected nodes and lines",
  },
  ai: {
    base: "https://images.unsplash.com/photo-1782330300409-f6c1ae5f64cb",
    author: "Brecht Corbeel",
    authorUrl: "https://unsplash.com/@brechtcorbeel",
    alt: "Glowing abstract circuitry representing artificial intelligence",
  },
  people: {
    base: "https://images.unsplash.com/photo-1681949287382-052ea3954a51",
    author: "Sable Flow",
    authorUrl: "https://unsplash.com/@sableflow",
    alt: "A diverse team collaborating in a bright modern office",
  },
  finance: {
    base: "https://images.unsplash.com/photo-1516031190212-da133013de50",
    author: "Pankaj Patel",
    authorUrl: "https://unsplash.com/@pankajpatel",
    alt: "Financial data and charts on a dark monitor",
  },
  ops: {
    base: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866",
    author: "CHUTTERSNAP",
    authorUrl: "https://unsplash.com/@chuttersnap",
    alt: "Modern automated logistics warehouse",
  },
  hr: {
    base: "https://images.unsplash.com/photo-1758691737587-7630b4d31d16",
    author: "Vitaly Gariev",
    authorUrl: "https://unsplash.com/@silverkblack",
    alt: "Professionals smiling together in an office",
  },
  crm: {
    base: "https://images.unsplash.com/photo-1638262052640-82e94d64664a",
    author: "Rock Staar",
    authorUrl: "https://unsplash.com/@rockstaar_",
    alt: "Business partners shaking hands to close a deal",
  },
  texture: {
    base: "https://images.unsplash.com/photo-1671159593357-ee577a598f71",
    author: "Visax",
    authorUrl: "https://unsplash.com/@visaxslr",
    alt: "Dark minimal abstract gradient mesh",
  },
} satisfies Record<string, Photo>;

export type PhotoKey = keyof typeof PHOTOS;

/** Build an optimized Unsplash CDN URL for a given photo key. */
export function img(
  key: PhotoKey,
  opts: { w?: number; q?: number; h?: number } = {}
): string {
  const { w = 1600, q = 80, h } = opts;
  const photo = PHOTOS[key];
  const params = new URLSearchParams({
    auto: "format",
    fit: "crop",
    w: String(w),
    q: String(q),
  });
  if (h) params.set("h", String(h));
  return `${photo.base}?${params.toString()}`;
}

export const photoCredits = Object.values(PHOTOS).map((p) => ({
  author: p.author,
  authorUrl: p.authorUrl,
}));
