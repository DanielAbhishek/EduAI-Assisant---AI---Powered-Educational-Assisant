import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { api } from "@/services/api";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: essays = [] } = useQuery({
    queryKey: ["/api/essays"],
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

  const { data: progress = [] } = useQuery({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  const { data: quizAttempts = [] } = useQuery({
    queryKey: ["/api/quiz-attempts"],
    enabled: !!user,
  });

  // Initialize sample data on first load
  useEffect(() => {
    api.initData().catch(console.error);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const stats = {
    essays: essays.length,
    avgScore: essays.length > 0 
      ? Math.round(essays.reduce((sum, essay) => sum + (essay.overallScore || 0), 0) / essays.length)
      : 0,
    streak: progress.find(p => p.subject === "writing")?.streak || 0,
    feedback: essays.filter(essay => essay.feedback).length,
  };

  const recentActivities = [
    ...essays.slice(0, 2).map(essay => ({
      type: "essay",
      icon: "fas fa-edit",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      title: `Essay submitted: "${essay.title}"`,
      subtitle: `${new Date(essay.createdAt).toLocaleDateString()} • Score: ${essay.overallScore || 0}/100`,
    })),
    ...quizAttempts.slice(0, 1).map(attempt => ({
      type: "quiz",
      icon: "fas fa-check-circle",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
      title: `Quiz completed: "${attempt.quiz?.title || 'Quiz'}"`,
      subtitle: `${new Date(attempt.completedAt).toLocaleDateString()} • Score: ${Math.round((attempt.score / attempt.totalQuestions) * 100)}%`,
    })),
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Student Dashboard" 
          subtitle="Welcome back! Let's continue your learning journey."
        />
        
        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Essays Submitted</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-essays-count">
                      {stats.essays}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-edit text-primary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-secondary mr-1">↗</span>
                  <span className="text-secondary font-medium">+{Math.min(stats.essays, 2)} this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Essay Score Avg</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-avg-score">
                      {stats.avgScore}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-trophy text-secondary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-secondary mr-1">↗</span>
                  <span className="text-secondary font-medium">Keep improving!</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Study Streak</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-streak">
                      {stats.streak} days
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-fire text-accent text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-accent mr-1">🔥</span>
                  <span className="text-accent font-medium">Keep it up!</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Feedback</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-feedback-count">
                      {stats.feedback}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-robot text-primary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-primary mr-1">💡</span>
                  <span className="text-primary font-medium">Recent insights</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions and Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-5">
                  <Link href="/essays">
                    <Button 
                      className="w-full justify-between bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-submit-essay"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-plus"></i>
                        <span className="font-medium">Submit New Essay</span>
                      </div>
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </Link>
                  
                  <Link href="/quizzes">
                    <Button 
                      className="w-full justify-between bg-secondary text-secondary-foreground hover:bg-secondary/90"
                      data-testid="button-take-quiz"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-play"></i>
                        <span className="font-medium">Take Practice Quiz</span>
                      </div>
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </Link>
                  
                  <Link href="/progress">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-between"
                      data-testid="button-view-progress"
                    >
                      <div className="flex items-center space-x-3">
                        <i className="fas fa-chart-bar"></i>
                        <span className="font-medium">View Progress Report</span>
                      </div>
                      <i className="fas fa-arrow-right"></i>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`${activity.icon} ${activity.iconColor} text-sm`}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">{activity.title}</p>
                          <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-star text-4xl text-muted-foreground mb-4"></i>
                      <p className="text-muted-foreground">Start learning to see your activity here!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
