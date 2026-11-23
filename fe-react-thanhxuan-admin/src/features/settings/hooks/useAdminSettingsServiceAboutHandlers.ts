"use client";

import type { Dispatch, SetStateAction } from "react";
import type {
  IAdminSettingsForm,
  IPromoBannerItem,
} from "../admin-settings.types";

interface Props {
  setFormData: Dispatch<SetStateAction<IAdminSettingsForm>>;
}

export function useAdminSettingsServiceAboutHandlers({ setFormData }: Props) {
  // --- Service Work Process & Promo ---
  const handleWorkProcessItemChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.serviceConfig.workProcessItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return {
        ...prev,
        serviceConfig: { ...prev.serviceConfig, workProcessItems: newItems },
      };
    });
  };

  const addWorkProcessItem = () => {
    setFormData((prev) => ({
      ...prev,
      serviceConfig: {
        ...prev.serviceConfig,
        workProcessItems: [
          ...prev.serviceConfig.workProcessItems,
          { title: "", description: "" },
        ],
      },
    }));
  };

  const removeWorkProcessItem = (index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.serviceConfig.workProcessItems];
      newItems.splice(index, 1);
      return {
        ...prev,
        serviceConfig: { ...prev.serviceConfig, workProcessItems: newItems },
      };
    });
  };

  const handlePromoBannerChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => {
      const newBanners = [...prev.serviceConfig.promoBanners];
      if (newBanners[index]) {
        newBanners[index] = {
          ...newBanners[index],
          [field]: value,
        } as IPromoBannerItem;
      }
      return {
        ...prev,
        serviceConfig: { ...prev.serviceConfig, promoBanners: newBanners },
      };
    });
  };

  const addPromoBanner = () => {
    setFormData((prev) => ({
      ...prev,
      serviceConfig: {
        ...prev.serviceConfig,
        promoBanners: [
          ...prev.serviceConfig.promoBanners,
          {
            title: "",
            description: "",
            image: "",
            buttonText: "",
            buttonLink: "",
          },
        ],
      },
    }));
  };

  const removePromoBanner = (index: number) => {
    setFormData((prev) => {
      const newBanners = [...prev.serviceConfig.promoBanners];
      newBanners.splice(index, 1);
      return {
        ...prev,
        serviceConfig: { ...prev.serviceConfig, promoBanners: newBanners },
      };
    });
  };

  // --- About Work Process & Promo ---
  const handleAboutWorkProcessItemChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.aboutConfig.workProcessItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return {
        ...prev,
        aboutConfig: { ...prev.aboutConfig, workProcessItems: newItems },
      };
    });
  };

  const addAboutWorkProcessItem = () => {
    setFormData((prev) => ({
      ...prev,
      aboutConfig: {
        ...prev.aboutConfig,
        workProcessItems: [
          ...prev.aboutConfig.workProcessItems,
          { title: "", description: "" },
        ],
      },
    }));
  };

  const removeAboutWorkProcessItem = (index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.aboutConfig.workProcessItems];
      newItems.splice(index, 1);
      return {
        ...prev,
        aboutConfig: { ...prev.aboutConfig, workProcessItems: newItems },
      };
    });
  };

  const handleAboutPromoBannerChange = (
    index: number,
    field: string,
    value: string,
  ) => {
    setFormData((prev) => {
      const newBanners = [...prev.aboutConfig.promoBanners];
      if (newBanners[index]) {
        newBanners[index] = {
          ...newBanners[index],
          [field]: value,
        } as IPromoBannerItem;
      }
      return {
        ...prev,
        aboutConfig: { ...prev.aboutConfig, promoBanners: newBanners },
      };
    });
  };

  const addAboutPromoBanner = () => {
    setFormData((prev) => ({
      ...prev,
      aboutConfig: {
        ...prev.aboutConfig,
        promoBanners: [
          ...prev.aboutConfig.promoBanners,
          {
            title: "",
            description: "",
            image: "",
            buttonText: "",
            buttonLink: "",
          },
        ],
      },
    }));
  };

  const removeAboutPromoBanner = (index: number) => {
    setFormData((prev) => {
      const newBanners = [...prev.aboutConfig.promoBanners];
      newBanners.splice(index, 1);
      return {
        ...prev,
        aboutConfig: { ...prev.aboutConfig, promoBanners: newBanners },
      };
    });
  };

  // --- Contact WhyChooseUs ---
  const handleContactWhyChooseUsItemChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newItems = [...prev.contactConfig.whyChooseUsItems];
      newItems[index] = value;
      return {
        ...prev,
        contactConfig: { ...prev.contactConfig, whyChooseUsItems: newItems },
      };
    });
  };

  const addContactWhyChooseUsItem = () => {
    setFormData((prev) => ({
      ...prev,
      contactConfig: {
        ...prev.contactConfig,
        whyChooseUsItems: [...prev.contactConfig.whyChooseUsItems, ""],
      },
    }));
  };

  const removeContactWhyChooseUsItem = (index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.contactConfig.whyChooseUsItems];
      newItems.splice(index, 1);
      return {
        ...prev,
        contactConfig: { ...prev.contactConfig, whyChooseUsItems: newItems },
      };
    });
  };

  return {
    handleWorkProcessItemChange,
    addWorkProcessItem,
    removeWorkProcessItem,
    handlePromoBannerChange,
    addPromoBanner,
    removePromoBanner,
    handleAboutWorkProcessItemChange,
    addAboutWorkProcessItem,
    removeAboutWorkProcessItem,
    handleAboutPromoBannerChange,
    addAboutPromoBanner,
    removeAboutPromoBanner,
    handleContactWhyChooseUsItemChange,
    addContactWhyChooseUsItem,
    removeContactWhyChooseUsItem,
  };
}
