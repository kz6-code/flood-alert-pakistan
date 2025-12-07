export interface FloodLocation {
  name: string;
  province: 'Punjab' | 'KPK' | 'Balochistan';
  latitude: number;
  longitude: number;
}

export interface FloodData {
  location: FloodLocation;
  dates: string[];
  riverDischarge: number[];
  riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
  maxDischarge: number;
  avgDischarge: number;
}

export const PAKISTAN_LOCATIONS: FloodLocation[] = [
  // Punjab
  { name: 'Lahore', province: 'Punjab', latitude: 31.5204, longitude: 74.3587 },
  { name: 'Multan', province: 'Punjab', latitude: 30.1575, longitude: 71.5249 },
  { name: 'Faisalabad', province: 'Punjab', latitude: 31.4504, longitude: 73.1350 },
  { name: 'Bahawalpur', province: 'Punjab', latitude: 29.3956, longitude: 71.6836 },
  // KPK
  { name: 'Peshawar', province: 'KPK', latitude: 34.0151, longitude: 71.5249 },
  { name: 'Swat', province: 'KPK', latitude: 35.2227, longitude: 72.4258 },
  { name: 'Abbottabad', province: 'KPK', latitude: 34.1688, longitude: 73.2215 },
  { name: 'Mardan', province: 'KPK', latitude: 34.1986, longitude: 72.0404 },
  // Balochistan
  { name: 'Quetta', province: 'Balochistan', latitude: 30.1798, longitude: 66.9750 },
  { name: 'Gwadar', province: 'Balochistan', latitude: 25.1264, longitude: 62.3225 },
  { name: 'Sibi', province: 'Balochistan', latitude: 29.5430, longitude: 67.8773 },
  { name: 'Turbat', province: 'Balochistan', latitude: 26.0031, longitude: 63.0544 },
];

function calculateRiskLevel(maxDischarge: number): 'low' | 'moderate' | 'high' | 'extreme' {
  if (maxDischarge < 500) return 'low';
  if (maxDischarge < 1500) return 'moderate';
  if (maxDischarge < 3000) return 'high';
  return 'extreme';
}

export async function fetchFloodData(location: FloodLocation): Promise<FloodData> {
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const url = new URL('https://flood-api.open-meteo.com/v1/flood');
  url.searchParams.append('latitude', location.latitude.toString());
  url.searchParams.append('longitude', location.longitude.toString());
  url.searchParams.append('daily', 'river_discharge_max');
  url.searchParams.append('timezone', 'Asia/Karachi');
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('end_date', endDate);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    const dates = data.daily?.time || [];
    const riverDischarge = data.daily?.river_discharge_max || [];
    
    const validDischarges = riverDischarge.filter((d: number | null) => d !== null && !isNaN(d));
    const maxDischarge = validDischarges.length > 0 ? Math.max(...validDischarges) : 0;
    const avgDischarge = validDischarges.length > 0 
      ? validDischarges.reduce((a: number, b: number) => a + b, 0) / validDischarges.length 
      : 0;

    return {
      location,
      dates,
      riverDischarge: riverDischarge.map((d: number | null) => d ?? 0),
      riskLevel: calculateRiskLevel(maxDischarge),
      maxDischarge,
      avgDischarge,
    };
  } catch (error) {
    console.error(`Error fetching flood data for ${location.name}:`, error);
    // Return mock data if API fails
    return {
      location,
      dates: [],
      riverDischarge: [],
      riskLevel: 'low',
      maxDischarge: 0,
      avgDischarge: 0,
    };
  }
}

export async function fetchAllFloodData(): Promise<FloodData[]> {
  const promises = PAKISTAN_LOCATIONS.map(location => fetchFloodData(location));
  return Promise.all(promises);
}
