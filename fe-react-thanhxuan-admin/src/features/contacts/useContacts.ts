import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTenant } from '@/app/TenantContext';
import { contactsService } from './contacts.service';
import { ContactStatus } from './contacts.types';
import { getErrorMessage } from '@/lib/api-client';

export function useContacts(search?: string, status?: string) {
  const queryClient = useQueryClient();
  const { tenant } = useTenant();

  const queryKey = ['contacts', tenant, search, status];

  const query = useQuery({
    queryKey,
    queryFn: () => contactsService.getList({ search, status }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: ContactStatus; note?: string }) =>
      contactsService.updateStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenant] });
      toast.success('Cập nhật trạng thái liên hệ thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi cập nhật liên hệ: ${getErrorMessage(err)}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenant] });
      toast.success('Đã xóa liên hệ thành công!');
    },
    onError: (err: unknown) => {
      toast.error(`Lỗi xóa liên hệ: ${getErrorMessage(err)}`);
    },
  });

  return {
    contacts: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    deleteContact: deleteMutation.mutateAsync,
  };
}
