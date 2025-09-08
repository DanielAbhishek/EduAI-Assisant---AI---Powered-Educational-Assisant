import { Card, CardContent } from "@/components/ui/card";

export default function ClassAnalytics() {
  // This would typically use real chart libraries like Recharts or Chart.js
  // For now, showing placeholder content with proper structure
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Class Analytics</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Distribution */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Performance Distribution</h4>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-bar text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground text-sm">
                  Performance distribution chart
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Shows grade distribution across all students
                </p>
              </div>
            </div>
          </div>
          
          {/* Improvement Trends */}
          <div>
            <h4 className="font-medium text-foreground mb-4">Improvement Trends</h4>
            <div className="h-48 bg-muted/30 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-chart-line text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground text-sm">
                  Improvement trends chart
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Shows student progress over time
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Insights */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium text-foreground mb-4">Quick Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-trend-up text-primary text-sm"></i>
                </div>
                <div>
                  <h5 className="font-medium text-foreground text-sm">Top Performers</h5>
                  <p className="text-xs text-muted-foreground">
                    5 students scoring above 90%
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-accent text-sm"></i>
                </div>
                <div>
                  <h5 className="font-medium text-foreground text-sm">Needs Attention</h5>
                  <p className="text-xs text-muted-foreground">
                    2 students below 70% average
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar-check text-secondary text-sm"></i>
                </div>
                <div>
                  <h5 className="font-medium text-foreground text-sm">Most Active</h5>
                  <p className="text-xs text-muted-foreground">
                    Peak activity: Wednesdays
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
