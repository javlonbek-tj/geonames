// 9 bosqichli workflow tranzitsiya xaritasi
// Har bir holat uchun: qaysi harakat, kim bajara oladi, keyingi holat

type ActionType =
  | 'submit'
  | 'approve'
  | 'return'
  | 'confirm_geometry';

type Transition = {
  allowedRole: string;
  nextStatus: string; // '' = service tomonidan dinamik aniqlanadi
  actionType: ActionType;
  label: string;
};

type TransitionMap = Record<string, Record<string, Transition>>;

export const WORKFLOW: TransitionMap = {

  // BOSQICH 1: DKP Filial — GeoJSON yuklaydi → Viloyat DKP kelishishiga
  step_1_geometry_uploaded: {
    submit: {
      allowedRole: 'dkp_filial',
      nextStatus: 'step_1_1_dkp_regional',
      actionType: 'submit',
      label: "GeoJSON yuklandi, Viloyat DKP kelishishiga yuborish",
    },
  },

  // STEP 1.1: DKP regional — reviews → DKP central
  step_1_1_dkp_regional: {
    submit: {
      allowedRole: 'dkp_regional',
      nextStatus: 'step_1_2_dkp_coordination',
      actionType: 'submit',
      label: "Ko'rib chiqildi, Respublika DKP kelishishiga yuborish",
    },
    return: {
      allowedRole: 'dkp_regional',
      nextStatus: 'step_1_geometry_uploaded',
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun DKP filialga qaytarish",
    },
  },

  // STEP 1.2: DKP central — approves → district administration
  step_1_2_dkp_coordination: {
    submit: {
      allowedRole: 'dkp_central',
      nextStatus: 'step_2_district_hokimlik',
      actionType: 'submit',
      label: "Kelishildi, tuman hokimligiga yuborish",
    },
    return: {
      allowedRole: 'dkp_central',
      nextStatus: 'step_1_1_dkp_regional',
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun Viloyat DKP ga qaytarish",
    },
  },

  // BOSQICH 2: Tuman hokimligi — nom beradi, ommaviy muhokamaga yuboradi
  step_2_district_hokimlik: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: 'step_2_public_discussion',
      actionType: 'submit',
      label: 'Nom berildi, ommaviy muhokamaga yuborish (10 kun)',
    },
  },

  // BOSQICH 2.0: Ommaviy muhokama — tuman hokimligi muhokama tugagach komissiyaga yuboradi
  step_2_public_discussion: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: 'step_2_1_district_commission',
      actionType: 'submit',
      label: 'Ommaviy muhokama tugadi, tuman komissiyasiga yuborish',
    },
  },

  // BOSQICH 2.1: Tuman komissiya a'zolari kelishadi (alohida /commission endpoint)
  // Barcha a'zolar kelishgandan keyin tuman hokimligi viloyat komissiyasiga yuboradi
  step_2_1_district_commission: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: 'step_2_2_regional_commission',
      actionType: 'submit',
      label: 'Tuman komissiyasi kelishdi, viloyat komissiyasiga yuborish',
    },
  },

  // BOSQICH 2.2: Viloyat komissiya — xulosa → viloyat hokimligiga
  step_2_2_regional_commission: {
    submit: {
      allowedRole: 'regional_commission',
      nextStatus: 'step_3_regional_hokimlik',
      actionType: 'submit',
      label: "Viloyat komissiya xulosasi kiritildi, viloyat hokimligiga yuborish",
    },
  },

  // BOSQICH 3: Viloyat hokimligi → Kadastr agentligiga
  step_3_regional_hokimlik: {
    submit: {
      allowedRole: 'regional_hokimlik',
      nextStatus: 'step_4_kadastr_agency',
      actionType: 'submit',
      label: 'Kadastr agentligiga davlat ekspertizasi uchun yuborish',
    },
  },

  // BOSQICH 4: Kadastr agentligi → DKP markaziy yoki viloyat hokimligiga qaytarish
  step_4_kadastr_agency: {
    approve: {
      allowedRole: 'kadastr_agency',
      nextStatus: 'step_5_dkp_central',
      actionType: 'approve',
      label: "DKP markaziy apparatga davlat ekspertizasi uchun yuborish",
    },
    return: {
      allowedRole: 'kadastr_agency',
      nextStatus: 'step_3_regional_hokimlik',
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun viloyat hokimligiga qaytarish",
    },
  },

  // BOSQICH 5: DKP markaziy → Kadastr agentligiga
  step_5_dkp_central: {
    submit: {
      allowedRole: 'dkp_central',
      nextStatus: 'step_6_kadastr_agency_final',
      actionType: 'submit',
      label: 'Davlat ekspertizasi xulosasi kiritildi, Kadastr agentligiga yuborish',
    },
  },

  // BOSQICH 6: Kadastr agentligi yakuniy → tasdiqlash yoki DKP markaziyga qaytarish
  step_6_kadastr_agency_final: {
    approve: {
      allowedRole: 'kadastr_agency',
      nextStatus: 'step_7_regional_hokimlik',
      actionType: 'approve',
      label: 'Tasdiqlandi, viloyat hokimligiga rasmiy xat bilan yuborish',
    },
    return: {
      allowedRole: 'kadastr_agency',
      nextStatus: 'step_5_dkp_central',
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun DKP markaziy apparatga qaytarish",
    },
  },

  // BOSQICH 7: Viloyat hokimligi — qaror loyihasi → tuman hokimligiga
  step_7_regional_hokimlik: {
    submit: {
      allowedRole: 'regional_hokimlik',
      nextStatus: 'step_8_district_hokimlik',
      actionType: 'submit',
      label: "Tuman hokimligiga muhokama uchun yuborish",
    },
  },

  // BOSQICH 8: Tuman hokimligi — Kengash qarori PDFini yuklaydi va yakunlaydi
  step_8_district_hokimlik: {
    approve: {
      allowedRole: 'district_hokimlik',
      nextStatus: 'completed',
      actionType: 'approve',
      label: "Yakunlash",
    },
    return: {
      allowedRole: 'district_hokimlik',
      nextStatus: 'step_2_1_district_commission',
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun tuman komissiyasiga qaytarish",
    },
  },
};

export function getAvailableActions(status: string): Record<string, Transition> {
  return WORKFLOW[status] ?? {};
}

export function resolveTransition(
  status: string,
  action: string,
  userRole: string,
): Transition {
  const transitions = WORKFLOW[status];
  if (!transitions) {
    throw new Error(`"${status}" holati uchun harakat mavjud emas`);
  }
  const transition = transitions[action];
  if (!transition) {
    throw new Error(`"${status}" holatida "${action}" harakati mavjud emas`);
  }
  if (transition.allowedRole !== userRole) {
    throw new Error(`Bu harakatni bajarish uchun ruxsat yo'q`);
  }
  return transition;
}
