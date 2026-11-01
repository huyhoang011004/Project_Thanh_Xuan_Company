import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenant } from '@/app/TenantContext';
import { articlesService } from './articles.service';
import { ArticlePayload } from './articles.types';
import { getErrorMessage } from '@/lib/api-client';

export function useArticles(search?: string, categoryId?: string) {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  const queryKey = ['articles', tenant, search, categoryId];

  const query = useQuery({
    queryKey,
    queryFn: () => articlesService.getList({ search, categoryId }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: ArticlePayload) => articlesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', tenant] });
      toast.success('Tạo bài viết thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi tạo bài viết: ${getErrorMessage(err)}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ArticlePayload> }) =>
      articlesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', tenant] });
      toast.success('Cập nhật bài viết thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi cập nhật: ${getErrorMessage(err)}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => articlesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', tenant] });
      toast.success('Đã xóa bài viết thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi xóa bài viết: ${getErrorMessage(err)}`);
    },
  });

  return {
    articles: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createArticle: createMutation.mutateAsync,
    updateArticle: updateMutation.mutateAsync,
    deleteArticle: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
