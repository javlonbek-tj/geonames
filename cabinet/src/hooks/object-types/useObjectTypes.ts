import { useQuery } from '@tanstack/react-query';
import { objectTypesApi } from '@/api/object-types.api';

export function useObjectCategories() {
  return useQuery({
    queryKey: ['object-categories'],
    queryFn: () => objectTypesApi.getCategories().then((r) => r.data.data),
    staleTime: Infinity,
  });
}

export function useObjectTypes(categoryId?: number) {
  return useQuery({
    queryKey: ['object-types', categoryId],
    queryFn: () => objectTypesApi.getTypes(categoryId).then((r) => r.data.data),
    // categoryId berilmasa barcha turlar yuklanadi (detail sahifasida kerak)
    staleTime: Infinity,
  });
}
