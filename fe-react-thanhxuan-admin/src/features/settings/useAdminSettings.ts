"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { SettingsService } from "./admin-settings.service";
import type {
  IAdminSettingsForm,
  IFooterLink,
} from "./admin-settings.types";
import { useAdminSettingsState } from "./hooks/useAdminSettingsState";
import { useAdminSettingsHomepageHandlers } from "./hooks/useAdminSettingsHomepageHandlers";
import { useAdminSettingsServiceAboutHandlers } from "./hooks/useAdminSettingsServiceAboutHandlers";
import { useAdminSettingsVesinhHandlers } from "./hooks/useAdminSettingsVesinhHandlers";

export type FormChangeTarget =
  | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  | { target: { name: string; value: unknown } };

export function useAdminSettings() {
  const { formData, setFormData, isLoading } = useAdminSettingsState();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (
    configName: keyof IAdminSettingsForm,
    name: string,
    value: unknown,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [configName]: {
        ...((prev[configName] as unknown) as Record<string, unknown>),
        [name]: value,
      },
    }));
  };

  const homepageHandlers = useAdminSettingsHomepageHandlers({ setFormData });

  const serviceAboutHandlers = useAdminSettingsServiceAboutHandlers({
    setFormData,
  });

  const vesinhHandlers = useAdminSettingsVesinhHandlers({ setFormData });

  const handleHomepageChange = (e: FormChangeTarget) => {
    handleNestedChange("homepageConfig", e.target.name, e.target.value);
  };

  const handleVesinhChange = (e: FormChangeTarget) => {
    handleNestedChange("vesinhConfig", e.target.name, e.target.value);
  };

  const handleServiceChange = (e: FormChangeTarget) => {
    handleNestedChange("serviceConfig", e.target.name, e.target.value);
  };

  const handleAboutChange = (e: FormChangeTarget) => {
    handleNestedChange("aboutConfig", e.target.name, e.target.value);
  };

  const handleHeaderChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleNestedChange("headerConfig", e.target.name, e.target.value);
  };

  const handleFooterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleNestedChange("footerConfig", e.target.name, e.target.value);
  };

  const handleFooterLinksChange = (
    field: "servicesLinks" | "exploreLinks",
    newLinks: IFooterLink[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      footerConfig: {
        ...prev.footerConfig,
        [field]: newLinks,
      },
    }));
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    handleNestedChange("contactConfig", e.target.name, e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await SettingsService.updateSettings(formData);
      setMessage("Cập nhật cài đặt thành công!");
      toast.success("Cập nhật cài đặt thành công!");
    } catch {
      setMessage("Đã xảy ra lỗi khi lưu cài đặt.");
      toast.error("Đã xảy ra lỗi khi lưu cài đặt.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    isLoading,
    isSaving,
    message,
    handleChange,
    handleNestedChange,
    handleHomepageChange,
    handleVesinhChange,
    handleServiceChange,
    handleAboutChange,
    handleHeaderChange,
    handleFooterChange,
    handleFooterLinksChange,
    handleContactChange,
    handleSubmit,
    ...homepageHandlers,
    ...serviceAboutHandlers,
    ...vesinhHandlers,
  };
}
