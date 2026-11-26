import { useQuery } from '@tanstack/react-query';
import { parentApi } from '../api';

export const parentQueryKeys = {
  children: ['parent', 'children'] as const,
  overview: (childId: string) => ['parent', 'overview', childId] as const,
  menu: (childId?: string) => ['parent', 'menu', childId] as const,
  payments: (childId: string) => ['parent', 'payments', childId] as const,
};

export function useParentChildren() {
  return useQuery({
    queryKey: parentQueryKeys.children,
    queryFn: parentApi.getChildren,
  });
}

export function useChildOverview(childId?: string) {
  return useQuery({
    queryKey: parentQueryKeys.overview(childId || ''),
    queryFn: () => parentApi.getChildOverview(childId!),
    enabled: Boolean(childId),
  });
}

export function useParentMenu(childId?: string) {
  return useQuery({
    queryKey: parentQueryKeys.menu(childId),
    queryFn: () => parentApi.getMenu(childId),
    enabled: Boolean(childId),
  });
}

export function useChildPayments(childId?: string) {
  return useQuery({
    queryKey: parentQueryKeys.payments(childId || ''),
    queryFn: () => parentApi.getPayments(childId!),
    enabled: Boolean(childId),
  });
}
