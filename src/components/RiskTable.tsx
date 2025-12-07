import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FloodData } from '@/lib/floodApi';
import { MapPin, AlertCircle, TrendingUp, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RiskTableProps {
  floodData: FloodData[];
  isLoading: boolean;
}

function RiskBadge({ level }: { level: 'low' | 'moderate' | 'high' | 'extreme' }) {
  const config = {
    low: { label: 'Low', className: 'bg-risk-low/20 text-risk-low border-risk-low/30' },
    moderate: { label: 'Moderate', className: 'bg-risk-moderate/20 text-risk-moderate border-risk-moderate/30' },
    high: { label: 'High', className: 'bg-risk-high/20 text-risk-high border-risk-high/30' },
    extreme: { label: 'Extreme', className: 'bg-risk-extreme/20 text-risk-extreme border-risk-extreme/30' },
  };

  return (
    <Badge variant="outline" className={cn('font-medium', config[level].className)}>
      {config[level].label}
    </Badge>
  );
}

function ProvinceTable({ data, isLoading }: { data: FloodData[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="text-muted-foreground">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              City
            </div>
          </TableHead>
          <TableHead className="text-muted-foreground">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Risk Level
            </div>
          </TableHead>
          <TableHead className="text-right text-muted-foreground">
            <div className="flex items-center justify-end gap-2">
              <TrendingUp className="h-4 w-4" />
              Peak (m³/s)
            </div>
          </TableHead>
          <TableHead className="text-right text-muted-foreground">
            <div className="flex items-center justify-end gap-2">
              <Droplets className="h-4 w-4" />
              Average (m³/s)
            </div>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.location.name} className="border-border transition-colors hover:bg-secondary/30">
            <TableCell className="font-medium">{item.location.name}</TableCell>
            <TableCell>
              <RiskBadge level={item.riskLevel} />
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {item.maxDischarge.toFixed(1)}
            </TableCell>
            <TableCell className="text-right font-mono text-sm">
              {item.avgDischarge.toFixed(1)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function RiskTable({ floodData, isLoading }: RiskTableProps) {
  const punjabData = floodData.filter(d => d.location.province === 'Punjab');
  const kpkData = floodData.filter(d => d.location.province === 'KPK');
  const balochistanData = floodData.filter(d => d.location.province === 'Balochistan');

  const getProvinceRiskSummary = (data: FloodData[]) => {
    if (data.length === 0) return { high: 0, moderate: 0, low: 0 };
    return {
      high: data.filter(d => d.riskLevel === 'high' || d.riskLevel === 'extreme').length,
      moderate: data.filter(d => d.riskLevel === 'moderate').length,
      low: data.filter(d => d.riskLevel === 'low').length,
    };
  };

  return (
    <Card className="card-gradient border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Regional Flood Risk Assessment
        </CardTitle>
        <CardDescription>
          30-day flood risk forecast by province based on river discharge predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="punjab" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 bg-secondary/50">
            <TabsTrigger value="punjab" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Punjab
              {!isLoading && getProvinceRiskSummary(punjabData).high > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-risk-high/20 text-xs text-risk-high">
                  {getProvinceRiskSummary(punjabData).high}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="kpk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              KPK
              {!isLoading && getProvinceRiskSummary(kpkData).high > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-risk-high/20 text-xs text-risk-high">
                  {getProvinceRiskSummary(kpkData).high}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="balochistan" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Balochistan
              {!isLoading && getProvinceRiskSummary(balochistanData).high > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-risk-high/20 text-xs text-risk-high">
                  {getProvinceRiskSummary(balochistanData).high}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="punjab" className="mt-0">
            <ProvinceTable data={punjabData} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="kpk" className="mt-0">
            <ProvinceTable data={kpkData} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="balochistan" className="mt-0">
            <ProvinceTable data={balochistanData} isLoading={isLoading} />
          </TabsContent>
        </Tabs>

        {/* Risk legend */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-4">
          <span className="text-sm text-muted-foreground">Risk Levels:</span>
          <div className="flex flex-wrap gap-2">
            <RiskBadge level="low" />
            <RiskBadge level="moderate" />
            <RiskBadge level="high" />
            <RiskBadge level="extreme" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
