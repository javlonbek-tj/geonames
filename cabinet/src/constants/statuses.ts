import type { ApplicationStatus } from '@/types';

export const ACTION_LABELS: Record<string, string> = {
  submit:   'Yuborildi',
  approve:  'Tasdiqlandi',
  return:   'Qaytarildi',
  reject:   'Rad etildi',
  attach_document:      'Hujjat biriktirildi',
  assign_registry_number: 'Reyestr raqami biriktirildi',
  confirm_geometry:     'Geometriya tasdiqlandi',
};

export const ACTION_COLORS: Record<string, string> = {
  submit:  'blue',
  approve: 'green',
  return:  'orange',
  reject:  'red',
  attach_document: 'default',
  assign_registry_number: 'purple',
  confirm_geometry: 'cyan',
};

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  step_1_geometry_uploaded:       '1. Geometriya yuklandi',
  step_1_1_dkp_regional:          '1.1 Viloyat DKP kelishishida',
  step_1_2_dkp_coordination:           '1.2 Respublika DKP kelishishida',
  step_2_district_hokimlik:       '2. Tuman hokimligida',
  step_2_public_discussion:       '2.0 Ommaviy muhokamada',
  step_2_1_district_commission:   '2.1 Tuman komissiyasida (xulosa)',
  step_2_2_regional_commission:   '2.2 Viloyat komissiyasida',
  step_3_regional_hokimlik:       '3. Viloyat hokimligida',
  step_4_kadastr_agency:          '4. Kadastr agentligida',
  step_5_dkp_central:             '5. DKP markaziy apparatda',
  step_6_kadastr_agency_final:    '6. Kadastr agentligi (yakuniy)',
  step_7_regional_hokimlik:       '7. Viloyat hokimligi (qaror)',
  step_8_district_hokimlik:       '8. Tuman hokimligi (yakunlash)',
  completed:                      'Yakunlandi',
  rejected:                       'Rad etildi',
};

export const STATUS_HOLDER: Partial<Record<ApplicationStatus, string>> = {
  step_1_geometry_uploaded:     'DKP tuman filiali',
  step_1_1_dkp_regional:        'Viloyat DKP',
  step_1_2_dkp_coordination:    'Respublika DKP',
  step_2_district_hokimlik:     'Tuman hokimligi',
  step_2_public_discussion:     'Fuqarolar (ommaviy muhokama)',
  step_2_1_district_commission: 'Tuman komissiyasi',
  step_2_2_regional_commission: 'Viloyat komissiyasi',
  step_3_regional_hokimlik:     'Viloyat hokimligi',
  step_4_kadastr_agency:        'Kadastr agentligi',
  step_5_dkp_central:           'DKP markaziy apparat',
  step_6_kadastr_agency_final:  'Kadastr agentligi',
  step_7_regional_hokimlik:     'Viloyat hokimligi',
  step_8_district_hokimlik:     'Tuman hokimligi',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  step_1_geometry_uploaded:       'default',
  step_1_1_dkp_regional:          'processing',
  step_1_2_dkp_coordination:           'processing',
  step_2_district_hokimlik:       'processing',
  step_2_public_discussion:       'warning',
  step_2_1_district_commission:   'processing',
  step_2_2_regional_commission:   'processing',
  step_3_regional_hokimlik:       'processing',
  step_4_kadastr_agency:          'processing',
  step_5_dkp_central:             'processing',
  step_6_kadastr_agency_final:    'processing',
  step_7_regional_hokimlik:       'processing',
  step_8_district_hokimlik:       'processing',
  completed:                      'success',
  rejected:                       'error',
};
