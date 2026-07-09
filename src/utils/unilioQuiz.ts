export type UniLioQuizOption = {
  id: string;
  label: string;
};

export type UniLioQuizQuestion = {
  id: string;
  text: string;
  options: UniLioQuizOption[];
  correctAnswer: string;
};

export type UniLioQuizPayload = {
  passingScore: number;
  questions: UniLioQuizQuestion[];
};

export function parseUniLioQuizJson(quizJson?: string | null, fallbackPassingScore = 70): UniLioQuizPayload | null {
  if (!quizJson?.trim()) return null;

  try {
    const raw = JSON.parse(quizJson) as {
      passingScore?: number;
      questions?: Array<{
        id: string;
        text: string;
        options: UniLioQuizOption[];
        correctAnswer?: string;
        correct?: string;
      }>;
    };

    if (!Array.isArray(raw.questions) || raw.questions.length === 0) {
      return null;
    }

    return {
      passingScore: raw.passingScore ?? fallbackPassingScore,
      questions: raw.questions.map((q) => ({
        id: q.id,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer ?? q.correct ?? "",
      })),
    };
  } catch {
    return null;
  }
}
