export interface TechScore {
  total: number;
  max: number;
  breakdown: {
    siteAvailable: boolean;
    https: boolean;
    fastSpeed: boolean;
    mobileReady: boolean;
    hasStructuredData: boolean;
    hasPwaManifest: boolean;
    hasContactForm: boolean;
  };
}

export interface OpportunityScore {
  total: number;
  max: number;
  breakdown: {
    noWebsite: boolean;
    slowWeb: boolean;
    noForm: boolean;
    noCta: boolean;
    noBasicSeo: boolean;
    noWhatsapp: boolean;
    noBooking: boolean;
    highRatingPoorWeb: boolean;
  };
}

export interface ScoredBusiness {
  placeId: string;
  displayName: string;
  address: string;
  phone: string | null;
  websiteUri: string | null;
  category: string | null;
  city: string | null;
  googleRating: number | null;
  googleReviews: number | null;
  websiteDetected: boolean;
  websiteStatus: number | null;
  httpsOk: boolean;
  hasHsts: boolean;
  pagespeedMobile: number | null;
  pagespeedDesktop: number | null;
  hasContactForm: boolean;
  hasWhatsappLink: boolean;
  hasBookingFlow: boolean;
  hasStructuredData: boolean;
  hasManifest: boolean;
  inferredStack: string;
  techScore: TechScore;
  opportunityScore: OpportunityScore;
  notes: string;
  sourceGoogle: boolean;
  sourceWebsite: boolean;
  // Contact & social enrichment
  emails: string;
  socialLinks: string;
  isSocialNetworkOnly: boolean;
  siteType: string;
}
