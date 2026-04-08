import type { UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin:               'Administrator',
  dkp_filial:          'DKP filial xodimi',
  district_commission: 'Tuman komissiyasi',
  district_hokimlik:   'Tuman hokimligi',
  regional_commission: 'Viloyat komissiyasi',
  regional_hokimlik:   'Viloyat hokimligi',
  kadastr_agency:      'Kadastr agentligi',
  dkp_central:         'DKP markaziy apparat',
  peoples_council:     'Xalq deputatlari Kengashi',
};
