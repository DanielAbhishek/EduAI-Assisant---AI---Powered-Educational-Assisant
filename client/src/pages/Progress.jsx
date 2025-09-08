import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ProgressChart from "@/components/ProgressChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function Progress() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  const { data: essays = [] } = useQuery({
    queryKey: ["/api/essays"],
    enabled: !!user,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["/api/quiz-attempts"],
    enabled: !!user,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Calculate weekly activity (mock data for demo)
  const weeklyActivity = [
    { day: "Mon", essays: 1, quizzes: 2 },
    { day: "Tue", essays: 0, quizzes: 1 },
    { day: "Wed", essays: 2, quizzes: 1 },
    { day: "Thu", essays: 1, quizzes: 3 },
    { day: "Fri", essays: 1, quizzes: 2 },
    { day: "Sat", essays: 0, quizzes: 1 },
    { day: "Sun", essays: 1, quizzes: 0 },
  ];

  const totalActivity = weeklyActivity.reduce((sum, day) => sum + day.essays + day.quizzes, 0);

  // Generate recommendations based on progress
  const generateRecommendations = () => {
    const recommendations = [];
    
    const writingProgress = progress.find(p => p.subject === "writing");
    const grammarProgress = progress.find(p => p.subject === "grammar");
    const vocabularyProgress = progress.find(p => p.subject === "vocabulary");

    if (!vocabularyProgress || vocabularyProgress.skillLevel < 70) {
      recommendations.push({
        icon: "fas fa-lightbulb",
        iconBg: "bg-primary/10",
        iconColor: "text-primary",
        title: "Focus on Vocabulary",
        description: "Your vocabulary scores could use improvement. Try our advanced word quizzes.",
        action: "Start Vocabulary Quiz",
        link: "/quizzes"
      });
    }

    if (!grammarProgress || grammarProgress.skillLevel > 85) {
      recommendations.push({
        icon: "fas fa-book",
        iconBg: "bg-secondary/10",
        iconColor: "text-secondary",
        title: "Practice Essay Structure",
        description: "Great grammar! Now let's work on organizing your ideas better.",
        action: "View Writing Guide",
        link: "/essays"
      });
    }

    if (!writingProgress || writingProgress.totalExercises < 5) {
      recommendations.push({
        icon: "fas fa-edit",
        iconBg: "bg-accent/10",
        iconColor: "text-accent",
        title: "Submit More Essays",
        description: "Regular practice improves writing skills. Try submitting essays weekly.",
        action: "Submit Essay",
        link: "/essays"
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Learning Progress" 
          subtitle="Track your improvement and achievements"
        />
        
        <div className="p-6 space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProgressChart progress={progress} />

            {/* Weekly Activity */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h3>
                <div className="space-y-3">
                  {weeklyActivity.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground w-12">{day.day}</span>
                      <div className="flex-1 flex items-center space-x-2 ml-4">
                        <div className="flex space-x-1">
                          {Array.from({ length: day.essays }).map((_, i) => (
                            <div key={i} className="w-2 h-6 bg-primary rounded-sm"></div>
                          ))}
                          {Array.from({ length: day.quizzes }).map((_, i) => (
                            <div key={i} className="w-2 h-6 bg-secondary rounded-sm"></div>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {day.essays + day.quizzes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total this week</span>
                    <span className="font-medium" data-testid="text-weekly-total">{totalActivity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Score Trend</h3>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-chart-line text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-muted-foreground">
                      Score trends will appear here as you complete more exercises
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Subject Distribution</h3>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <i className="fas fa-pie-chart text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-muted-foreground">
                      Subject distribution will appear here as you complete more exercises
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personalized Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Personalized Recommendations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className={`p-4 ${rec.iconBg.replace('/10', '/5')} border ${rec.iconBg.replace('bg-', 'border-').replace('/10', '/20')} rounded-lg`}>
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${rec.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`${rec.icon} ${rec.iconColor} text-sm`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{rec.description}</p>
                          <Link href={rec.link}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`mt-2 p-0 h-auto ${rec.iconColor} hover:${rec.iconColor}`}
                              data-testid={`button-${rec.title.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {rec.action}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
