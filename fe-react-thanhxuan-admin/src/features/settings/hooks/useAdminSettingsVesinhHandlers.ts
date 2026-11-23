"use client";

import type { Dispatch, SetStateAction } from "react";
import type { IAdminSettingsForm } from "../admin-settings.types";

interface Props {
  setFormData: Dispatch<SetStateAction<IAdminSettingsForm>>;
}

export function useAdminSettingsVesinhHandlers({ setFormData }: Props) {
  const handleVesinhFaqChange = (
    index: number,
    field: "question" | "answer",
    value: string,
  ) => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newFaqs = [...(currentConfig.faqs || [])];
      if (newFaqs[index]) {
        newFaqs[index] = { ...newFaqs[index], [field]: value };
      }
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, faqs: newFaqs },
      };
    });
  };

  const addVesinhFaq = () => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newFaqs = [...(currentConfig.faqs || []), { question: "", answer: "" }];
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, faqs: newFaqs },
      };
    });
  };

  const removeVesinhFaq = (index: number) => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newFaqs = [...(currentConfig.faqs || [])];
      newFaqs.splice(index, 1);
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, faqs: newFaqs },
      };
    });
  };

  const handleVesinhWhyChooseUsItemChange = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newItems = [...(currentConfig.whyChooseUsItems || [])];
      if (newItems[index]) {
        newItems[index] = { ...newItems[index], [field]: value };
      }
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, whyChooseUsItems: newItems },
      };
    });
  };

  const addVesinhWhyChooseUsItem = () => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newItems = [
        ...(currentConfig.whyChooseUsItems || []),
        { title: "", description: "" },
      ];
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, whyChooseUsItems: newItems },
      };
    });
  };

  const removeVesinhWhyChooseUsItem = (index: number) => {
    setFormData((prev) => {
      const currentConfig = prev.vesinhConfig || {};
      const newItems = [...(currentConfig.whyChooseUsItems || [])];
      newItems.splice(index, 1);
      return {
        ...prev,
        vesinhConfig: { ...currentConfig, whyChooseUsItems: newItems },
      };
    });
  };

  return {
    handleVesinhFaqChange,
    addVesinhFaq,
    removeVesinhFaq,
    handleVesinhWhyChooseUsItemChange,
    addVesinhWhyChooseUsItem,
    removeVesinhWhyChooseUsItem,
  };
}
