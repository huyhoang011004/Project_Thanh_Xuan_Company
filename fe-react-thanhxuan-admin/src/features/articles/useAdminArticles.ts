import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { confirmAlert } from "@/components/common";
import { apiClient } from "@/lib/api-client";
import { IArticle } from "./admin-articles.types";

export interface ICategoryTreeItem {
  _id: string;
  name: string;
  slug?: string;
  children?: ICategoryTreeItem[];
}

export function useAdminArticles() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sortFilter, setSortFilter] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isTrashMode, setIsTrashMode] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [search, statusFilter, categoryFilter, isTrashMode, sortFilter]);

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ["admin_articles", search, statusFilter, categoryFilter, isTrashMode, sortFilter],
    queryFn: async () => {
      const params: Record<string, string | boolean> = {};
      if (search) params.search = search;
      if (categoryFilter !== "ALL") params.categoryId = categoryFilter;
      if (isTrashMode) {
        params.isDeleted = true;
      } else if (statusFilter !== "ALL") {
        params.isPublished = statusFilter === "PUBLISHED";
      }

      const [resArticles, resCategories] = await Promise.allSettled([
        apiClient.get<unknown>("/articles", { params }),
        apiClient.get<unknown>("/categories"),
      ]);

      let articlesList: IArticle[] = [];
      if (resArticles.status === "fulfilled") {
        const raw = resArticles.value.data;
        const list = Array.isArray(raw)
          ? raw
          : (raw as { articles?: unknown[]; data?: unknown[] })?.articles ||
            (raw as { data?: unknown[] })?.data ||
            [];
        articlesList = list as IArticle[];
      }

      let categoriesList: ICategoryTreeItem[] = [];
      if (resCategories.status === "fulfilled") {
        const raw = resCategories.value.data;
        const list = Array.isArray(raw)
          ? raw
          : (raw as { categories?: unknown[]; data?: unknown[] })?.categories ||
            (raw as { data?: unknown[] })?.data ||
            [];
        categoriesList = list as ICategoryTreeItem[];
      }

      return { articles: articlesList, categories: categoriesList };
    },
  });

  const articles: IArticle[] = data?.articles || [];
  const categories: ICategoryTreeItem[] = data?.categories || [];

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setIsTrashMode(status === "TRASH");
  };

  const handlePinToggle = async (id: string, currentPin: boolean) => {
    try {
      await apiClient.put(`/articles/${id}`, { isPinned: !currentPin });
      toast.success(currentPin ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết lên đầu");
      refetch();
    } catch {
      toast.error("Lỗi khi thay đổi trạng thái ghim");
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert({
      title: isTrashMode ? "Xóa vĩnh viễn" : "Chuyển vào thùng rác",
      text: isTrashMode
        ? "Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này?"
        : "Bài viết sẽ được đưa vào thùng rác.",
      icon: "warning",
    });

    if (isConfirmed) {
      try {
        if (isTrashMode) {
          await apiClient.delete(`/articles/${id}`);
          toast.success("Đã xóa vĩnh viễn bài viết");
        } else {
          await apiClient.put(`/articles/${id}`, { isDeleted: true });
          toast.success("Đã chuyển bài viết vào thùng rác");
        }
        refetch();
      } catch {
        toast.error("Thao tác xóa thất bại");
      }
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await apiClient.put(`/articles/${id}`, { isDeleted: false });
      toast.success("Đã khôi phục bài viết thành công");
      refetch();
    } catch {
      toast.error("Không thể khôi phục bài viết");
    }
  };

  const handleBulkTrash = async () => {
    if (!selectedIds.length) return;
    const isConfirmed = await confirmAlert({
      title: "Chuyển vào thùng rác",
      text: `Chuyển ${selectedIds.length} bài viết vào thùng rác?`,
      icon: "warning",
    });

    if (isConfirmed) {
      try {
        await Promise.all(
          selectedIds.map((id) => apiClient.put(`/articles/${id}`, { isDeleted: true }))
        );
        toast.success(`Đã chuyển ${selectedIds.length} bài viết vào thùng rác`);
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
        selectedIds.map((id) => apiClient.put(`/articles/${id}`, { isDeleted: false }))
      );
      toast.success(`Đã khôi phục ${selectedIds.length} bài viết`);
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
      text: `Xóa vĩnh viễn ${selectedIds.length} bài viết đã chọn?`,
      icon: "error",
    });

    if (isConfirmed) {
      try {
        await Promise.all(selectedIds.map((id) => apiClient.delete(`/articles/${id}`)));
        toast.success(`Đã xóa vĩnh viễn ${selectedIds.length} bài viết`);
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
      text: "Xóa vĩnh viễn tất cả bài viết trong thùng rác?",
      icon: "error",
    });

    if (isConfirmed) {
      try {
        await apiClient.delete("/articles/trash/empty");
        toast.success("Đã dọn sạch thùng rác bài viết");
        setSelectedIds([]);
        refetch();
      } catch {
        toast.error("Không thể dọn sạch thùng rác");
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === articles.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((item) => item._id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return {
    articles,
    categories,
    loading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter: handleStatusChange,
    categoryFilter,
    setCategoryFilter,
    sortFilter,
    setSortFilter,
    selectedIds,
    isTrashMode,
    setIsTrashMode,
    handlePinToggle,
    handleDelete,
    handleRestore,
    handleBulkRestore,
    handleBulkDelete,
    handleBulkTrash,
    handleEmptyTrash,
    toggleSelectAll,
    toggleSelect,
    refetch,
  };
}
