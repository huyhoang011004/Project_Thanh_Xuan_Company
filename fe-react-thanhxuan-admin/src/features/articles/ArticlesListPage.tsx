import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useArticles } from './useArticles';
import { useCategories } from '@/features/categories/useCategories';
import { useTenant } from '@/app/TenantContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, FileText, Search, RefreshCw, Pin } from 'lucide-react';
import { formatDateVN } from '@/lib/utils';

export function ArticlesListPage() {
  const { config } = useTenant();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const { articles, isLoading, refetch, deleteArticle } = useArticles(
    search || undefined,
    selectedCategory !== 'ALL' ? selectedCategory : undefined
  );
  const { categories } = useCategories('POST');

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${title}"?`)) {
      await deleteArticle(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản Lý Bài Viết SEO</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Danh sách bài viết blog, cẩm nang và tin tức của <span className="font-semibold text-primary">{config.brandName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
          <Button size="sm" onClick={() => navigate('/articles/new')} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Viết Bài Mới
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm theo tiêu đề hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
          >
            <option value="ALL">Tất cả chuyên mục</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead>Bài Viết</TableHead>
              <TableHead>Chuyên Mục</TableHead>
              <TableHead className="text-center">Trạng Thái</TableHead>
              <TableHead className="text-center">Ngày Đăng</TableHead>
              <TableHead className="text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Đang tải danh sách bài viết...
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                  Chưa có bài viết nào phù hợp. Bấm &quot;Viết Bài Mới&quot; để tạo nội dung.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((art, idx) => (
                <TableRow key={art._id}>
                  <TableCell className="text-center font-medium text-slate-500">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-start gap-3">
                      {art.thumbnail ? (
                        <img
                          src={art.thumbnail}
                          alt={art.title}
                          className="h-10 w-16 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-16 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 text-xs shrink-0">
                          Ảnh
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5">
                          {art.isPinned && <Pin className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                          <span className="font-semibold text-slate-900 line-clamp-1">{art.title}</span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">{art.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {art.category?.name || 'Chung'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={art.isPublished ? 'success' : 'secondary'}>
                      {art.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-500">
                    {formatDateVN(art.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/articles/edit/${art._id}`)}
                        className="h-8 w-8 p-0 text-slate-600 hover:text-primary"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(art._id, art.title)}
                        className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                        title="Xóa bài viết"
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
    </div>
  );
}
