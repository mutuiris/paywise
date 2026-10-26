import { apiFetch, buildQuery } from '@/lib/api-client';
import type { Project, Vendor } from '@/types/domain';

export async function listVendors(params: { search?: string } = {}): Promise<Vendor[]> {
  const query = buildQuery({ search: params.search });
  const data = await apiFetch<{ vendors: Vendor[] }>(`/api/vendors/${query}`);
  return data.vendors ?? [];
}

export async function listProjects(params: { search?: string } = {}): Promise<Project[]> {
  const query = buildQuery({ search: params.search });
  const data = await apiFetch<{ projects: Project[] }>(
    `/api/vendors/projects/${query}`,
  );
  return data.projects ?? [];
}
