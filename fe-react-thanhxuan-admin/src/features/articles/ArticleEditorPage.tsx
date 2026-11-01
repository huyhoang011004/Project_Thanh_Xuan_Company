import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { articlesService } from './articles.service';
import { useCategories } from '@/features/categories/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, UploadCloud } from 'lucide-react';
import { getErrorMessage } from '@/lib/api-client';

export function ArticleEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { categories } = useCategories('POST');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [isPinned, setIsPinned] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      articlesService
        .getById(id)
        .then((art) => {
          setTitle(art.title);
          setSlug(art.slug);
          setCategoryId(typeof art.categoryId === 'string' ? art.categoryId : art.categoryId?._id || '');
          setThumbnail(art.thumbnail || '');
          setDescription(art.description || '');
          setContent(art.content || '');
          setMetaTitle(art.metaTitle || '');
          setMetaDescription(art.metaDescription || '');
          setIsPublished(art.isPublished);
          setIsPinned(art.isPinned);
        })
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [id, isEditing]);

  const generateSlug = (val: string) =>
    val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) setSlug(generateSlug(val));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await articlesService.uploadImage(file);
      if (res.url) {
        setThumbnail(res.url);
        toast.success('Tải ảnh đại diện thành công!');
      }
    } catch (err: unknown) {
      toast.error(`Không thể tải ảnh: ${getErrorMessage(err)}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết.');
      toast.error('Vui lòng điền đầy đủ tiêu đề và nội dung bài viết.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        categoryId: categoryId || categories[0]?._id || '',
        thumbnail: thumbnail.trim(),
        description: description.trim(),
        content: content.trim(),
        metaTitle: metaTitle.trim() || title.trim(),
        metaDescription: metaDescription.trim() || description.trim(),
        isPublished,
        isPinned,
      };

      if (isEditing && id) {
        await articlesService.update(id, payload);
        toast.success('Cập nhật bài viết thành công!');
      } else {
        await articlesService.create(payload);
        toast.success('Tạo bài viết mới thành công!');
      }
      navigate('/articles');
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-slate-400">Đang tải nội dung bài viết...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/articles')}
            className="gap-1.5 text-slate-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? 'Chỉnh Sửa Bài Viết' : 'Soạn Bài Viết Mới'}
          </h1>
        </div>

        <Button type="submit" disabled={isSaving} className="gap-1.5 font-semibold">
          <Save className="h-4 w-4" />
          {isSaving ? 'Đang lưu...' : 'Lưu Bài Viết'}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content (2 Cols) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Nội Dung Bài Viết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tiêu đề bài viết *</label>
                <Input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết chuẩn SEO..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Đường dẫn tĩnh (Slug) *</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="duong-dan-bai-viet-chuan-seo"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Tóm tắt ngắn (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Đoạn tóm tắt thu hút người đọc..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Nội dung chi tiết (HTML / Markdown) *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={16}
                  className="w-full font-mono text-xs rounded-md border border-input bg-background p-3 shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Soạn thảo nội dung bài viết..."
                  required
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Settings (1 Col) */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Phân Loại & Trạng Thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Chuyên mục</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
                >
                  <option value="">-- Chọn chuyên mục --</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPublished" className="text-xs font-semibold text-slate-700">
                  Xuất bản công khai ngay
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPinned" className="text-xs font-semibold text-slate-700">
                  Ghim bài viết lên đầu trang
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Ảnh Đại Diện (Thumbnail)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {thumbnail ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200">
                  <img src={thumbnail} alt="Thumbnail preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <UploadCloud className="h-8 w-8 mb-1" />
                  <span className="text-xs">Chưa có ảnh đại diện</span>
                </div>
              )}

              <Input
                value={thumbnail}
                onChange={(e) => setThumbnail(e.target.value)}
                placeholder="Dán link ảnh hoặc chọn file tải lên..."
                className="text-xs"
              />

              <label className="flex h-8 w-full items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
                <span>Chọn ảnh từ máy tính</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
