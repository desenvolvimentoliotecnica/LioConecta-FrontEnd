export type MoodLevel = "great" | "good" | "neutral" | "need_support";

export const MOOD_LEVEL_API: Record<MoodLevel, number> = {
  great: 0,
  good: 1,
  neutral: 2,
  need_support: 3,
};

export const MOOD_LEVEL_FROM_API: Record<number, MoodLevel> = {
  0: "great",
  1: "good",
  2: "neutral",
  3: "need_support",
};

export const MOOD_FEEDBACK: Record<MoodLevel, readonly string[]> = {
  great: [
    "Que energia! Continue assim — seu ânimo contagia a equipe.",
    "Adoramos ver você bem! Aproveite esse dia especial.",
    "Seu humor positivo faz diferença no clima do time. Obrigado por compartilhar!",
    "Excelente! Registramos sua resposta e desejamos um ótimo dia de trabalho.",
    "Que bom saber! Siga cultivando esse bem-estar.",
    "Sua disposição inspira quem está ao redor. Continue nesse ritmo!",
    "Maravilha! O RH agradece por participar do nosso pulso de clima.",
    "Dia produtivo começa com boa energia — você está no caminho certo.",
    "Ficamos felizes com sua resposta. Celebre as pequenas vitórias de hoje!",
    "Ótimo! Lembre-se de pausas curtas para manter esse ânimo ao longo do dia.",
  ],
  good: [
    "Que bom! Um dia equilibrado também é motivo de gratidão.",
    "Registramos sua resposta. Pequenos hábitos saudáveis fazem a diferença.",
    "Obrigado por compartilhar — estamos aqui para apoiar seu bem-estar.",
    "Um dia 'bem' é uma base sólida. Aproveite o que der certo hoje!",
    "Sua participação ajuda o RH a entender o clima da equipe.",
    "Bom saber! Hidrate-se, respire fundo e siga em frente.",
    "Cada dia conta. Esperamos que ele melhore ainda mais!",
    "Registrado com sucesso. Conte conosco quando precisar.",
    "Equilíbrio é saúde — continue cuidando de você.",
    "Agradecemos sua resposta. Um passo de cada vez!",
  ],
  neutral: [
    "Tudo bem estar assim. Dias neutros fazem parte da rotina.",
    "Registramos sua resposta. Pequenas pausas podem ajudar a recarregar.",
    "Obrigado por ser honesto(a). Isso também nos ajuda a cuidar do time.",
    "Se quiser conversar, o RH está disponível — sem julgamentos.",
    "Um dia neutro pode ser um convite para algo novo amanhã.",
    "Sua resposta foi registrada. Cuidar de si é prioridade.",
    "Estamos atentos ao clima da equipe. Você não está sozinho(a).",
    "Às vezes o dia pede calma. Respeite seu ritmo.",
    "Obrigado por participar. Pequenas ações podem mudar o tom do dia.",
    "Registrado! Lembre-se: pedir ajuda também é sinal de força.",
  ],
  need_support: [
    "Obrigado por confiar. Você não precisa passar por isso sozinho(a).",
    "Sua resposta foi registrada de forma confidencial para o RH.",
    "Se precisar, fale com seu gestor ou com o RH — estamos aqui para apoiar.",
    "Reconhecer que precisa de apoio é um passo importante. Conte conosco.",
    "O time de RH pode orientar recursos de bem-estar e acolhimento.",
    "Cuidar da saúde emocional é prioridade. Busque quem possa ouvir você.",
    "Registramos com atenção. Em breve o RH pode entrar em contato, se necessário.",
    "Você merece apoio. Considere agendar uma conversa com People & Culture.",
    "Sua voz importa. Não hesite em pedir ajuda a alguém de confiança.",
    "Estamos do seu lado. Recursos de apoio estão disponíveis pelo RH.",
  ],
};

export function pickRandomFeedbackIndex(): Record<MoodLevel, number> {
  return {
    great: Math.floor(Math.random() * MOOD_FEEDBACK.great.length),
    good: Math.floor(Math.random() * MOOD_FEEDBACK.good.length),
    neutral: Math.floor(Math.random() * MOOD_FEEDBACK.neutral.length),
    need_support: Math.floor(Math.random() * MOOD_FEEDBACK.need_support.length),
  };
}

export function getFeedbackMessage(mood: MoodLevel, index: number): string {
  const messages = MOOD_FEEDBACK[mood];
  return messages[index % messages.length];
}

export const MOOD_OPTIONS: Array<{
  level: MoodLevel;
  label: string;
  icon: string;
}> = [
  { level: "great", label: "Ótimo", icon: "fa-face-grin-beam" },
  { level: "good", label: "Bem", icon: "fa-face-smile" },
  { level: "neutral", label: "Neutro", icon: "fa-face-meh" },
  { level: "need_support", label: "Preciso de apoio", icon: "fa-face-sad-tear" },
];
