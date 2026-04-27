import ExcelJS from "exceljs";
import type { ScoredBusiness } from "../scoring/types";

export async function buildXlsx(businesses: ScoredBusiness[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "LitScrap";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Auditoría", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Negocio", key: "displayName", width: 30 },
    { header: "Categoría", key: "category", width: 20 },
    { header: "Ciudad", key: "city", width: 18 },
    { header: "Teléfono", key: "phone", width: 16 },
    { header: "Website", key: "websiteUri", width: 35 },
    { header: "Website Detectado", key: "websiteDetected", width: 18 },
    { header: "HTTP Status", key: "websiteStatus", width: 12 },
    { header: "HTTPS OK", key: "httpsOk", width: 10 },
    { header: "HSTS", key: "hasHsts", width: 10 },
    { header: "PageSpeed Móvil", key: "pagespeedMobile", width: 16 },
    { header: "PageSpeed Desktop", key: "pagespeedDesktop", width: 18 },
    { header: "Formulario Contacto", key: "hasContactForm", width: 18 },
    { header: "WhatsApp Link", key: "hasWhatsappLink", width: 14 },
    { header: "Reservas/Booking", key: "hasBookingFlow", width: 16 },
    { header: "Datos Estructurados", key: "hasStructuredData", width: 19 },
    { header: "Manifest PWA", key: "hasManifest", width: 13 },
    { header: "Stack Inferido", key: "inferredStack", width: 22 },
    { header: "Rating Google", key: "googleRating", width: 13 },
    { header: "Reseñas Google", key: "googleReviews", width: 15 },
    { header: "Tech Score", key: "techScore", width: 11 },
    { header: "Opportunity Score", key: "opportunityScore", width: 17 },
    { header: "Fuente Google", key: "sourceGoogle", width: 14 },
    { header: "Fuente Website", key: "sourceWebsite", width: 15 },
    { header: "Emails", key: "emails", width: 30 },
    { header: "Redes Sociales", key: "socialLinks", width: 28 },
    { header: "Tipo de Web", key: "siteType", width: 14 },
    { header: "Solo Red Social", key: "isSocialNetworkOnly", width: 15 },
    { header: "Notas", key: "notes", width: 30 },
  ];

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1e3a5f" },
    };
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FF4a90d9" } },
    };
  });
  headerRow.height = 22;

  for (const b of businesses) {
    const row = sheet.addRow({
      displayName: b.displayName,
      category: b.category ?? "",
      city: b.city ?? "",
      phone: b.phone ?? "",
      websiteUri: b.websiteUri ?? "",
      websiteDetected: b.websiteDetected ? "Sí" : "No",
      websiteStatus: b.websiteStatus ?? "",
      httpsOk: b.httpsOk ? "✓" : "✗",
      hasHsts: b.hasHsts ? "✓" : "✗",
      pagespeedMobile:
        b.pagespeedMobile !== null
          ? `${Math.round(b.pagespeedMobile * 100)}`
          : "N/A",
      pagespeedDesktop:
        b.pagespeedDesktop !== null
          ? `${Math.round(b.pagespeedDesktop * 100)}`
          : "N/A",
      hasContactForm: b.hasContactForm ? "✓" : "✗",
      hasWhatsappLink: b.hasWhatsappLink ? "✓" : "✗",
      hasBookingFlow: b.hasBookingFlow ? "✓" : "✗",
      hasStructuredData: b.hasStructuredData ? "✓" : "✗",
      hasManifest: b.hasManifest ? "✓" : "✗",
      inferredStack: b.inferredStack,
      googleRating: b.googleRating ?? "",
      googleReviews: b.googleReviews ?? "",
      techScore: `${b.techScore.total}/${b.techScore.max}`,
      opportunityScore: `${b.opportunityScore.total}/${b.opportunityScore.max}`,
      sourceGoogle: b.sourceGoogle ? "Google Places" : "",
      sourceWebsite: b.sourceWebsite ? "Auditoría Web" : "",
      emails: b.emails ?? "",
      socialLinks: b.socialLinks ?? "",
      siteType: b.siteType ?? "",
      isSocialNetworkOnly: b.isSocialNetworkOnly ? "Sí" : "No",
      notes: b.notes,
    });

    // Color opportunity score cell
    const oppScore = b.opportunityScore.total;
    const scoreCell = row.getCell("opportunityScore");
    if (oppScore >= 5) {
      scoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF4444" },
      };
      scoreCell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    } else if (oppScore >= 3) {
      scoreCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFA500" },
      };
    }

    row.alignment = { vertical: "middle" };
  }

  // Auto-filter
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
