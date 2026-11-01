import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryItem, CategoryPayload } from './categories.types';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: CategoryItem | null;
  onSave: (payload: CategoryPayload) => Promise<void>;
}

export function CategoryModal({
  open,
  onOpenChange,
  category,
  onSave,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<'SERVICE' | 'POST' | 'ABOUT'>('POST');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setType(category.type || 'POST');
      setDescription(category.description || '');
      setOrder(category.order || 0);
    } else {
      setName('');
      setSlug('');
      setType('POST');
      setDescription('');
      setOrder(0);
    }
    setError(null);
  }, [category, open]);

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên chuyên mục.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSave({
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        type,
        description: description.trim(),
        order: Number(order) || 0,
        is_active: true,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu chuyên mục');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <DialogHeader>
          <DialogTitle>{category ? 'Cập Nhật Chuyên Mục' : 'Thêm Chuyên Mục Mới'}</DialogTitle>
          <DialogClose onClose={() => onOpenChange(false)} />
        </DialogHeader>

        <DialogContent className="space-y-4 py-4">
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Tên chuyên mục *</label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="VD: Kinh nghiệm chuyển nhà, Dịch vụ giặt đồ..."
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Đường dẫn tĩnh (Slug) *</label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="kinh-nghiem-chuyen-nha"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Loại chuyên mục</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'SERVICE' | 'POST' | 'ABOUT')}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs"
            >
              <option value="POST">Bài viết Blog / Tin tức</option>
              <option value="SERVICE">Dịch vụ chính</option>
              <option value="ABOUT">Giới thiệu / Về chúng tôi</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Mô tả ngắn</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Mô tả tóm tắt nội dung của chuyên mục..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Thứ tự hiển thị</label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
              className="w-24"
            />
          </div>
        </DialogContent>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : 'Lưu Chuyên Mục'}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
