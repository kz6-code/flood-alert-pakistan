import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FloodData } from '@/lib/floodApi';
import { Flame, Loader2 } from 'lucide-react';

interface FloodHeatmapProps {
  floodData: FloodData[];
  isLoading: boolean;
  className?: string;
}

const RISK_COLORS = {
  low: '#22c55e',
  moderate: '#eab308',
  high: '#f97316',
  extreme: '#ef4444',
};

export const FloodHeatmap: React.FC<FloodHeatmapProps> = ({ floodData, isLoading, className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [69.3451, 30.3753],
      zoom: 5,
      pitch: 0,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);
      addHeatmapLayer();
    });
  };

  const getRiskWeight = (riskLevel: string): number => {
    switch (riskLevel) {
      case 'extreme': return 1;
      case 'high': return 0.75;
      case 'moderate': return 0.5;
      case 'low': return 0.25;
      default: return 0.1;
    }
  };

  const addHeatmapLayer = () => {
    if (!map.current || floodData.length === 0) return;

    // Remove existing layers and sources if they exist
    if (map.current.getLayer('flood-heat')) {
      map.current.removeLayer('flood-heat');
    }
    if (map.current.getLayer('flood-points')) {
      map.current.removeLayer('flood-points');
    }
    if (map.current.getSource('flood-data')) {
      map.current.removeSource('flood-data');
    }

    // Create GeoJSON from flood data
    const geojsonData: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: floodData.map((data) => ({
        type: 'Feature',
        properties: {
          name: data.location.name,
          province: data.location.province,
          riskLevel: data.riskLevel,
          maxDischarge: data.maxDischarge,
          avgDischarge: data.avgDischarge,
          weight: getRiskWeight(data.riskLevel),
        },
        geometry: {
          type: 'Point',
          coordinates: [data.location.longitude, data.location.latitude],
        },
      })),
    };

    // Add source
    map.current.addSource('flood-data', {
      type: 'geojson',
      data: geojsonData,
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'flood-heat',
      type: 'heatmap',
      source: 'flood-data',
      maxzoom: 9,
      paint: {
        // Increase weight based on risk level
        'heatmap-weight': ['get', 'weight'],
        // Increase intensity as zoom level increases
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 1,
          9, 3,
        ],
        // Color ramp for heatmap
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 0, 0)',
          0.2, 'rgba(34, 197, 94, 0.6)',  // green - low
          0.4, 'rgba(234, 179, 8, 0.7)',   // yellow - moderate
          0.6, 'rgba(249, 115, 22, 0.8)',  // orange - high
          0.8, 'rgba(239, 68, 68, 0.9)',   // red - extreme
          1, 'rgba(185, 28, 28, 1)',       // dark red - critical
        ],
        // Radius increases with zoom
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, 50,
          5, 80,
          9, 100,
        ],
        // Opacity decreases at higher zoom
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 1,
          9, 0.5,
        ],
      },
    });

    // Add point layer for detailed view at higher zoom
    map.current.addLayer({
      id: 'flood-points',
      type: 'circle',
      source: 'flood-data',
      minzoom: 7,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7, 8,
          12, 20,
        ],
        'circle-color': [
          'match',
          ['get', 'riskLevel'],
          'low', RISK_COLORS.low,
          'moderate', RISK_COLORS.moderate,
          'high', RISK_COLORS.high,
          'extreme', RISK_COLORS.extreme,
          '#888',
        ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 2,
        'circle-opacity': 0.8,
      },
    });

    // Add popups on click
    map.current.on('click', 'flood-points', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
      const { name, province, riskLevel, maxDischarge, avgDischarge } = feature.properties as {
        name: string;
        province: string;
        riskLevel: string;
        maxDischarge: number;
        avgDischarge: number;
      };

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div style="padding: 8px; color: #1a1a2e;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${province}</p>
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <span style="
                padding: 2px 8px; 
                border-radius: 12px; 
                font-size: 11px; 
                font-weight: 600;
                color: white;
                background: ${RISK_COLORS[riskLevel as keyof typeof RISK_COLORS]};
              ">${riskLevel.toUpperCase()}</span>
            </div>
            <p style="font-size: 12px; margin-top: 6px;">
              Peak: <strong>${maxDischarge.toFixed(0)} m³/s</strong>
            </p>
            <p style="font-size: 12px;">
              Avg: <strong>${avgDischarge.toFixed(0)} m³/s</strong>
            </p>
          </div>
        `)
        .addTo(map.current!);
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'flood-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer';
    });
    map.current.on('mouseleave', 'flood-points', () => {
      if (map.current) map.current.getCanvas().style.cursor = '';
    });
  };

  // Update heatmap when flood data changes
  useEffect(() => {
    if (isMapLoaded && floodData.length > 0) {
      addHeatmapLayer();
    }
  }, [floodData, isMapLoaded]);

  useEffect(() => {
    return () => {
      map.current?.remove();
    };
  }, []);

  const riskSummary = floodData.reduce(
    (acc, data) => {
      acc[data.riskLevel] = (acc[data.riskLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <section className={`py-12 ${className}`}>
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            <Flame className="mr-2 inline-block h-8 w-8 text-risk-high" />
            Flood Risk Heatmap
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Real-time visualization of flood risk levels across Pakistan based on river discharge data.
            Warmer colors indicate higher flood risk.
          </p>
        </div>

        {/* Risk Summary */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading flood data...
            </div>
          ) : (
            <>
              <Badge className="bg-risk-low text-white">
                Low: {riskSummary.low || 0}
              </Badge>
              <Badge className="bg-risk-moderate text-foreground">
                Moderate: {riskSummary.moderate || 0}
              </Badge>
              <Badge className="bg-risk-high text-white">
                High: {riskSummary.high || 0}
              </Badge>
              <Badge className="bg-risk-extreme text-white">
                Extreme: {riskSummary.extreme || 0}
              </Badge>
            </>
          )}
        </div>

        {!isMapLoaded && (
          <Card className="mb-6 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg">Enter Mapbox Token</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                To view the flood risk heatmap, please enter your Mapbox public token.
                Get one free at{' '}
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
                  Load Heatmap
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="overflow-hidden bg-card/50 backdrop-blur">
          <div
            ref={mapContainer}
            className="h-[500px] w-full"
            style={{ background: 'hsl(var(--muted))' }}
          >
            {!isMapLoaded && (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Enter your Mapbox token to load the heatmap
              </div>
            )}
          </div>
        </Card>

        {/* Heatmap Legend */}
        <Card className="mt-4 bg-card/50 backdrop-blur">
          <CardContent className="py-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <span className="text-sm font-medium text-foreground">Risk Intensity:</span>
              <div className="flex items-center gap-1">
                <div
                  className="h-4 w-32 rounded"
                  style={{
                    background: `linear-gradient(to right, ${RISK_COLORS.low}, ${RISK_COLORS.moderate}, ${RISK_COLORS.high}, ${RISK_COLORS.extreme})`,
                  }}
                />
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Extreme</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
