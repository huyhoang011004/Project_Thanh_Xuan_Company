import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CategoriesService } from "./admin-categories.service";
import { ICategoryNode } from "./admin-categories.types";
import { toast } from "sonner";
import { confirmAlert } from "@/components/common";

export function useAdminCategories() {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<
    "SERVICE" | "POST" | "ABOUT"
  >("SERVICE");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "SERVICE" as "SERVICE" | "POST" | "ABOUT",
    parentId: "",
    description: "",
    order: 1,
    meta_title: "",
    meta_description: "",
    is_active: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ["admin_categories", selectedTypeFilter],
    queryFn: async () => {
      const [treeData, flatData] = await Promise.all([
        CategoriesService.getCategoriesTree(selectedTypeFilter),
        CategoriesService.getFlatCategories(selectedTypeFilter),
      ]);
      return {
        treeData: Array.isArray(treeData) ? treeData : [],
        flatData: Array.isArray(flatData) ? flatData : [],
      };
    },
  });

  const categoriesTree: ICategoryNode[] = data?.treeData || [];
  const flatCategories: ICategoryNode[] = data?.flatData || [];

  const fetchCategories = () => refetch();

  const handleOpenAddModal = (parentId: string = "") => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      type: selectedTypeFilter,
      parentId: parentId,
      description: "",
      order: 1,
      meta_title: "",
      meta_description: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: ICategoryNode) => {
    setEditingId(category._id);
    setFormData({
      name: category.name,
      slug: category.slug,
      type: category.type as "SERVICE" | "POST" | "ABOUT",
      parentId: category.parentId || "",
      description: category.description || "",
      order: category.order || 1,
      meta_title: category.meta_title || "",
      meta_description: category.meta_description || "",
      is_active: category.is_active ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = await confirmAlert({
      title: "Xác nhận xóa chuyên mục",
      text: "Bạn có chắc chắn muốn xóa chuyên mục này? Các danh mục con có thể bị ảnh hưởng.",
      icon: "warning",
    });

    if (isConfirmed) {
      try {
        await CategoriesService.deleteCategory(id);
        toast.success("Xóa chuyên mục thành công");
        refetch();
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Lỗi khi xóa chuyên mục");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      toast.error("Vui lòng điền tên và slug chuyên mục");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingId) {
        await CategoriesService.updateCategory(editingId, formData);
        toast.success("Cập nhật chuyên mục thành công");
      } else {
        await CategoriesService.createCategory(formData);
        toast.success("Tạo chuyên mục thành công");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu chuyên mục");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    if (!editingId) {
      const generatedSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, name, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  return {
    selectedTypeFilter,
    setSelectedTypeFilter,
    categoriesTree,
    flatCategories,
    loading,
    isModalOpen,
    setIsModalOpen,
    editingId,
    formData,
    setFormData,
    submitLoading,
    fetchCategories,
    handleOpenAddModal,
    handleOpenEditModal,
    handleDelete,
    handleSubmit,
    handleNameChange,
  };
}
