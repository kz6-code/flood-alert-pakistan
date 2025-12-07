import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { FloodChart } from '@/components/FloodChart';
import { RiskTable } from '@/components/RiskTable';
import { FloodHeatmap } from '@/components/FloodHeatmap';
import { FacilitiesMap } from '@/components/FacilitiesMap';
import { Footer } from '@/components/Footer';
import { FloodData, fetchAllFloodData } from '@/lib/floodApi';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [floodData, setFloodData] = useState<FloodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadFloodData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllFloodData();
      setFloodData(data);
      setLastUpdated(new Date());
      
      // Check for high-risk areas
      const highRiskAreas = data.filter(d => d.riskLevel === 'high' || d.riskLevel === 'extreme');
      if (highRiskAreas.length > 0) {
        toast({
          title: "⚠️ Flood Warning",
          description: `${highRiskAreas.length} area(s) showing elevated flood risk`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading flood data:', error);
      toast({
        title: "Error",
        description: "Failed to load flood data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFloodData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="container pb-16">
        {/* Last updated info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            {lastUpdated && (
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFloodData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Main content grid */}
        <div className="grid gap-8 lg:grid-cols-1">
          <FloodChart floodData={floodData} isLoading={isLoading} />
          <RiskTable floodData={floodData} isLoading={isLoading} />
        </div>
      </main>

      {/* Flood Risk Heatmap */}
      <FloodHeatmap floodData={floodData} isLoading={isLoading} className="bg-muted/30" />

      {/* WASH Facilities Map */}
      <FacilitiesMap />

      <Footer />
    </div>
  );
};

export default Index;
