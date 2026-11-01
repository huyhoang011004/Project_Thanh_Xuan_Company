import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenant } from '@/app/TenantContext';
import { categoriesService } from './categories.service';
import { CategoryPayload } from './categories.types';
import { getErrorMessage } from '@/lib/api-client';

export function useCategories(typeFilter?: string) {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  const queryKey = ['categories', tenant, typeFilter];

  const query = useQuery({
    queryKey,
    queryFn: () => categoriesService.getList(typeFilter),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryPayload) => categoriesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenant] });
      toast.success('Tạo chuyên mục mới thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi tạo chuyên mục: ${getErrorMessage(err)}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CategoryPayload> }) =>
      categoriesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenant] });
      toast.success('Cập nhật chuyên mục thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi cập nhật chuyên mục: ${getErrorMessage(err)}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenant] });
      toast.success('Đã xóa chuyên mục thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi xóa chuyên mục: ${getErrorMessage(err)}`);
    },
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    createCategory: createMutation.mutateAsync,
    updateCategory: updateMutation.mutateAsync,
    deleteCategory: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
