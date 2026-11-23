"use client";

import { useState, useEffect } from "react";
import { SettingsService } from "../admin-settings.service";
import type { IAdminSettingsForm } from "../admin-settings.types";

export const initialSettingsForm: IAdminSettingsForm = {
  hotline: "",
  email: "",
  address: "",
  googleMapsLink: "",
  description: "",
  facebookLink: "",
  messengerLink: "",
  zaloLink: "",
  homepageConfig: {
    heroBannerImage: "",
    heroTitle: "",
    heroSubtitle: "",
    introTitle: "",
    introDescription: "",
    whyChooseUsTitle: "",
    whyChooseUsDescription: "",
    whyChooseUsImage: "",
    whyChooseUsItems: [],
    faqs: [],
  },
  headerConfig: {
    marqueeText: "",
    hotlineLabel: "",
    contactLabel: "",
    contactLink: "",
    logoText1: "",
    logoText2: "",
    searchPlaceholder: "",
  },
  footerConfig: {
    companyDescription: "",
    servicesTitle: "",
    servicesLinks: [],
    exploreTitle: "",
    exploreLinks: [],
    contactTitle: "",
    copyrightText: "",
    policyText: "",
    policyLink: "",
    termsText: "",
    termsLink: "",
  },
  serviceConfig: {
    bannerImage: "",
    bannerTitle: "",
    bannerSubtitle: "",
    listTitle: "",
    listSubtitle: "",
    workProcessTitle: "",
    workProcessSubtitle: "",
    workProcessItems: [],
    contactTitle: "",
    contactSubtitle: "",
    promoBanners: [],
  },
  aboutConfig: {
    bannerImage: "",
    bannerTitle: "",
    bannerSubtitle: "",
    listTitle: "",
    listSubtitle: "",
    workProcessTitle: "",
    workProcessSubtitle: "",
    workProcessItems: [],
    contactTitle: "",
    contactSubtitle: "",
    promoBanners: [],
  },
  contactConfig: {
    pageTitle: "",
    contactInfoTitle: "",
    address: "",
    hotline: "",
    email: "",
    workingHours: "",
    whyChooseUsTitle: "",
    whyChooseUsItems: [],
  },
};

export function useAdminSettingsState() {
  const [formData, setFormData] = useState<IAdminSettingsForm>(initialSettingsForm);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    SettingsService.getSettings()
      .then((data) => {
        setFormData({
          hotline: data.hotline || "",
          email: data.email || "",
          address: data.address || "",
          googleMapsLink: data.googleMapsLink || "",
          description: data.description || "",
          facebookLink: data.facebookLink || "",
          messengerLink: data.messengerLink || "",
          zaloLink: data.zaloLink || "",
          homepageConfig: {
            heroBannerImage: data.homepageConfig?.heroBannerImage || "",
            heroTitle: data.homepageConfig?.heroTitle || "",
            heroSubtitle: data.homepageConfig?.heroSubtitle || "",
            introTitle: data.homepageConfig?.introTitle || "",
            introDescription: data.homepageConfig?.introDescription || "",
            whyChooseUsTitle: data.homepageConfig?.whyChooseUsTitle || "",
            whyChooseUsDescription: data.homepageConfig?.whyChooseUsDescription || "",
            whyChooseUsImage: data.homepageConfig?.whyChooseUsImage || "",
            whyChooseUsItems: data.homepageConfig?.whyChooseUsItems || [],
            faqs: data.homepageConfig?.faqs || [],
          },
          headerConfig: {
            marqueeText: data.headerConfig?.marqueeText || "",
            hotlineLabel: data.headerConfig?.hotlineLabel || "",
            contactLabel: data.headerConfig?.contactLabel || "",
            contactLink: data.headerConfig?.contactLink || "",
            logoText1: data.headerConfig?.logoText1 || "",
            logoText2: data.headerConfig?.logoText2 || "",
            searchPlaceholder: data.headerConfig?.searchPlaceholder || "",
          },
          footerConfig: {
            companyDescription: data.footerConfig?.companyDescription || "",
            servicesTitle: data.footerConfig?.servicesTitle || "",
            servicesLinks: data.footerConfig?.servicesLinks || [],
            exploreTitle: data.footerConfig?.exploreTitle || "",
            exploreLinks: data.footerConfig?.exploreLinks || [],
            contactTitle: data.footerConfig?.contactTitle || "",
            copyrightText: data.footerConfig?.copyrightText || "",
            policyText: data.footerConfig?.policyText || "",
            policyLink: data.footerConfig?.policyLink || "",
            termsText: data.footerConfig?.termsText || "",
            termsLink: data.footerConfig?.termsLink || "",
          },
          serviceConfig: {
            bannerImage: data.serviceConfig?.bannerImage || "",
            bannerTitle: data.serviceConfig?.bannerTitle || "",
            bannerSubtitle: data.serviceConfig?.bannerSubtitle || "",
            listTitle: data.serviceConfig?.listTitle || "",
            listSubtitle: data.serviceConfig?.listSubtitle || "",
            workProcessTitle: data.serviceConfig?.workProcessTitle || "",
            workProcessSubtitle: data.serviceConfig?.workProcessSubtitle || "",
            workProcessItems: data.serviceConfig?.workProcessItems || [],
            contactTitle: data.serviceConfig?.contactTitle || "",
            contactSubtitle: data.serviceConfig?.contactSubtitle || "",
            promoBanners: data.serviceConfig?.promoBanners || [],
          },
          aboutConfig: {
            bannerImage: data.aboutConfig?.bannerImage || "",
            bannerTitle: data.aboutConfig?.bannerTitle || "",
            bannerSubtitle: data.aboutConfig?.bannerSubtitle || "",
            listTitle: data.aboutConfig?.listTitle || "",
            listSubtitle: data.aboutConfig?.listSubtitle || "",
            workProcessTitle: data.aboutConfig?.workProcessTitle || "",
            workProcessSubtitle: data.aboutConfig?.workProcessSubtitle || "",
            workProcessItems: data.aboutConfig?.workProcessItems || [],
            contactTitle: data.aboutConfig?.contactTitle || "",
            contactSubtitle: data.aboutConfig?.contactSubtitle || "",
            promoBanners: data.aboutConfig?.promoBanners || [],
          },
          contactConfig: {
            pageTitle: data.contactConfig?.pageTitle || "",
            contactInfoTitle: data.contactConfig?.contactInfoTitle || "",
            address: data.contactConfig?.address || "",
            hotline: data.contactConfig?.hotline || "",
            email: data.contactConfig?.email || "",
            workingHours: data.contactConfig?.workingHours || "",
            whyChooseUsTitle: data.contactConfig?.whyChooseUsTitle || "",
            whyChooseUsItems: data.contactConfig?.whyChooseUsItems || [],
          },
        });
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { formData, setFormData, isLoading };
}
