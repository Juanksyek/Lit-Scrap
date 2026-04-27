import type { PlaceResult } from "../places/types";
import type { AuditResult } from "../audit/types";
import type { ScoredBusiness, TechScore, OpportunityScore } from "./types";

function calcTechScore(audit: AuditResult | null): TechScore {
  if (!audit) {
    return {
      total: 0,
      max: 7,
      breakdown: {
        siteAvailable: false,
        https: false,
        fastSpeed: false,
        mobileReady: false,
        hasStructuredData: false,
        hasPwaManifest: false,
        hasContactForm: false,
      },
    };
  }

  const breakdown = {
    siteAvailable: audit.webPresence?.responds === true,
    https: audit.security?.httpsOk === true,
    fastSpeed: audit.pageSpeed?.speedCategory === "fast",
    mobileReady: audit.frontend?.hasViewport === true,
    hasStructuredData: audit.seo?.hasStructuredData === true,
    hasPwaManifest: audit.frontend?.hasPwaManifest === true,
    hasContactForm: audit.forms?.hasContactForm === true,
  };

  const total = Object.values(breakdown).filter(Boolean).length;
  return { total, max: 7, breakdown };
}

function calcOpportunityScore(
  place: PlaceResult,
  audit: AuditResult | null
): OpportunityScore {
  const breakdown = {
    noWebsite: !place.websiteUri,
    slowWeb: audit?.pageSpeed?.speedCategory === "slow",
    noForm: audit?.forms?.hasContactForm === false,
    noCta: audit?.conversion?.hasCtaInHome === false,
    noBasicSeo:
      audit?.seo?.hasTitle === false && audit?.seo?.hasMetaDescription === false,
    noWhatsapp: audit?.conversion?.hasWhatsappLink === false,
    noBooking: audit?.conversion?.hasBookingFlow === false,
    highRatingPoorWeb:
      (place.rating ?? 0) >= 4 &&
      !!place.websiteUri &&
      (audit?.pageSpeed?.mobileScore ?? 1) < 0.5,
  };

  const total = Object.values(breakdown).filter(Boolean).length;
  return { total, max: 8, breakdown };
}

export function scoreBusinesses(
  places: PlaceResult[],
  audits: Map<string, AuditResult>
): ScoredBusiness[] {
  return places.map((place) => {
    const audit = audits.get(place.placeId) ?? null;
    const techScore = calcTechScore(audit);
    const opportunityScore = calcOpportunityScore(place, audit);

    return {
      placeId: place.placeId,
      displayName: place.displayName,
      address: place.address,
      phone: place.phone,
      websiteUri: place.websiteUri,
      category: place.category,
      city: place.city,
      googleRating: place.rating,
      googleReviews: place.reviewCount,
      websiteDetected: !!place.websiteUri,
      websiteStatus: audit?.webPresence?.statusCode ?? null,
      httpsOk: audit?.security?.httpsOk ?? false,
      hasHsts: audit?.security?.hasHsts ?? false,
      pagespeedMobile: audit?.pageSpeed?.mobileScore ?? null,
      pagespeedDesktop: audit?.pageSpeed?.desktopScore ?? null,
      hasContactForm: audit?.forms?.hasContactForm ?? false,
      hasWhatsappLink: audit?.conversion?.hasWhatsappLink ?? false,
      hasBookingFlow: audit?.conversion?.hasBookingFlow ?? false,
      hasStructuredData: audit?.seo?.hasStructuredData ?? false,
      hasManifest: audit?.frontend?.hasPwaManifest ?? false,
      inferredStack:
        audit?.techDetection?.inferredStack?.join(", ") ?? "Desconocido",
      techScore,
      opportunityScore,
      notes: "",
      sourceGoogle: true,
      sourceWebsite: !!audit,
      emails: (audit?.contactExtraction?.emails ?? []).join(", "),
      socialLinks: (audit?.contactExtraction?.socialLinks ?? [])
        .map((s) => s.platform)
        .join(", "),
      isSocialNetworkOnly:
        audit?.contactExtraction?.isSocialNetworkOnly ?? false,
      siteType: audit?.contactExtraction?.siteType ?? "unknown",
    };
  });
}
