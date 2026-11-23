export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IWhyChooseUsItem {
  title: string;
  description: string;
}

export interface IWorkProcessItem {
  title: string;
  description: string;
}

export interface IPromoBannerItem {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

export interface IFooterLink {
  label: string;
  url: string;
}

export interface IHomepageConfig {
  heroBannerImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroVideoUrl?: string;
  heroVideoPoster?: string;
  heroSideImage?: string;
  introTitle: string;
  introDescription: string;
  whyChooseUsTitle: string;
  whyChooseUsDescription: string;
  whyChooseUsImage: string;
  whyChooseUsItems: IWhyChooseUsItem[];
  faqs: IFaqItem[];
}

export interface IHeaderConfig {
  marqueeText: string;
  hotlineLabel: string;
  contactLabel: string;
  contactLink: string;
  logoText1: string;
  logoText2: string;
  logoImage?: string;
  searchPlaceholder: string;
}

export interface IFooterConfig {
  companyDescription: string;
  servicesTitle: string;
  servicesLinks: IFooterLink[];
  exploreTitle: string;
  exploreLinks: IFooterLink[];
  contactTitle: string;
  copyrightText: string;
  policyText: string;
  policyLink: string;
  termsText: string;
  termsLink: string;
  mapImageUrl?: string;
}

export interface IServiceConfig {
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  listTitle: string;
  listSubtitle: string;
  workProcessTitle: string;
  workProcessSubtitle: string;
  workProcessItems: IWorkProcessItem[];
  contactTitle: string;
  contactSubtitle: string;
  promoBanners: IPromoBannerItem[];
}

export interface IAboutConfig {
  bannerImage: string;
  bannerTitle: string;
  bannerSubtitle: string;
  listTitle: string;
  listSubtitle: string;
  workProcessTitle: string;
  workProcessSubtitle: string;
  workProcessItems: IWorkProcessItem[];
  contactTitle: string;
  contactSubtitle: string;
  promoBanners: IPromoBannerItem[];
}

export interface IContactConfig {
  pageTitle: string;
  contactInfoTitle: string;
  address: string;
  hotline: string;
  email: string;
  workingHours: string;
  whyChooseUsTitle: string;
  whyChooseUsItems: string[];
}

export interface IVesinhConfig {
  heroBannerImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  hotline?: string;
  introTitle?: string;
  introDescription?: string;
  whyChooseUsTitle?: string;
  whyChooseUsDescription?: string;
  whyChooseUsImage?: string;
  whyChooseUsItems?: IWhyChooseUsItem[];
  faqs?: IFaqItem[];
}

export interface IAdminSettingsForm {
  hotline: string;
  email: string;
  address: string;
  googleMapsLink: string;
  description: string;
  facebookLink: string;
  messengerLink: string;
  zaloLink: string;
  homepageConfig: IHomepageConfig;
  headerConfig: IHeaderConfig;
  footerConfig: IFooterConfig;
  serviceConfig: IServiceConfig;
  aboutConfig: IAboutConfig;
  contactConfig: IContactConfig;
  vesinhConfig?: IVesinhConfig;
}

export type IAdminSettings = IAdminSettingsForm;
