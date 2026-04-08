import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'admin',               // Tizim administratori
  'dkp_filial',          // DKP filial xodimi (tuman darajasi) — 1, 1.2-qadam
  'district_commission', // Hududiy tuman/shahar komissiya — 1.1, 2.1-qadam
  'district_hokimlik',   // Tuman/shahar hokimligi — 2, 8-qadam
  'regional_commission', // Hududiy viloyat komissiya — 2.2-qadam
  'regional_hokimlik',   // Viloyat hokimligi — 3, 7-qadam
  'kadastr_agency',      // Kadastr agentligi markaziy apparat — 4, 6-qadam
  'dkp_central',         // DKP markaziy apparat — 5-qadam
  'peoples_council',     // Xalq deputatlari Kengashi — 9-qadam
]);

// Ariza holatlari — PDF dagi 9 bosqichli workflow
export const applicationStatusEnum = pgEnum('application_status', [
  // 1: DKP filial geometriya yukladi
  'step_1_geometry_uploaded',
  // 1.1: Reestrdа mavjud → tuman komissiya (unikal raqam + dalolatnoma)
  'step_1_1_district_commission',
  // 1.2: Reestrdа yo'q → DKP filial taklif tayyorlamoqda
  'step_1_2_dkp_filial_proposal',
  // 2: Tuman hokimligi (nom berish/o'zgartirish uchun komissiyaga yuboradi)
  'step_2_district_hokimlik',
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
  'rejected',  // Rad etildi (qaytarilmas)
]);

export const actionTypeEnum = pgEnum('action_type', [
  'submit',             // Keyingi bosqichga yuborish
  'approve',            // Tasdiqlash
  'reject',             // Rad etish
  'return',             // Qayta ko'rib chiqish uchun qaytarish
  'attach_document',    // Hujjat biriktirish
  'assign_registry_number', // Unikal raqam biriktirish
  'confirm_geometry',   // Geometriyani dalolatnoma bilan tasdiqlash
]);

export const documentTypeEnum = pgEnum('document_type', [
  'geometry_file', // GeoJSON fayl (geometriya)
]);
