import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'admin',              // System administrator
  'dkp_filial',         // DKP district branch — step 1
  'dkp_regional',       // DKP regional branch — step 1.1
  'dkp_central',        // DKP central (republic level) — steps 1.2, 5
  'district_commission',// District commission — step 2.1
  'district_hokimlik',  // District administration — steps 2, 8
  'regional_commission',// Regional commission — step 2.2
  'regional_hokimlik',  // Regional administration — steps 3, 7
  'kadastr_agency',     // Cadastre agency — steps 4, 6
  'peoples_council',    // People's council — step 9
]);

// Ariza holatlari — PDF dagi 9 bosqichli workflow
export const applicationStatusEnum = pgEnum('application_status', [
  // 1: DKP filial geometriya yukladi
  'step_1_geometry_uploaded',
  // 1.1: DKP regional branch — approval
  'step_1_1_dkp_regional',
  // 1.2: DKP central (republic) — approval
  'step_1_2_dkp_coordination',
  // 2: Tuman hokimligi (nom berish/o'zgartirish uchun komissiyaga yuboradi)
  'step_2_district_hokimlik',
  // 2.0: Ommaviy muhokama — 10 kun fuqarolar ovoz beradi
  'step_2_public_discussion',
  // 2.1: Tuman komissiya — taklif + xulosa, viloyat komissiyaga
  'step_2_1_district_commission',
  // 2.2: Viloyat komissiya — xulosa, viloyat hokimligiga
  'step_2_2_regional_commission',
  // 3: Viloyat hokimligi — Kadastr agentligiga
  'step_3_regional_hokimlik',
  // 4: Kadastr agentligi — DKP markaziy yoki viloyat hokimligiga qaytarish
  'step_4_kadastr_agency',
  // 5: DKP markaziy apparat — davlat ekspertizasi
  'step_5_dkp_central',
  // 6: Kadastr agentligi — tasdiqlash yoki DKP markaziyga qaytarish
  'step_6_kadastr_agency_final',
  // 7: Viloyat hokimligi — tuman hokimligiga qaror loyihasi
  'step_7_regional_hokimlik',
  // 8: Tuman hokimligi — Kengashga yoki qaytarish
  'step_8_district_hokimlik',
  // 9: Xalq deputatlari Kengashi — E-qaror tizimiga
  'step_9_peoples_council',
  'completed', // Yakunlandi (E-qarorga yuborildi)
  'rejected', // Rad etildi (qaytarilmas)
]);

export const actionTypeEnum = pgEnum('action_type', [
  'submit', // Keyingi bosqichga yuborish
  'approve', // Tasdiqlash
  'reject', // Rad etish
  'return', // Qayta ko'rib chiqish uchun qaytarish
  'attach_document', // Hujjat biriktirish
  'assign_registry_number', // Unikal raqam biriktirish
  'confirm_geometry', // Geometriyani dalolatnoma bilan tasdiqlash
]);

export const documentTypeEnum = pgEnum('document_type', [
  'geometry_file', // GeoJSON fayl (geometriya)
  'attachment',    // Rasm yoki PDF hujjat
]);

export const commissionPositionEnum = pgEnum('commission_position', [
  'hokim',
  'hokim_deputy',
  'economics_head',
  'construction_head',
  'poverty_head',
  'ecology_head',
  'culture_head',
  'spirituality_head',
  'newspaper_head',
  'dkp_head',
  'historian',
  'linguist',
  'geographer',
]);
