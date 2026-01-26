import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

export function useAdmin() {
    const queryClient = useQueryClient();

    const holidaysQuery = useQuery({
        queryKey: ['holidays'],
        queryFn: adminService.getHolidays,
    });

    const addHolidayMutation = useMutation({
        mutationFn: adminService.addHoliday,
        onSuccess: () => {
            toast.success('Holiday added');
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
        },
        onError: () => toast.error('Failed to add holiday')
    });

    const deleteHolidayMutation = useMutation({
        mutationFn: adminService.deleteHoliday,
        onSuccess: () => {
            toast.success('Holiday deleted');
            queryClient.invalidateQueries({ queryKey: ['holidays'] });
        },
        onError: () => toast.error('Failed to delete holiday')
    });

    return {
        holidays: holidaysQuery.data || [],
        isLoadingHolidays: holidaysQuery.isLoading,
        addHoliday: addHolidayMutation.mutateAsync,
        deleteHoliday: deleteHolidayMutation.mutateAsync,
    };
}
