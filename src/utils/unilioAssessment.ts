import type { UniLioQuizQuestion } from "./unilioQuiz";
import {
  assessmentQuestionsToQuizDraft,
  quizDraftToAssessmentQuestions,
  type UniLioAssessmentQuestion,
} from "./unilioQuestionnaire";

export type { UniLioAssessmentQuestion };

export function parseAssessmentQuestionsJson(
  questionsJson?: string | null,
): UniLioAssessmentQuestion[] {
  if (!questionsJson?.trim()) return [];

  try {
    const raw = JSON.parse(questionsJson) as Array<{
      id?: string;
      text?: string;
      options?: string[];
      correctAnswer?: string;
    }>;

    if (!Array.isArray(raw)) return [];

    return raw
      .map((question, index) => ({
        id: question.id?.trim() || `q${index + 1}`,
        text: question.text?.trim() ?? "",
        options: (question.options ?? [])
          .map((option) => option.trim())
          .filter(Boolean),
        correctAnswer: question.correctAnswer?.trim() ?? "",
      }))
      .filter((question) => question.text.length > 0);
  } catch {
    return [];
  }
}

export function serializeAssessmentQuestions(
  questions: UniLioAssessmentQuestion[],
): string {
  return JSON.stringify(
    questions.map((question) => ({
      id: question.id,
      text: question.text.trim(),
      options: question.options.map((option) => option.trim()).filter(Boolean),
      correctAnswer: question.correctAnswer.trim(),
    })),
  );
}

export function assessmentQuestionsToQuizQuestions(
  questions: UniLioAssessmentQuestion[],
): UniLioQuizQuestion[] {
  return assessmentQuestionsToQuizDraft(questions).questions;
}

export function quizQuestionsToAssessmentQuestions(
  questions: UniLioQuizQuestion[],
): UniLioAssessmentQuestion[] {
  return quizDraftToAssessmentQuestions({ passingScore: 70, questions });
}
