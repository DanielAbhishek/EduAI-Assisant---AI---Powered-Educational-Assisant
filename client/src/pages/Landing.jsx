import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-brain text-primary-foreground text-2xl"></i>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">EduAI</h1>
              <p className="text-xl text-muted-foreground">Assistant</p>
            </div>
          </div>
          <h2 className="text-5xl font-bold text-foreground mb-6">
            AI-Powered Learning Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Transform your writing skills with intelligent feedback, adaptive quizzes, 
            and personalized learning paths designed for students and teachers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-edit text-primary text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Smart Essay Analysis</h3>
              <p className="text-muted-foreground">
                Get instant AI-powered feedback on grammar, structure, and content 
                to improve your writing skills.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-question-circle text-secondary text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Adaptive Quizzes</h3>
              <p className="text-muted-foreground">
                Practice with intelligent quizzes that adapt to your skill level 
                and help you master key concepts.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-chart-line text-accent text-2xl"></i>
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with detailed analytics and 
                personalized recommendations.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto p-8">
            <CardContent className="pt-6">
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Ready to Start Learning?
              </h3>
              <p className="text-muted-foreground mb-8">
                Join thousands of students and teachers using EduAI to enhance 
                their educational experience.
              </p>
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={handleLogin}
                data-testid="button-login"
              >
                <i className="fas fa-rocket mr-2"></i>
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
