import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EssayForm from "@/components/EssayForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";

export default function Essays() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedEssay, setSelectedEssay] = useState(null);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const handleEssaySuccess = (essay) => {
    setSelectedEssay(essay);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header 
          title="Essay Submission" 
          subtitle="Submit your essays for AI analysis and feedback"
        />
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Essay Form */}
            <div className="lg:col-span-2">
              <EssayForm onSuccess={handleEssaySuccess} />
            </div>

            {/* Sidebar with tips and recent essays */}
            <div className="space-y-6">
              {/* Writing Tips */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Writing Tips</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-sm text-primary font-medium">
                        Structure your essay with clear introduction, body, and conclusion.
                      </p>
                    </div>
                    <div className="p-3 bg-secondary/10 rounded-lg">
                      <p className="text-sm text-secondary font-medium">
                        Use evidence and examples to support your arguments.
                      </p>
                    </div>
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <p className="text-sm text-accent font-medium">
                        Proofread for grammar, spelling, and clarity.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Essays */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Recent Essays</h3>
                  <div className="space-y-3">
                    {essays.length > 0 ? (
                      essays.slice(0, 5).map((essay) => (
                        <div 
                          key={essay.id}
                          className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => setSelectedEssay(essay)}
                          data-testid={`card-essay-${essay.id}`}
                        >
                          <h4 className="font-medium text-foreground text-sm">{essay.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(essay.createdAt).toLocaleDateString()}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant={essay.overallScore >= 80 ? "default" : "secondary"}>
                              {essay.overallScore || 0}/100
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEssay(essay);
                              }}
                              data-testid={`button-view-feedback-${essay.id}`}
                            >
                              View Feedback
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <i className="fas fa-edit text-4xl text-muted-foreground mb-4"></i>
                        <p className="text-muted-foreground">No essays submitted yet</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Feedback Display */}
          {selectedEssay && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">
                    AI Feedback: {selectedEssay.title}
                  </h3>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedEssay(null)}
                    data-testid="button-close-feedback"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Close
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Overall Score */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-foreground">Overall Score</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-secondary" data-testid="text-overall-score">
                        {selectedEssay.overallScore || 0}
                      </div>
                      <div className="text-muted-foreground">/100</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Grammar</span>
                        <span className="font-medium" data-testid="text-grammar-score">
                          {selectedEssay.grammarScore || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Structure</span>
                        <span className="font-medium" data-testid="text-structure-score">
                          {selectedEssay.structureScore || 0}/100
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Content</span>
                        <span className="font-medium" data-testid="text-content-score">
                          {selectedEssay.contentScore || 0}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Feedback */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="font-semibold text-foreground">Detailed Feedback</h4>
                    <div className="space-y-3">
                      {selectedEssay.feedback ? (
                        <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                          <p className="font-medium text-primary text-sm">AI Analysis</p>
                          <p className="text-sm text-foreground mt-1" data-testid="text-ai-feedback">
                            {selectedEssay.feedback}
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-muted/30 rounded-lg text-center">
                          <p className="text-muted-foreground">No feedback available for this essay.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
