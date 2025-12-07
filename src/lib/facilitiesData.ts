export type FacilityType = 'water-filtration' | 'hand-pump' | 'latrine' | 'shower';
export type FacilityStatus = 'operational' | 'needs-repair' | 'requested';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  status: FacilityStatus;
  latitude: number;
  longitude: number;
  beneficiaries?: number;
  installedDate?: string;
  description?: string;
}

export const FACILITY_TYPE_LABELS: Record<FacilityType, string> = {
  'water-filtration': 'Water Filtration System',
  'hand-pump': 'Hand Pump Well',
  'latrine': 'Latrine',
  'shower': 'Shower Facility',
};

export const FACILITY_STATUS_LABELS: Record<FacilityStatus, string> = {
  'operational': 'Operational',
  'needs-repair': 'Needs Repair',
  'requested': 'Requested',
};

export const FACILITY_STATUS_COLORS: Record<FacilityStatus, string> = {
  'operational': '#22c55e',
  'needs-repair': '#f59e0b',
  'requested': '#3b82f6',
};

// Sample facility data across Punjab, KPK, and Balochistan
export const FACILITIES: Facility[] = [
  // Punjab
  {
    id: 'wf-001',
    name: 'Lahore Central Water Station',
    type: 'water-filtration',
    status: 'operational',
    latitude: 31.5204,
    longitude: 74.3587,
    beneficiaries: 2500,
    installedDate: '2022-10-15',
    description: 'Main water filtration system serving displaced families',
  },
  {
    id: 'hp-001',
    name: 'Faisalabad Hand Pump',
    type: 'hand-pump',
    status: 'operational',
    latitude: 31.4504,
    longitude: 73.135,
    beneficiaries: 800,
    installedDate: '2022-11-02',
  },
  {
    id: 'lt-001',
    name: 'Multan Camp Latrines',
    type: 'latrine',
    status: 'needs-repair',
    latitude: 30.1575,
    longitude: 71.5249,
    beneficiaries: 1200,
    installedDate: '2022-09-28',
    description: 'Sanitation block requiring maintenance',
  },
  {
    id: 'sh-001',
    name: 'Bahawalpur Shower Block',
    type: 'shower',
    status: 'operational',
    latitude: 29.3956,
    longitude: 71.6836,
    beneficiaries: 600,
    installedDate: '2022-12-10',
  },
  // KPK
  {
    id: 'wf-002',
    name: 'Peshawar Water Station',
    type: 'water-filtration',
    status: 'operational',
    latitude: 34.0151,
    longitude: 71.5249,
    beneficiaries: 3000,
    installedDate: '2022-09-15',
    description: 'Large-scale water treatment facility',
  },
  {
    id: 'hp-002',
    name: 'Mardan Community Well',
    type: 'hand-pump',
    status: 'needs-repair',
    latitude: 34.1986,
    longitude: 72.0404,
    beneficiaries: 500,
    installedDate: '2022-10-20',
  },
  {
    id: 'lt-002',
    name: 'Swat Valley Sanitation',
    type: 'latrine',
    status: 'operational',
    latitude: 35.2227,
    longitude: 72.4258,
    beneficiaries: 900,
    installedDate: '2022-11-15',
  },
  {
    id: 'sh-002',
    name: 'Abbottabad Hygiene Center',
    type: 'shower',
    status: 'requested',
    latitude: 34.1688,
    longitude: 73.2215,
    description: 'Proposed shower facility for IDP camp',
  },
  // Balochistan
  {
    id: 'wf-003',
    name: 'Quetta Water Filtration',
    type: 'water-filtration',
    status: 'operational',
    latitude: 30.1798,
    longitude: 66.975,
    beneficiaries: 1800,
    installedDate: '2022-10-30',
  },
  {
    id: 'hp-003',
    name: 'Sibi Hand Pump',
    type: 'hand-pump',
    status: 'requested',
    latitude: 29.543,
    longitude: 67.8773,
    description: 'Community request for water access point',
  },
  {
    id: 'lt-003',
    name: 'Turbat Camp Facilities',
    type: 'latrine',
    status: 'operational',
    latitude: 26.0031,
    longitude: 63.0544,
    beneficiaries: 700,
    installedDate: '2022-12-01',
  },
  {
    id: 'sh-003',
    name: 'Gwadar Shower Unit',
    type: 'shower',
    status: 'needs-repair',
    latitude: 25.1264,
    longitude: 62.3225,
    beneficiaries: 400,
    installedDate: '2022-11-25',
    description: 'Requires plumbing repairs',
  },
];

export const getFacilitiesByType = (type: FacilityType): Facility[] => {
  return FACILITIES.filter((f) => f.type === type);
};

export const getFacilitiesByStatus = (status: FacilityStatus): Facility[] => {
  return FACILITIES.filter((f) => f.status === status);
};

export const getFacilityStats = () => {
  return {
    total: FACILITIES.length,
    operational: FACILITIES.filter((f) => f.status === 'operational').length,
    needsRepair: FACILITIES.filter((f) => f.status === 'needs-repair').length,
    requested: FACILITIES.filter((f) => f.status === 'requested').length,
    totalBeneficiaries: FACILITIES.reduce((sum, f) => sum + (f.beneficiaries || 0), 0),
  };
};
