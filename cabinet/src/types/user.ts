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
;

export const ROLES = {
  ADMIN:               'admin',
  DKP_FILIAL:          'dkp_filial',
  DKP_REGIONAL:        'dkp_regional',
  DKP_CENTRAL:         'dkp_central',
  DISTRICT_COMMISSION: 'district_commission',
  DISTRICT_HOKIMLIK:   'district_hokimlik',
  REGIONAL_COMMISSION: 'regional_commission',
  REGIONAL_HOKIMLIK:   'regional_hokimlik',
  KADASTR_AGENCY:      'kadastr_agency',
} as const satisfies Record<string, UserRole>;

export type CommissionPosition =
  | 'hokim' | 'hokim_deputy' | 'economics_head' | 'construction_head'
  | 'poverty_head' | 'ecology_head' | 'culture_head' | 'spirituality_head'
  | 'newspaper_head' | 'dkp_head' | 'historian' | 'linguist' | 'geographer';

export const COMMISSION_POSITION_LABELS: Record<CommissionPosition, string> = {
  hokim: 'Hokim',
  hokim_deputy: "Hokim o'rinbosari",
  economics_head: 'Iqtisodiyot va moliya boshlig\'i',
  construction_head: 'Qurilish uy-joy kommunal boshlig\'i',
  poverty_head: 'Kambag\'allikni qisqartirish va bandlik boshlig\'i',
  ecology_head: 'Ekologiya boshlig\'i',
  culture_head: 'Madaniyat boshlig\'i',
  spirituality_head: 'Ma\'naviyat va ma\'rifat boshlig\'i',
  newspaper_head: 'Tuman gazeta boshlig\'i',
  dkp_head: 'DKP boshlig\'i',
  historian: 'Tarixchi',
  linguist: 'Tilshunos-toponimist',
  geographer: 'Geograf',
};

export interface User {
  id: number;
  username: string;
  fullName: string | null;
  role: UserRole;
  position: CommissionPosition | null;
  regionId: number | null;
  districtId: number | null;
  isActive: boolean;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}
