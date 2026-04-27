export interface WebPresenceResult {
  responds: boolean;
  statusCode: number | null;
  redirectsToHttps: boolean;
  responseTimeMs: number | null;
  isParkedOrDown: boolean;
  errorType: "4xx" | "5xx" | null;
}

export interface SecurityResult {
  httpsOk: boolean;
  httpRedirectsToHttps: boolean;
  hasHsts: boolean;
  certificateValid: boolean;
}

export interface PageSpeedResult {
  mobileScore: number | null;
  desktopScore: number | null;
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  hasFieldData: boolean;
  speedCategory: "fast" | "acceptable" | "slow" | "unavailable";
}

export interface FormsResult {
  formCount: number;
  hasContactForm: boolean;
  collectsName: boolean;
  collectsEmail: boolean;
  collectsPhone: boolean;
  hasValidAction: boolean;
  onlyWhatsappOrPhone: boolean;
}

export interface FrontendResult {
  hasViewport: boolean;
  hasFavicon: boolean;
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasPwaManifest: boolean;
  hasServiceWorker: boolean;
  inferredFramework: string | null;
}

export interface SeoResult {
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasCanonical: boolean;
  hasH1: boolean;
  hasStructuredData: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
}

export interface ConversionResult {
  hasContactButton: boolean;
  hasCtaInHome: boolean;
  hasWhatsappLink: boolean;
  hasClickablePhone: boolean;
  hasEmbeddedMap: boolean;
  hasBookingFlow: boolean;
  hasEcommerce: boolean;
  hasTestimonials: boolean;
}

export interface AbandonmentResult {
  hasOldCopyright: boolean;
  hasBrokenImages: boolean;
  hasMissingViewport: boolean;
  hasFormsWithoutAction: boolean;
}

export interface TechDetectionResult {
  inferredStack: string[];
  confidence: "low" | "medium" | "high";
}

export interface ContactExtractionResult {
  emails: string[];
  phonesFromHref: string[];
  socialLinks: { platform: string; url: string }[];
  isSocialNetworkOnly: boolean;
  siteType: "landing" | "multipage" | "social-only" | "ecommerce" | "unknown";
  wordCount: number;
  sectionCount: number;
}

export interface AuditResult {
  placeId: string;
  websiteUri: string | null;
  auditedAt: string;
  webPresence: WebPresenceResult | null;
  security: SecurityResult | null;
  pageSpeed: PageSpeedResult | null;
  forms: FormsResult | null;
  frontend: FrontendResult | null;
  seo: SeoResult | null;
  conversion: ConversionResult | null;
  abandonment: AbandonmentResult | null;
  techDetection: TechDetectionResult | null;
  contactExtraction: ContactExtractionResult | null;
  source: "website";
}
