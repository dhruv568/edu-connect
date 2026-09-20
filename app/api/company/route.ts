import { NextResponse } from "next/server";
import { OFFICIAL_COMPANY_INFO, OFFICIAL_SERVICES } from "@/lib/company";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const configs = await prisma.platformConfig.findMany({
      where: {
        OR: [{ key: { startsWith: "company_" } }, { key: { startsWith: "social_" } }],
      },
    });

    const settingsMap: Record<string, string> = {};
    configs.forEach((c) => {
      settingsMap[c.key] = c.value;
    });

    const companyInfo = {
      ...OFFICIAL_COMPANY_INFO,
      brandName: settingsMap.company_brand_name || OFFICIAL_COMPANY_INFO.brandName,
      legalName: settingsMap.company_legal_name || OFFICIAL_COMPANY_INFO.legalName,
      cin: settingsMap.company_cin || OFFICIAL_COMPANY_INFO.cin,
      pan: settingsMap.company_pan || OFFICIAL_COMPANY_INFO.pan,
      founder: settingsMap.company_founder || OFFICIAL_COMPANY_INFO.founder,
      authorizedSignatory: settingsMap.company_authorized_signatory || OFFICIAL_COMPANY_INFO.authorizedSignatory,
      natureOfBusiness: settingsMap.company_nature_of_business || OFFICIAL_COMPANY_INFO.natureOfBusiness,
      registeredAddress: settingsMap.company_registered_address || OFFICIAL_COMPANY_INFO.registeredAddress,
      website: settingsMap.company_website || OFFICIAL_COMPANY_INFO.website,
      tagline: settingsMap.company_tagline || OFFICIAL_COMPANY_INFO.tagline,
      governingLaw: settingsMap.company_governing_law || OFFICIAL_COMPANY_INFO.governingLaw,
      whatsappNumber: settingsMap.company_whatsapp_number || OFFICIAL_COMPANY_INFO.whatsappNumber,
      refundPeriod: settingsMap.company_refund_period || OFFICIAL_COMPANY_INFO.refundPeriod,
      pricingRange: settingsMap.company_pricing_range || OFFICIAL_COMPANY_INFO.pricingRange,
      currency: settingsMap.company_currency || OFFICIAL_COMPANY_INFO.currency,
      socials: {
        youtube: settingsMap.social_youtube_url !== undefined ? settingsMap.social_youtube_url : OFFICIAL_COMPANY_INFO.socials.youtube,
        facebook: settingsMap.social_facebook_url !== undefined ? settingsMap.social_facebook_url : OFFICIAL_COMPANY_INFO.socials.facebook,
        instagram: settingsMap.social_instagram_url !== undefined ? settingsMap.social_instagram_url : OFFICIAL_COMPANY_INFO.socials.instagram,
        linkedin: settingsMap.social_linkedin_url !== undefined ? settingsMap.social_linkedin_url : OFFICIAL_COMPANY_INFO.socials.linkedin,
        whatsapp: settingsMap.social_whatsapp_url !== undefined ? settingsMap.social_whatsapp_url : (settingsMap.company_whatsapp_url || OFFICIAL_COMPANY_INFO.socials.whatsapp || OFFICIAL_COMPANY_INFO.whatsappUrl),
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        company: companyInfo,
        services: OFFICIAL_SERVICES,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        data: {
          company: OFFICIAL_COMPANY_INFO,
          services: OFFICIAL_SERVICES,
        },
      },
      { status: 200 }
    );
  }
}
