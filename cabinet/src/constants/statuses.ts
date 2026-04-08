import type { ApplicationStatus } from '@/types';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  step_1_geometry_uploaded:       '1. Geometriya yuklandi',
  step_1_1_district_commission:   '1.1 Tuman komissiyasida',
  step_1_2_dkp_filial_proposal:   '1.2 DKP filial taklif tayyorlamoqda',
  step_2_district_hokimlik:       '2. Tuman hokimligida',
  step_2_1_district_commission:   '2.1 Tuman komissiyasida (xulosa)',
  step_2_2_regional_commission:   '2.2 Viloyat komissiyasida',
  step_3_regional_hokimlik:       '3. Viloyat hokimligida',
  step_4_kadastr_agency:          '4. Kadastr agentligida',
  step_5_dkp_central:             '5. DKP markaziy apparatda',
  step_6_kadastr_agency_final:    '6. Kadastr agentligi (yakuniy)',
  step_7_regional_hokimlik:       '7. Viloyat hokimligi (qaror)',
  step_8_district_hokimlik:       '8. Tuman hokimligi (muhokama)',
  step_9_peoples_council:         '9. Xalq deputatlari Kengashida',
  completed:                      'Yakunlandi',
  rejected:                       'Rad etildi',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  step_1_geometry_uploaded:       'default',
  step_1_1_district_commission:   'processing',
  step_1_2_dkp_filial_proposal:   'warning',
  step_2_district_hokimlik:       'processing',
  step_2_1_district_commission:   'processing',
  step_2_2_regional_commission:   'processing',
  step_3_regional_hokimlik:       'processing',
  step_4_kadastr_agency:          'processing',
  step_5_dkp_central:             'processing',
  step_6_kadastr_agency_final:    'processing',
  step_7_regional_hokimlik:       'processing',
  step_8_district_hokimlik:       'processing',
  step_9_peoples_council:         'processing',
  completed:                      'success',
  rejected:                       'error',
};
