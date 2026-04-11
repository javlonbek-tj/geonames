import api from './axios';

export interface NonCompliantItem {
  id: number;
  applicationId: number;
  applicationNumber: string;
  geoObjectId: number;
  nameUz: string;
  objectType: string;
  regionName: string | null;
  districtName: string | null;
  comment: string | null;
  markedBy: string;
  createdAt: string;
}

export async function toggleGeoFlag(
  applicationId: number,
  geoObjectId: number,
  comment?: string,
): Promise<{ flagged: boolean }> {
  const res = await api.post(
    `/geo-flags/applications/${applicationId}/geo-objects/${geoObjectId}/flag`,
    { comment },
  );
  return res.data.data;
}

export async function getApplicationFlags(
  applicationId: number,
): Promise<{ geoObjectId: number; comment: string | null; createdAt: string }[]> {
  const res = await api.get(`/geo-flags/applications/${applicationId}/flags`);
  return res.data.data;
}

export async function listNonCompliant(): Promise<NonCompliantItem[]> {
  const res = await api.get('/geo-flags/non-compliant');
  return res.data.data;
}
