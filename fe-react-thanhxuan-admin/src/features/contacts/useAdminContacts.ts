import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { confirmAlert } from "@/components/common";
import { apiClient } from "@/lib/api-client";
import type {
  IContactItem,
  ICategoryItem,
} from "./types/admin-contacts.types";
import { exportContactsToExcel } from "./utils/contacts-export.util";

export const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chưa xử lý (Mới)" },
  { value: "processed", label: "Đã liên hệ" },
  { value: "resolved", label: "Đã chốt / Hoàn thành" },
];

export function useAdminContacts() {
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTrash, setIsTrash] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [statusFilter, startDate, endDate, searchQuery, isTrash]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin_contacts", statusFilter, startDate, endDate, isTrash],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};
      if (statusFilter && !isTrash) params.status = statusFilter;
      if (isTrash) params.isDeleted = true;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [resContacts, resCategories] = await Promise.allSettled([
        apiClient.get<unknown>("/contacts", { params }),
        apiClient.get<unknown>("/categories"),
      ]);

      let contactsList: IContactItem[] = [];
      if (resContacts.status === "fulfilled") {
        const raw = resContacts.value.data;
        const list = Array.isArray(raw)
          ? raw
          : (raw as { contacts?: unknown[]; data?: unknown[] })?.contacts ||
            (raw as { data?: unknown[] })?.data ||
            [];
        contactsList = list as IContactItem[];
      }

      let categoriesList: ICategoryItem[] = [];
      if (resCategories.status === "fulfilled") {
        const raw = resCategories.value.data;
        const list = Array.isArray(raw)
          ? raw
          : (raw as { categories?: unknown[]; data?: unknown[] })?.categories ||
            (raw as { data?: unknown[] })?.data ||
            [];
        categoriesList = list as ICategoryItem[];
      }

      return {
        contacts: contactsList,
        categories: categoriesList,
      };
    },
  });

  const contacts = data?.contacts || [];
  const categories = data?.categories || [];

  const filteredContacts = contacts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.fullName && c.fullName.toLowerCase().includes(q)) ||
      (c.phoneNumber && c.phoneNumber.includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredContacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredContacts.map((c) => c._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/contacts/${id}`, { status: newStatus });
      toast.success("Cập nhật trạng thái thành công");
      refetch();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: string, permanent = false) => {
    const isConfirmed = await confirmAlert({
      title: permanent ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác",
      text: permanent
        ? "Dữ liệu liên hệ này sẽ mất hoàn toàn, không thể khôi phục."
        : "Khách hàng này sẽ được đưa vào thùng rác.",
      icon: "warning",
    });

    if (isConfirmed) {
      try {
        if (permanent) {
          await apiClient.delete(`/contacts/${id}`);
        } else {
          await apiClient.put(`/contacts/${id}`, { isDeleted: true });
        }
        toast.success(permanent ? "Đã xóa vĩnh viễn" : "Đã chuyển vào thùng rác");
        refetch();
      } catch {
        toast.error("Thao tác thất bại");
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await apiClient.put(`/contacts/${id}`, { isDeleted: false });
      toast.success("Đã khôi phục liên hệ");
      refetch();
    } catch {
      toast.error("Không thể khôi phục");
    }
  };

  const handleBulkTrash = async () => {
    if (!selectedIds.length) return;
    const isConfirmed = await confirmAlert({
      title: "Chuyển vào thùng rác hàng loạt",
      text: `Bạn có chắc muốn chuyển ${selectedIds.length} liên hệ vào thùng rác?`,
      icon: "warning",
    });

    if (isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map((id) => apiClient.put(`/contacts/${id}`, { isDeleted: true }))
        );
        toast.success(`Đã chuyển ${selectedIds.length} mục vào thùng rác`);
        setSelectedIds([]);
        refetch();
      } catch {
        toast.error("Thao tác hàng loạt thất bại");
      }
    }
  };

  const handleBulkRestore = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(
        selectedIds.map((id) => apiClient.put(`/contacts/${id}`, { isDeleted: false }))
      );
      toast.success(`Đã khôi phục ${selectedIds.length} mục`);
      setSelectedIds([]);
      refetch();
    } catch {
      toast.error("Khôi phục hàng loạt thất bại");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    const isConfirmed = await confirmAlert({
      title: "Xóa vĩnh viễn hàng loạt",
      text: `Toàn bộ ${selectedIds.length} dữ liệu sẽ bị xóa không thể khôi phục!`,
      icon: "error",
    });

    if (isConfirmed) {
      try {
        await Promise.all(selectedIds.map((id) => apiClient.delete(`/contacts/${id}`)));
        toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} mục`);
        setSelectedIds([]);
        refetch();
      } catch {
        toast.error("Xóa vĩnh viễn thất bại");
      }
    }
  };

  const handleEmptyTrash = async () => {
    const isConfirmed = await confirmAlert({
      title: "Dọn sạch thùng rác",
      text: "Bạn có chắc chắn muốn dọn sạch tất cả dữ liệu trong thùng rác?",
      icon: "error",
    });

    if (isConfirmed) {
      try {
        await apiClient.delete("/contacts/trash/empty");
        toast.success("Đã dọn sạch thùng rác");
        setSelectedIds([]);
        refetch();
      } catch {
        toast.error("Không thể dọn sạch thùng rác");
      }
    }
  };

  const handleExportExcel = () => {
    exportContactsToExcel({
      filteredContacts,
      statusFilter,
      startDate,
      endDate,
      getCategoryName,
    });
  };

  const getCategoryName = (slug: string) => {
    const cat = categories.find((c) => c.slug === slug);
    return cat ? cat.name : "Tư vấn chung";
  };

  return {
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    searchQuery,
    setSearchQuery,
    selectedIds,
    isTrash,
    setIsTrash,
    contacts,
    filteredContacts,
    isLoading,
    toggleSelectAll,
    toggleSelect,
    handleStatusChange,
    handleDelete,
    handleRestore,
    handleBulkTrash,
    handleBulkRestore,
    handleBulkDelete,
    handleEmptyTrash,
    handleExportExcel,
    getCategoryName,
    refetch,
  };
}
