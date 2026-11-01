export interface WebsiteSettings {
  hotline: string;
  email: string;
  address: string;
  googleMapsLink?: string;
  description?: string;
  facebookLink?: string;
  zaloLink?: string;
  headerConfig?: {
    marqueeText?: string;
    hotlineLabel?: string;
    logoText1?: string;
    logoText2?: string;
  };
  footerConfig?: {
    companyDescription?: string;
    copyrightText?: string;
    policyText?: string;
  };
  homepageConfig?: {
    heroTitle?: string;
    heroSubtitle?: string;
    heroBannerImage?: string;
  };
}
