import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FloodData } from '@/lib/floodApi';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Droplets } from 'lucide-react';

interface FloodChartProps {
  floodData: FloodData[];
  isLoading: boolean;
}

export function FloodChart({ floodData, isLoading }: FloodChartProps) {
  const [selectedLocation, setSelectedLocation] = useState<string>(floodData[0]?.location.name || '');

  const selectedData = floodData.find(d => d.location.name === selectedLocation);

  const chartData = selectedData?.dates.map((date, index) => ({
    date: format(parseISO(date), 'MMM dd'),
    fullDate: date,
    discharge: selectedData.riverDischarge[index] || 0,
  })) || [];

  const maxDischarge = selectedData?.maxDischarge || 0;
  const avgDischarge = selectedData?.avgDischarge || 0;

  if (isLoading) {
    return (
      <Card className="card-gradient border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            River Discharge Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading forecast data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient border-border">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            River Discharge Forecast
          </CardTitle>
          <CardDescription className="mt-1.5">
            30-day maximum daily river discharge prediction (m³/s)
          </CardDescription>
        </div>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {floodData.map(data => (
              <SelectItem key={data.location.name} value={data.location.name}>
                {data.location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Droplets className="h-4 w-4" />
              Peak Discharge
            </div>
            <p className="mt-1 text-2xl font-bold text-primary">
              {maxDischarge.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">m³/s</span>
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Average Discharge
            </div>
            <p className="mt-1 text-2xl font-bold text-accent">
              {avgDischarge.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">m³/s</span>
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dischargeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="hsl(215 20% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215 20% 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 9%)',
                  border: '1px solid hsl(217 33% 17%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 96%)',
                }}
                labelStyle={{ color: 'hsl(215 20% 55%)' }}
                formatter={(value: number) => [`${value.toFixed(2)} m³/s`, 'Discharge']}
              />
              {/* Warning threshold lines */}
              <ReferenceLine y={1500} stroke="hsl(48 96% 53%)" strokeDasharray="5 5" label="" />
              <ReferenceLine y={3000} stroke="hsl(0 72% 51%)" strokeDasharray="5 5" label="" />
              <Area
                type="monotone"
                dataKey="discharge"
                stroke="hsl(199 89% 48%)"
                strokeWidth={2}
                fill="url(#dischargeGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-risk-moderate" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(48 96% 53%), hsl(48 96% 53%) 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-muted-foreground">High Risk (1500 m³/s)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-6 bg-risk-extreme" style={{ backgroundImage: 'repeating-linear-gradient(90deg, hsl(0 72% 51%), hsl(0 72% 51%) 4px, transparent 4px, transparent 8px)' }} />
            <span className="text-muted-foreground">Extreme Risk (3000 m³/s)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
