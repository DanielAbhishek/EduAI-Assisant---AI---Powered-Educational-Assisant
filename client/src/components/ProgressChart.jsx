import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ProgressChart({ progress = [] }) {
  const subjects = ["writing", "grammar", "vocabulary"];
  
  const getProgressForSubject = (subject) => {
    const subjectProgress = progress.find(p => p.subject === subject);
    return subjectProgress || {
      subject,
      skillLevel: 0,
      totalExercises: 0,
      completedExercises: 0,
      averageScore: 0,
      streak: 0
    };
  };

  const getSubjectColor = (subject) => {
    switch (subject) {
      case "writing": return "primary";
      case "grammar": return "secondary";
      case "vocabulary": return "accent";
      default: return "muted";
    }
  };

  const getSubjectIcon = (subject) => {
    switch (subject) {
      case "writing": return "fas fa-edit";
      case "grammar": return "fas fa-spell-check";
      case "vocabulary": return "fas fa-book";
      default: return "fas fa-chart-bar";
    }
  };

  return (
    <div className="space-y-6">
      {/* Learning Progress */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Learning Progress</h3>
          <div className="space-y-4">
            {subjects.map((subject) => {
              const subjectData = getProgressForSubject(subject);
              const color = getSubjectColor(subject);
              
              return (
                <div key={subject}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground capitalize flex items-center">
                      <i className={`${getSubjectIcon(subject)} mr-2`}></i>
                      {subject}
                    </span>
                    <span className="font-medium" data-testid={`text-${subject}-progress`}>
                      {Math.round(subjectData.skillLevel)}%
                    </span>
                  </div>
                  <Progress 
                    value={subjectData.skillLevel} 
                    className={`h-2 progress-${color}`}
                    data-testid={`progress-${subject}`}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Achievements</h3>
          <div className="space-y-3">
            {progress.filter(p => p.streak >= 5).map((p) => (
              <div key={`streak-${p.subject}`} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-fire text-accent text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.streak}-Day {p.subject} Streak
                  </p>
                  <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                </div>
              </div>
            ))}
            
            {progress.filter(p => p.averageScore >= 90).map((p) => (
              <div key={`master-${p.subject}`} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-medal text-secondary text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.subject.charAt(0).toUpperCase() + p.subject.slice(1)} Master
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(p.averageScore)}% average score
                  </p>
                </div>
              </div>
            ))}
            
            {progress.filter(p => p.totalExercises >= 10).map((p) => (
              <div key={`expert-${p.subject}`} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-star text-primary text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {p.subject.charAt(0).toUpperCase() + p.subject.slice(1)} Expert
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.totalExercises} exercises completed
                  </p>
                </div>
              </div>
            ))}
            
            {(!progress.length || !progress.some(p => p.streak >= 5 || p.averageScore >= 90 || p.totalExercises >= 10)) && (
              <div className="text-center py-8">
                <i className="fas fa-trophy text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">Complete exercises to unlock achievements!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
