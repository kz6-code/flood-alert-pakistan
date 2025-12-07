import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FACILITIES,
  FACILITY_TYPE_LABELS,
  FACILITY_STATUS_LABELS,
  FACILITY_STATUS_COLORS,
  getFacilityStats,
  type Facility,
  type FacilityType,
  type FacilityStatus,
} from '@/lib/facilitiesData';
import { Droplets, CircleDot, Bath, ShowerHead, MapPin, Users, Wrench, Clock } from 'lucide-react';

const FACILITY_ICONS: Record<FacilityType, string> = {
  'water-filtration': '💧',
  'hand-pump': '🚰',
  'latrine': '🚻',
  'shower': '🚿',
};

interface FacilitiesMapProps {
  className?: string;
}

export const FacilitiesMap: React.FC<FacilitiesMapProps> = ({ className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [filterType, setFilterType] = useState<FacilityType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FacilityStatus | 'all'>('all');

  const stats = getFacilityStats();

  const filteredFacilities = FACILITIES.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [69.3451, 30.3753], // Center of Pakistan
      zoom: 5,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
      addMarkers();
    });
  };

  const addMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!map.current) return;

    filteredFacilities.forEach((facility) => {
      const el = document.createElement('div');
      el.className = 'facility-marker';
      el.style.cssText = `
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${FACILITY_STATUS_COLORS[facility.status]};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      `;
      el.innerHTML = FACILITY_ICONS[facility.type];
      el.onmouseenter = () => (el.style.transform = 'scale(1.2)');
      el.onmouseleave = () => (el.style.transform = 'scale(1)');
      el.onclick = () => setSelectedFacility(facility);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (isMapLoaded) {
      addMarkers();
    }
  }, [filterType, filterStatus, isMapLoaded]);

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  const getStatusBadgeVariant = (status: FacilityStatus) => {
    switch (status) {
      case 'operational':
        return 'default';
      case 'needs-repair':
        return 'secondary';
      case 'requested':
        return 'outline';
      default:
        return 'default';
    }
  };

  const FacilityTypeIcon: React.FC<{ type: FacilityType; className?: string }> = ({ type, className }) => {
    switch (type) {
      case 'water-filtration':
        return <Droplets className={className} />;
      case 'hand-pump':
        return <CircleDot className={className} />;
      case 'latrine':
        return <Bath className={className} />;
      case 'shower':
        return <ShowerHead className={className} />;
    }
  };

  return (
    <section className={`py-12 ${className}`}>
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            WASH Facilities Map
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            AFH has installed water filtration systems, hand pumps, latrines, and showers
            across flood-affected areas, providing clean water and sanitation to over 12,000 people.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <MapPin className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Facilities</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 h-6 w-6 rounded-full bg-green-500" />
              <p className="text-2xl font-bold text-foreground">{stats.operational}</p>
              <p className="text-xs text-muted-foreground">Operational</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Wrench className="mx-auto mb-2 h-6 w-6 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">{stats.needsRepair}</p>
              <p className="text-xs text-muted-foreground">Needs Repair</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Clock className="mx-auto mb-2 h-6 w-6 text-blue-500" />
              <p className="text-2xl font-bold text-foreground">{stats.requested}</p>
              <p className="text-xs text-muted-foreground">Requested</p>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur">
            <CardContent className="p-4 text-center">
              <Users className="mx-auto mb-2 h-6 w-6 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.totalBeneficiaries.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Beneficiaries</p>
            </CardContent>
          </Card>
        </div>

        {!isMapLoaded && (
          <Card className="mb-6 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Enter Mapbox Token</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                To view the interactive map, please enter your Mapbox public token.
                You can get one free at{' '}
                <a
                  href="https://mapbox.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  mapbox.com
                </a>
              </p>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={initializeMap} disabled={!mapboxToken}>
                  Load Map
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Filters & Legend */}
          <div className="space-y-4">
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filter by Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterType('all')}
                >
                  All Types
                </Button>
                {(Object.keys(FACILITY_TYPE_LABELS) as FacilityType[]).map((type) => (
                  <Button
                    key={type}
                    variant={filterType === type ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setFilterType(type)}
                  >
                    <FacilityTypeIcon type={type} className="h-4 w-4" />
                    {FACILITY_TYPE_LABELS[type]}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Filter by Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setFilterStatus('all')}
                >
                  All Statuses
                </Button>
                {(Object.keys(FACILITY_STATUS_LABELS) as FacilityStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'ghost'}
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => setFilterStatus(status)}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: FACILITY_STATUS_COLORS[status] }}
                    />
                    {FACILITY_STATUS_LABELS[status]}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span>💧</span>
                  <span className="text-muted-foreground">Water Filtration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚰</span>
                  <span className="text-muted-foreground">Hand Pump</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚻</span>
                  <span className="text-muted-foreground">Latrine</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🚿</span>
                  <span className="text-muted-foreground">Shower</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden bg-card/50 backdrop-blur">
              <div
                ref={mapContainer}
                className="h-[500px] w-full"
                style={{ background: 'hsl(var(--muted))' }}
              >
                {!isMapLoaded && (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Enter your Mapbox token to load the map
                  </div>
                )}
              </div>
            </Card>

            {/* Selected Facility Details */}
            {selectedFacility && (
              <Card className="mt-4 bg-card/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{FACILITY_ICONS[selectedFacility.type]}</span>
                      <div>
                        <CardTitle className="text-lg">{selectedFacility.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {FACILITY_TYPE_LABELS[selectedFacility.type]}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(selectedFacility.status)}
                      style={{
                        backgroundColor:
                          selectedFacility.status === 'operational'
                            ? FACILITY_STATUS_COLORS[selectedFacility.status]
                            : undefined,
                        borderColor: FACILITY_STATUS_COLORS[selectedFacility.status],
                        color:
                          selectedFacility.status !== 'operational'
                            ? FACILITY_STATUS_COLORS[selectedFacility.status]
                            : 'white',
                      }}
                    >
                      {FACILITY_STATUS_LABELS[selectedFacility.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    {selectedFacility.beneficiaries && (
                      <div>
                        <p className="text-xs text-muted-foreground">Beneficiaries</p>
                        <p className="font-semibold text-foreground">
                          {selectedFacility.beneficiaries.toLocaleString()} people
                        </p>
                      </div>
                    )}
                    {selectedFacility.installedDate && (
                      <div>
                        <p className="text-xs text-muted-foreground">Installed</p>
                        <p className="font-semibold text-foreground">
                          {new Date(selectedFacility.installedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Coordinates</p>
                      <p className="font-semibold text-foreground">
                        {selectedFacility.latitude.toFixed(4)}, {selectedFacility.longitude.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  {selectedFacility.description && (
                    <p className="mt-3 text-sm text-muted-foreground">{selectedFacility.description}</p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3"
                    onClick={() => setSelectedFacility(null)}
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
