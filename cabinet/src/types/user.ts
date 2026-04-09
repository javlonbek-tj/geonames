export type UserRole =
  | 'admin'
  | 'dkp_filial'
  | 'dkp_regional'
  | 'district_commission'
  | 'district_hokimlik'
  | 'regional_commission'
  | 'regional_hokimlik'
  | 'kadastr_agency'
  | 'dkp_central'
  | 'peoples_council';

export interface User {
  id: number;
  username: string;
  fullName: string | null;
  role: UserRole;
  regionId: number | null;
  districtId: number | null;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}
