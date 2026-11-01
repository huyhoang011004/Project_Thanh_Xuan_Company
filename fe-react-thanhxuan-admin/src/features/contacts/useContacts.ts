import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTenant } from '@/app/TenantContext';
import { contactsService } from './contacts.service';
import { ContactStatus } from './contacts.types';

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
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', tenant] });
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
