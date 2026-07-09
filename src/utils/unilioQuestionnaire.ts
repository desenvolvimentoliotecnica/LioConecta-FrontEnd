import type { UniLioQuizQuestion } from "./unilioQuiz";

export type UniLioAssessmentQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
};

export type QuestionnaireDraft = {
  passingScore: number;
  questions: UniLioQuizQuestion[];
};

const OPTION_IDS = ["a", "b", "c", "d", "e", "f"] as const;

export function defaultQuestionnaireDraft(passingScore = 70): QuestionnaireDraft {
  return {
    passingScore,
    questions: [emptyQuizQuestion("q1")],
  };
}

function emptyQuizQuestion(id: string): UniLioQuizQuestion {
  return {
    id,
    text: "",
    options: [
      { id: "a", label: "" },
      { id: "b", label: "" },
      { id: "c", label: "" },
      { id: "d", label: "" },
    ],
    correctAnswer: "a",
  };
}

export function assessmentQuestionsToQuizDraft(
  questions: UniLioAssessmentQuestion[],
  passingScore = 70,
): QuestionnaireDraft {
  if (questions.length === 0) return defaultQuestionnaireDraft(passingScore);

  return {
    passingScore,
    questions: questions.map((question) => {
      const options = question.options.map((label, index) => ({
        id: OPTION_IDS[index] ?? `o${index + 1}`,
        label,
      }));
      const correctIndex = question.options.findIndex(
        (option) => option === question.correctAnswer,
      );
      const correctAnswer =
        correctIndex >= 0
          ? (options[correctIndex]?.id ?? options[0]?.id ?? "a")
          : (options[0]?.id ?? "a");

      return {
        id: question.id,
        text: question.text,
        options: options.length > 0 ? options : emptyQuizQuestion(question.id).options,
        correctAnswer,
      };
    }),
  };
}

export function quizDraftToAssessmentQuestions(
  draft: QuestionnaireDraft,
): UniLioAssessmentQuestion[] {
  return draft.questions.map((question) => {
    const options = question.options
      .map((option) => option.label.trim())
      .filter(Boolean);
    const correctOption = question.options.find(
      (option) => option.id === question.correctAnswer,
    );
    const correctAnswer = correctOption?.label.trim() || options[0] || "";

    return {
      id: question.id,
      text: question.text.trim(),
      options,
      correctAnswer,
    };
  });
}

export function isQuestionnaireDraftValid(draft: QuestionnaireDraft): boolean {
  return (
    draft.passingScore >= 1 &&
    draft.passingScore <= 100 &&
    draft.questions.length > 0 &&
    draft.questions.every(
      (question) =>
        question.text.trim().length > 0 &&
        question.options.filter((option) => option.label.trim()).length >= 2 &&
        question.options.every((option) => option.label.trim()) &&
        Boolean(question.correctAnswer),
    )
  );
}

export function serializeQuestionnaireDraft(draft: QuestionnaireDraft): string {
  return JSON.stringify({
    passingScore: draft.passingScore,
    questions: draft.questions.map((question) => ({
      id: question.id,
      text: question.text.trim(),
      options: question.options.map((option) => ({
        id: option.id,
        label: option.label.trim(),
      })),
      correctAnswer: question.correctAnswer,
    })),
  });
}
