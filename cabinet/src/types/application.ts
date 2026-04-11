import type { User } from './user';
import type { GeographicObject } from './geographic-object';

export type ApplicationStatus =
  | 'step_1_geometry_uploaded'
  | 'step_1_1_dkp_regional'
  | 'step_1_2_dkp_coordination'
  | 'step_2_district_hokimlik'
  | 'step_2_public_discussion'
  | 'step_2_1_district_commission'
  | 'step_2_2_regional_commission'
  | 'step_3_regional_hokimlik'
  | 'step_4_kadastr_agency'
  | 'step_5_dkp_central'
  | 'step_6_kadastr_agency_final'
  | 'step_7_regional_hokimlik'
  | 'step_8_district_hokimlik'
  | 'completed'
  | 'rejected';

export interface ApplicationHistoryEntry {
  id: number;
  applicationId: number;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  actionType: string;
  performer: Pick<User, 'id' | 'username' | 'fullName' | 'role'>;
  comment: string | null;
  attachments: string[];
  createdAt: string;
}

export interface Application {
  id: number;
  applicationNumber: string;
  geographicObjects: GeographicObject[];
  currentStatus: ApplicationStatus;
  creator?: Pick<User, 'id' | 'username' | 'fullName' | 'role'>;
  history?: ApplicationHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AvailableAction {
  action: string;
  label: string;
  nextStatus: ApplicationStatus;
}
