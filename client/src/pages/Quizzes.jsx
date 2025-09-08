import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import QuizInterface from "@/components/QuizInterface";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Quizzes() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/quizzes"],
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

  const { data: attempts = [] } = useQuery({
    queryKey: ["/api/quiz-attempts"],
    enabled: !!user,
  });

  const submitAttemptMutation = useMutation({
    mutationFn: api.submitQuizAttempt,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      
      const scorePercentage = Math.round((data.score / data.totalQuestions) * 100);
      toast({
        title: "Quiz Completed!",
        description: `You scored ${data.score}/${data.totalQuestions} (${scorePercentage}%)`,
      });
      
      setActiveQuiz(null);
      setSelectedQuiz(null);
    },
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
        return;
      }
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setActiveQuiz(quiz);
  };

  const handleQuizComplete = (attempt) => {
    submitAttemptMutation.mutate(attempt);
  };

  const getBestScore = (quizId) => {
    const quizAttempts = attempts.filter(attempt => attempt.quizId === quizId);
    if (quizAttempts.length === 0) return null;
    
    const bestAttempt = quizAttempts.reduce((best, current) => 
      (current.score / current.totalQuestions) > (best.score / best.totalQuestions) ? current : best
    );
    
    return Math.round((bestAttempt.score / bestAttempt.totalQuestions) * 100);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "default";
      case "intermediate": return "secondary";
      case "advanced": return "destructive";
      default: return "default";
    }
  };

  const quizStats = {
    completed: attempts.length,
    averageScore: attempts.length > 0 
      ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions * 100), 0) / attempts.length)
      : 0,
    bestScore: attempts.length > 0 
      ? Math.max(...attempts.map(attempt => Math.round((attempt.score / attempt.totalQuestions) * 100)))
      : 0,
    timeSpent: attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0),
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}.${Math.round(minutes / 6)} hours`;
    }
    return `${minutes} minutes`;
  };

  if (activeQuiz) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Header 
            title={`Quiz: ${activeQuiz.title}`} 
            subtitle="Take your time and choose the best answer"
          />
          
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <QuizInterface quiz={activeQuiz} onComplete={handleQuizComplete} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Practice Quizzes" 
          subtitle="Test your knowledge with adaptive quizzes"
        />
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quiz Selection */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Available Quizzes</h3>
                  <div className="space-y-3">
                    {quizzes.length > 0 ? (
                      quizzes.map((quiz) => {
                        const bestScore = getBestScore(quiz.id);
                        return (
                          <div 
                            key={quiz.id}
                            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => setSelectedQuiz(quiz)}
                            data-testid={`card-quiz-${quiz.id}`}
                          >
                            <h4 className="font-medium text-foreground">{quiz.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {quiz.questions?.length || 0} questions • {quiz.timeLimit} minutes
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <Badge variant={getDifficultyColor(quiz.difficulty)}>
                                {quiz.difficulty}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {bestScore ? `Best: ${bestScore}%` : "Not taken"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-question-circle text-4xl text-muted-foreground mb-4"></i>
                        <p className="text-muted-foreground">No quizzes available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quiz Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quizzes Completed</span>
                      <span className="font-medium" data-testid="text-quizzes-completed">
                        {quizStats.completed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average Score</span>
                      <span className="font-medium" data-testid="text-average-score">
                        {quizStats.averageScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Best Score</span>
                      <span className="font-medium" data-testid="text-best-score">
                        {quizStats.bestScore}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Time Spent</span>
                      <span className="font-medium" data-testid="text-time-spent">
                        {formatTime(quizStats.timeSpent)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quiz Details */}
            <div className="lg:col-span-2">
              {selectedQuiz ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-semibold text-foreground">
                            {selectedQuiz.title}
                          </h3>
                          <Badge variant={getDifficultyColor(selectedQuiz.difficulty)}>
                            {selectedQuiz.difficulty}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          {selectedQuiz.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                              {selectedQuiz.questions?.length || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">Questions</div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-2xl font-bold text-foreground">
                              {selectedQuiz.timeLimit}
                            </div>
                            <div className="text-sm text-muted-foreground">Minutes</div>
                          </div>
                        </div>

                        {getBestScore(selectedQuiz.id) && (
                          <div className="p-4 bg-secondary/10 rounded-lg mb-6">
                            <div className="text-sm font-medium text-secondary">Your Best Score</div>
                            <div className="text-2xl font-bold text-secondary">
                              {getBestScore(selectedQuiz.id)}%
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleStartQuiz(selectedQuiz)}
                        className="w-full"
                        size="lg"
                        disabled={!selectedQuiz.questions || selectedQuiz.questions.length === 0}
                        data-testid="button-start-quiz"
                      >
                        <i className="fas fa-play mr-2"></i>
                        Start Quiz
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="py-16">
                      <i className="fas fa-mouse-pointer text-6xl text-muted-foreground mb-6"></i>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Select a Quiz
                      </h3>
                      <p className="text-muted-foreground">
                        Choose a quiz from the list to see details and start practicing.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
