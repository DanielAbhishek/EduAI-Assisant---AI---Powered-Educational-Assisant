import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEssaySchema, insertQuizAttemptSchema } from "@shared/schema";
import { handleRouteError, asyncHandler, NotFoundError } from "./utils/errorHandler";
import { moderateRateLimit, strictRateLimit } from "./middleware/rateLimiter";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Apply rate limiting to all API routes
  app.use('/api', moderateRateLimit);
  
  // Stricter rate limiting for write operations only
  app.post('/api/essays', strictRateLimit);
  app.post('/api/quiz-attempts', strictRateLimit);
  app.post('/api/init-data', strictRateLimit);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    if (!user) {
      throw new NotFoundError("User");
    }
    res.json(user);
  }));

  // Essay routes
  app.post('/api/essays', isAuthenticated, asyncHandler(async (req: any, res) => {
    const userId = req.user.claims.sub;
    const essayData = insertEssaySchema.parse({ ...req.body, userId });
    
    // Calculate word count
    const wordCount = essayData.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    essayData.wordCount = wordCount;
    
    // Simulate AI analysis (replace with actual AI service)
    const aiAnalysis = await analyzeEssay(essayData.content);
    
    const essay = await storage.createEssay({
      ...essayData,
      ...aiAnalysis,
      status: "graded"
    });

    // Update progress
    await storage.updateProgress(userId, "writing", aiAnalysis.overallScore);
    
    res.json(essay);
  }));

  app.get('/api/essays', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const essays = await storage.getEssaysByUser(userId);
      res.json(essays);
    } catch (error) {
      console.error("Error fetching essays:", error);
      res.status(500).json({ message: "Failed to fetch essays" });
    }
  });

  app.get('/api/essays/:id', isAuthenticated, async (req: any, res) => {
    try {
      const essayId = parseInt(req.params.id);
      const essay = await storage.getEssayById(essayId);
      
      if (!essay) {
        return res.status(404).json({ message: "Essay not found" });
      }
      
      res.json(essay);
    } catch (error) {
      console.error("Error fetching essay:", error);
      res.status(500).json({ message: "Failed to fetch essay" });
    }
  });

  // Quiz routes
  app.get('/api/quizzes', isAuthenticated, async (req, res) => {
    try {
      const quizzes = await storage.getQuizzes();
      res.json(quizzes);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ message: "Failed to fetch quizzes" });
    }
  });

  app.get('/api/quizzes/:id', isAuthenticated, async (req, res) => {
    try {
      const quizId = parseInt(req.params.id);
      const quiz = await storage.getQuizById(quizId);
      
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Failed to fetch quiz" });
    }
  });

  app.post('/api/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attemptData = insertQuizAttemptSchema.parse({ ...req.body, userId });
      
      const attempt = await storage.createQuizAttempt(attemptData);
      
      // Update progress based on quiz performance
      const scorePercentage = (attemptData.score / attemptData.totalQuestions) * 100;
      await storage.updateProgress(userId, "grammar", scorePercentage);
      
      res.json(attempt);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid attempt data", errors: error.errors });
      } else {
        console.error("Error creating quiz attempt:", error);
        res.status(500).json({ message: "Failed to submit quiz attempt" });
      }
    }
  });

  app.get('/api/quiz-attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getQuizAttemptsByUser(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching quiz attempts:", error);
      res.status(500).json({ message: "Failed to fetch quiz attempts" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progressData = await storage.getProgressByUser(userId);
      res.json(progressData);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // Teacher routes
  app.get('/api/teacher/essays', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const essays = await storage.getAllEssaysForTeacher();
      res.json(essays);
    } catch (error) {
      console.error("Error fetching teacher essays:", error);
      res.status(500).json({ message: "Failed to fetch essays" });
    }
  });

  app.get('/api/teacher/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'teacher') {
        return res.status(403).json({ message: "Teacher access required" });
      }
      
      const stats = await storage.getClassStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching class stats:", error);
      res.status(500).json({ message: "Failed to fetch class statistics" });
    }
  });

  // Initialize sample data
  // Development-only route for sample data initialization
  app.post('/api/init-data', asyncHandler(async (req: any, res) => {
    // Security: Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({ message: "Not available in production" });
      return;
    }
    
    await initializeSampleData();
    res.json({ message: "Sample data initialized" });
  }));

  const httpServer = createServer(app);
  return httpServer;
}

// AI Analysis Function (replace with actual AI service)
async function analyzeEssay(content: string) {
  // This would typically call an external AI service like OpenAI, HuggingFace, etc.
  // For now, implementing a basic scoring algorithm
  
  const wordCount = content.trim().split(/\s+/).length;
  const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / sentenceCount;
  
  // Basic scoring logic (replace with actual AI)
  let grammarScore = Math.min(100, Math.max(60, 85 + Math.random() * 10));
  let structureScore = Math.min(100, Math.max(60, avgWordsPerSentence > 15 ? 90 : 75));
  let contentScore = Math.min(100, Math.max(60, wordCount > 300 ? 85 : 70));
  
  const overallScore = Math.round((grammarScore + structureScore + contentScore) / 3);
  
  const feedback = generateFeedback(grammarScore, structureScore, contentScore);
  
  return {
    grammarScore: Math.round(grammarScore),
    structureScore: Math.round(structureScore),
    contentScore: Math.round(contentScore),
    overallScore,
    feedback
  };
}

function generateFeedback(grammar: number, structure: number, content: number) {
  let feedback = [];
  
  if (grammar > 85) {
    feedback.push("Excellent grammar and punctuation usage.");
  } else if (grammar > 70) {
    feedback.push("Good grammar overall with minor areas for improvement.");
  } else {
    feedback.push("Focus on improving grammar and punctuation accuracy.");
  }
  
  if (structure > 85) {
    feedback.push("Well-structured essay with clear flow and organization.");
  } else if (structure > 70) {
    feedback.push("Good structure with some areas that could be strengthened.");
  } else {
    feedback.push("Work on improving essay structure and paragraph organization.");
  }
  
  if (content > 85) {
    feedback.push("Strong content with compelling arguments and evidence.");
  } else if (content > 70) {
    feedback.push("Good content development with room for deeper analysis.");
  } else {
    feedback.push("Expand your content with more detailed examples and analysis.");
  }
  
  return feedback.join(" ");
}

// Initialize sample quizzes
async function initializeSampleData() {
  const db = (await import("./db")).db;
  const { quizzes } = await import("@shared/schema");
  
  const sampleQuizzes = [
    {
      title: "Grammar Fundamentals",
      description: "Test your basic grammar knowledge",
      difficulty: "beginner",
      timeLimit: 20,
      questions: [
        {
          question: "Which sentence is grammatically correct?",
          options: [
            "The team are working on the project.",
            "The team is working on the project.",
            "The team was working on the project.",
            "The team were working on the project."
          ],
          correctAnswer: 1,
          explanation: "When 'team' is used as a collective noun referring to the group as a unit, it takes a singular verb."
        },
        {
          question: "Choose the correct form of the verb:",
          options: [
            "She don't like coffee.",
            "She doesn't like coffee.",
            "She didn't liked coffee.",
            "She doesn't likes coffee."
          ],
          correctAnswer: 1,
          explanation: "With third-person singular subjects (she, he, it), use 'doesn't' in the present tense."
        }
      ]
    },
    {
      title: "Essay Structure",
      description: "Understanding how to organize your writing",
      difficulty: "intermediate",
      timeLimit: 30,
      questions: [
        {
          question: "What is the purpose of a thesis statement?",
          options: [
            "To summarize the conclusion",
            "To present the main argument of the essay",
            "To provide background information",
            "To list all the sources used"
          ],
          correctAnswer: 1,
          explanation: "A thesis statement presents the main argument or central claim of your essay."
        }
      ]
    },
    {
      title: "Advanced Writing",
      description: "Complex writing techniques and analysis",
      difficulty: "advanced",
      timeLimit: 45,
      questions: [
        {
          question: "Which literary device is being used: 'The wind whispered through the trees'?",
          options: [
            "Metaphor",
            "Personification",
            "Simile",
            "Alliteration"
          ],
          correctAnswer: 1,
          explanation: "Personification gives human characteristics (whispering) to non-human things (wind)."
        }
      ]
    }
  ];

  // Insert quizzes if they don't exist
  for (const quiz of sampleQuizzes) {
    await db.insert(quizzes).values(quiz).onConflictDoNothing();
  }
}
