import {
  users,
  essays,
  quizzes,
  quizAttempts,
  progress,
  type User,
  type UpsertUser,
  type Essay,
  type InsertEssay,
  type Quiz,
  type InsertQuiz,
  type QuizAttempt,
  type InsertQuizAttempt,
  type Progress,
  type InsertProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, avg, count } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Essay operations
  createEssay(essay: InsertEssay): Promise<Essay>;
  getEssaysByUser(userId: string): Promise<Essay[]>;
  getEssayById(id: number): Promise<Essay | undefined>;
  updateEssay(id: number, updates: Partial<InsertEssay>): Promise<Essay>;
  getAllEssaysForTeacher(): Promise<(Essay & { user: User | null })[]>;
  
  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuizById(id: number): Promise<Quiz | undefined>;
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttemptsByUser(userId: string): Promise<(QuizAttempt & { quiz: Quiz | null })[]>;
  getBestScoreForQuiz(userId: string, quizId: number): Promise<number>;
  
  // Progress operations
  getProgressByUser(userId: string): Promise<Progress[]>;
  updateProgress(userId: string, subject: string, score: number): Promise<Progress>;
  
  // Analytics
  getClassStats(): Promise<{
    totalStudents: number;
    averageScore: number;
    totalEssays: number;
    activeToday: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createEssay(essay: InsertEssay): Promise<Essay> {
    const [newEssay] = await db.insert(essays).values(essay).returning();
    return newEssay;
  }

  async getEssaysByUser(userId: string): Promise<Essay[]> {
    return await db
      .select()
      .from(essays)
      .where(eq(essays.userId, userId))
      .orderBy(desc(essays.createdAt));
  }

  async getEssayById(id: number): Promise<Essay | undefined> {
    const [essay] = await db.select().from(essays).where(eq(essays.id, id));
    return essay;
  }

  async updateEssay(id: number, updates: Partial<InsertEssay>): Promise<Essay> {
    const [updatedEssay] = await db
      .update(essays)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(essays.id, id))
      .returning();
    return updatedEssay;
  }

  async getAllEssaysForTeacher(): Promise<(Essay & { user: User | null })[]> {
    return await db
      .select({
        id: essays.id,
        userId: essays.userId,
        title: essays.title,
        content: essays.content,
        topic: essays.topic,
        wordCount: essays.wordCount,
        grammarScore: essays.grammarScore,
        structureScore: essays.structureScore,
        contentScore: essays.contentScore,
        overallScore: essays.overallScore,
        feedback: essays.feedback,
        status: essays.status,
        createdAt: essays.createdAt,
        updatedAt: essays.updatedAt,
        user: users,
      })
      .from(essays)
      .leftJoin(users, eq(essays.userId, users.id))
      .orderBy(desc(essays.createdAt));
  }

  async getQuizzes(): Promise<Quiz[]> {
    return await db.select().from(quizzes).orderBy(desc(quizzes.createdAt));
  }

  async getQuizById(id: number): Promise<Quiz | undefined> {
    const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, id));
    return quiz;
  }

  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const [newAttempt] = await db.insert(quizAttempts).values(attempt).returning();
    return newAttempt;
  }

  async getQuizAttemptsByUser(userId: string): Promise<(QuizAttempt & { quiz: Quiz | null })[]> {
    return await db
      .select({
        id: quizAttempts.id,
        userId: quizAttempts.userId,
        quizId: quizAttempts.quizId,
        answers: quizAttempts.answers,
        score: quizAttempts.score,
        totalQuestions: quizAttempts.totalQuestions,
        timeSpent: quizAttempts.timeSpent,
        completedAt: quizAttempts.completedAt,
        quiz: quizzes,
      })
      .from(quizAttempts)
      .leftJoin(quizzes, eq(quizAttempts.quizId, quizzes.id))
      .where(eq(quizAttempts.userId, userId))
      .orderBy(desc(quizAttempts.completedAt));
  }

  async getBestScoreForQuiz(userId: string, quizId: number): Promise<number> {
    const result = await db
      .select({ maxScore: avg(quizAttempts.score) })
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)));
    
    return Number(result[0]?.maxScore) || 0;
  }

  async getProgressByUser(userId: string): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(eq(progress.userId, userId));
  }

  async updateProgress(userId: string, subject: string, score: number): Promise<Progress> {
    const existingProgress = await db
      .select()
      .from(progress)
      .where(and(eq(progress.userId, userId), eq(progress.subject, subject)));

    if (existingProgress.length > 0) {
      const current = existingProgress[0];
      const newTotal = (current.totalExercises || 0) + 1;
      const newCompleted = (current.completedExercises || 0) + 1;
      const newAverage = (((current.averageScore || 0) * (current.totalExercises || 0)) + score) / newTotal;
      
      const [updated] = await db
        .update(progress)
        .set({
          totalExercises: newTotal,
          completedExercises: newCompleted,
          averageScore: newAverage,
          skillLevel: Math.min(100, newAverage),
          lastActivity: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(progress.id, current.id))
        .returning();
      return updated;
    } else {
      const [newProgress] = await db
        .insert(progress)
        .values({
          userId,
          subject,
          skillLevel: Math.min(100, score),
          totalExercises: 1,
          completedExercises: 1,
          averageScore: score,
          streak: 1,
        })
        .returning();
      return newProgress;
    }
  }

  async getClassStats(): Promise<{
    totalStudents: number;
    averageScore: number;
    totalEssays: number;
    activeToday: number;
  }> {
    const studentCount = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.role, "student"));

    const essayCount = await db
      .select({ count: count() })
      .from(essays);

    const avgScore = await db
      .select({ avg: avg(essays.overallScore) })
      .from(essays)
      .where(eq(essays.status, "graded"));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeToday = await db
      .select({ count: count() })
      .from(users)
      .leftJoin(progress, eq(users.id, progress.userId))
      .where(and(
        eq(users.role, "student"),
        eq(progress.lastActivity, today)
      ));

    return {
      totalStudents: studentCount[0]?.count || 0,
      averageScore: Math.round(Number(avgScore[0]?.avg) || 0),
      totalEssays: essayCount[0]?.count || 0,
      activeToday: activeToday[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
