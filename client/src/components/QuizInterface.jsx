import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function QuizInterface({ quiz, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // Convert minutes to seconds
  const [selectedAnswer, setSelectedAnswer] = useState("");

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleQuizComplete();
    }
  }, [timeLeft]);

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;

  const handleAnswerSelect = (value) => {
    setSelectedAnswer(value);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer !== "") {
      setAnswers({ ...answers, [currentQuestion]: parseInt(selectedAnswer) });
      setSelectedAnswer("");
      
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleQuizComplete();
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]?.toString() || "");
    }
  };

  const handleSkipQuestion = () => {
    setSelectedAnswer("");
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    const attempt = {
      quizId: quiz.id,
      answers: answers,
      score: score,
      totalQuestions: totalQuestions,
      timeSpent: (quiz.timeLimit * 60) - timeLeft,
    };

    onComplete(attempt);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((currentQuestion + 1) / totalQuestions) * 100;

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No questions available for this quiz.</p>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-foreground" data-testid="text-quiz-title">
              {quiz.title}
            </h3>
            <div className="text-sm text-muted-foreground">
              Question <span data-testid="text-current-question">{currentQuestion + 1}</span> of{" "}
              <span data-testid="text-total-questions">{totalQuestions}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progressPercentage} className="mb-6" />

          {/* Question */}
          <div className="space-y-6">
            <div className="p-6 bg-muted/50 rounded-lg">
              <h4 className="text-lg font-medium text-foreground mb-4" data-testid="text-question">
                {question.question}
              </h4>
              
              <RadioGroup 
                value={selectedAnswer} 
                onValueChange={handleAnswerSelect}
                className="space-y-3"
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-card cursor-pointer transition-colors">
                    <RadioGroupItem 
                      value={index.toString()} 
                      id={`option-${index}`}
                      data-testid={`radio-option-${index}`}
                    />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer text-foreground"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
                data-testid="button-previous"
              >
                Previous
              </Button>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={handleSkipQuestion}
                  data-testid="button-skip"
                >
                  Skip
                </Button>
                <Button 
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === ""}
                  data-testid="button-next"
                >
                  {currentQuestion === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Time Remaining</span>
            <div className="flex items-center space-x-2">
              <i className="fas fa-clock text-accent"></i>
              <span 
                className={`text-lg font-mono font-bold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}
                data-testid="text-time-remaining"
              >
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
          {timeLeft < 300 && (
            <div className="mt-2">
              <Progress 
                value={(timeLeft / 300) * 100} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
