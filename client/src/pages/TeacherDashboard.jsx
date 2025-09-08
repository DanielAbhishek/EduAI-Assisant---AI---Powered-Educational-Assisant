import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import ClassAnalytics from "@/components/ClassAnalytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function TeacherDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const { data: classStats = {} } = useQuery({
    queryKey: ["/api/teacher/stats"],
    enabled: !!user && user.role === 'teacher',
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

  const { data: teacherEssays = [] } = useQuery({
    queryKey: ["/api/teacher/essays"],
    enabled: !!user && user.role === 'teacher',
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user?.role !== 'teacher') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-destructive text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This page is only accessible to teachers.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock student data for display purposes
  const mockStudents = [
    {
      id: 1,
      name: "Alex Johnson",
      initials: "AJ",
      avgScore: 87,
      essayCount: 12,
      lastActive: "2 hours ago"
    },
    {
      id: 2,
      name: "Maria Garcia",
      initials: "MG",
      avgScore: 92,
      essayCount: 15,
      lastActive: "1 day ago"
    },
    {
      id: 3,
      name: "David Lee",
      initials: "DL",
      avgScore: 74,
      essayCount: 8,
      lastActive: "3 hours ago"
    },
    {
      id: 4,
      name: "Sarah Wilson",
      initials: "SW",
      avgScore: 89,
      essayCount: 11,
      lastActive: "30 minutes ago"
    },
    {
      id: 5,
      name: "Michael Brown",
      initials: "MB",
      avgScore: 83,
      essayCount: 9,
      lastActive: "5 hours ago"
    }
  ];

  const recentSubmissions = teacherEssays.slice(0, 5).map(essay => ({
    id: essay.id,
    title: essay.title,
    student: essay.user ? `${essay.user.firstName || essay.user.email}` : 'Unknown Student',
    status: essay.status === 'graded' ? 'Graded' : 'Pending',
    score: essay.overallScore,
    submitted: new Date(essay.createdAt).toLocaleDateString(),
  }));

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Teacher Dashboard" 
          subtitle="Monitor class progress and student performance"
        />
        
        <div className="p-6 space-y-6">
          {/* Class Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                      {classStats.totalStudents || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-primary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-secondary mr-1">↗</span>
                  <span className="text-secondary font-medium">Active learners</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Class Score</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-avg-class-score">
                      {classStats.averageScore || 0}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-chart-bar text-secondary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-secondary mr-1">↗</span>
                  <span className="text-secondary font-medium">Improving</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Essays Graded</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-essays-graded">
                      {classStats.totalEssays || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-edit text-accent text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-accent mr-1">📝</span>
                  <span className="text-accent font-medium">
                    {teacherEssays.filter(e => e.status === 'submitted').length} pending
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="text-active-today">
                      {classStats.activeToday || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-check text-primary text-lg"></i>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-primary mr-1">👥</span>
                  <span className="text-primary font-medium">
                    {classStats.totalStudents > 0 
                      ? Math.round((classStats.activeToday / classStats.totalStudents) * 100) 
                      : 0}% participation
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student List and Recent Submissions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Performance */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Student Performance</h3>
                <div className="space-y-3">
                  {mockStudents.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`card-student-${student.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-foreground">
                            {student.initials}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last active: {student.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">{student.avgScore}%</p>
                        <p className="text-sm text-muted-foreground">
                          {student.essayCount} essays
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h3>
                <div className="space-y-4">
                  {recentSubmissions.length > 0 ? (
                    recentSubmissions.map((submission) => (
                      <div key={submission.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground" data-testid={`text-submission-title-${submission.id}`}>
                            {submission.title}
                          </h4>
                          <Badge variant={submission.status === 'Graded' ? 'default' : 'secondary'}>
                            {submission.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          by {submission.student}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Submitted {submission.submitted}
                          </span>
                          {submission.status === 'Graded' ? (
                            <span className="text-xs font-medium text-secondary">
                              Score: {submission.score}/100
                            </span>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              data-testid={`button-review-${submission.id}`}
                            >
                              Review
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <i className="fas fa-inbox text-4xl text-muted-foreground mb-4"></i>
                      <p className="text-muted-foreground">No recent submissions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Class Analytics */}
          <ClassAnalytics />
        </div>
      </main>
    </div>
  );
}
