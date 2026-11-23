import { useState } from 'react';
import { useCategories } from './useCategories';
import { CategoryModal } from './CategoryModal';
import { CategoryItem, CategoryPayload } from './categories.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, FolderTree, RefreshCw } from 'lucide-react';
import { useTenant } from '@/app/TenantContext';

export function CategoriesListPage() {
  const { config } = useTenant();
  const { categories, isLoading, refetch, createCategory, updateCategory, deleteCategory } = useCategories();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CategoryItem) => {
    setEditingCategory(item);
    setModalOpen(true);
  };

  const handleSave = async (payload: CategoryPayload) => {
    if (editingCategory) {
      await updateCategory({ id: editingCategory._id, payload });
    } else {
      await createCategory(payload);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chuyên mục "${name}"?`)) {
      await deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Quản Lý Chuyên Mục</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chuyên mục bài viết và dịch vụ của <span className="font-semibold text-primary">{config.brandName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-95">
            <Plus className="h-4 w-4" />
            Thêm Chuyên Mục
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Tên Chuyên Mục</TableHead>
              <TableHead>Đường Dẫn (Slug)</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead className="text-center">Thứ Tự</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Đang tải danh sách chuyên mục...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Chưa có chuyên mục nào. Bấm &quot;Thêm Chuyên Mục&quot; để tạo mới.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, idx) => (
                <TableRow key={cat._id}>
                  <TableCell className="text-center font-medium text-slate-500 dark:text-slate-400">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{cat.name}</div>
                    {cat.description && (
                      <div className="text-xs text-slate-400 dark:text-slate-500 line-clamp-1">{cat.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">{cat.slug}</TableCell>
                  <TableCell>
                    <Badge variant={cat.type === 'SERVICE' ? 'default' : 'secondary'}>
                      {cat.type === 'SERVICE' ? 'Dịch vụ' : cat.type === 'ABOUT' ? 'Giới thiệu' : 'Bài viết'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {cat.order || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(cat)}
                        className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cat._id, cat.name)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        onSave={handleSave}
      />
    </div>
  );
}
