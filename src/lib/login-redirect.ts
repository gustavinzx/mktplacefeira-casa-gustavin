import { getHomePathForRole } from '@/lib/profile';

/** Destino após login: `?next=` válido ou home do perfil. */
export function resolvePostLoginPath(
  role?: string | null,
  nextParam?: string | null,
): string {
  if (nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')) {
    return nextParam;
  }
  return getHomePathForRole(role);
}
