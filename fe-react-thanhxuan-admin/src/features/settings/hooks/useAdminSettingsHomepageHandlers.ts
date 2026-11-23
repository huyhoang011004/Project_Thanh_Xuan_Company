"use client";

import type { Dispatch, SetStateAction } from "react";
import type { IAdminSettingsForm } from "../admin-settings.types";

interface Props {
  setFormData: Dispatch<SetStateAction<IAdminSettingsForm>>;
}

export function useAdminSettingsHomepageHandlers({ setFormData }: Props) {
  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    setFormData((prev) => {
      const newFaqs = [...prev.homepageConfig.faqs];
      if (newFaqs[index]) {
        newFaqs[index] = { ...newFaqs[index], [field]: value };
      }
      return {
        ...prev,
        homepageConfig: { ...prev.homepageConfig, faqs: newFaqs },
      };
    });
  };

  const addFaq = () => {
    setFormData((prev) => ({
      ...prev,
      homepageConfig: {
        ...prev.homepageConfig,
        faqs: [...prev.homepageConfig.faqs, { question: "", answer: "" }],
      },
    }));
  };

  const removeFaq = (index: number) => {
    setFormData((prev) => {
      const newFaqs = [...prev.homepageConfig.faqs];
      newFaqs.splice(index, 1);
      return {
        ...prev,
        homepageConfig: { ...prev.homepageConfig, faqs: newFaqs },
      };
    });
  };

  const handleWhyChooseUsItemChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFormData((prev) => {
      const newItems = [...prev.homepageConfig.whyChooseUsItems];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return {
        ...prev,
        homepageConfig: { ...prev.homepageConfig, whyChooseUsItems: newItems },
      };
    });
  };

  const addWhyChooseUsItem = () => {
    setFormData((prev) => ({
      ...prev,
      homepageConfig: {
        ...prev.homepageConfig,
        whyChooseUsItems: [
          ...prev.homepageConfig.whyChooseUsItems,
          { title: "", description: "" },
        ],
      },
    }));
  };

  const removeWhyChooseUsItem = (index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.homepageConfig.whyChooseUsItems];
      newItems.splice(index, 1);
      return {
        ...prev,
        homepageConfig: { ...prev.homepageConfig, whyChooseUsItems: newItems },
      };
    });
  };

  return {
    handleFaqChange,
    addFaq,
    removeFaq,
    handleWhyChooseUsItemChange,
    addWhyChooseUsItem,
    removeWhyChooseUsItem,
  };
}
