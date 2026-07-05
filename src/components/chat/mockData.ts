export type ChatMessage = {
  id: string;
  senderId: string;
  text: string;
  subject?: string;
  timestamp: string;
  dateLabel?: string;
};

export type ChatConversation = {
  id: string;
  name: string;
  avatar: string;
  headline?: string;
  pronouns?: string;
  connectionLevel?: string;
  verified?: boolean;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
  priority: boolean;
  messages: ChatMessage[];
};

export const MOCK_CONVERSATIONS: ChatConversation[] = [
  {
    id: "gabriela",
    name: "Gabriela Souza",
    avatar: "/avatar-maria-silva.png",
    headline: "Tech Recruiter | XP Inc.",
    lastMessage: "InMail Oportunidade de trabalho na XP Inc.",
    lastMessageDate: "14 de abr.",
    unreadCount: 1,
    priority: true,
    messages: [
      {
        id: "g1",
        senderId: "gabriela",
        subject: "Oportunidade de trabalho na XP Inc.",
        text: "Olá! Vi seu perfil e acredito que você seria um ótimo fit para uma vaga de Software Engineer Backend na XP Inc. Podemos conversar?",
        timestamp: "10:32",
        dateLabel: "14 DE ABR.",
      },
    ],
  },
  {
    id: "cinthia",
    name: "Cinthia S.",
    avatar: "/avatar-julia-santos.png",
    headline: "Headhunter | Recruiter | Linkedin Specialist | ATS | GITHUB",
    pronouns: "(ela, she, ella)",
    connectionLevel: "2º",
    verified: true,
    lastMessage: "Estou com uma vaga para Software Engineer Backend",
    lastMessageDate: "13 de mar.",
    unreadCount: 0,
    priority: true,
    messages: [
      {
        id: "c1",
        senderId: "cinthia",
        subject: "Exciting opportunity at Exadel",
        text: "Estou com uma vaga para Software Engineer Backend. A posição é remota e o time é excelente. Tem interesse em saber mais?",
        timestamp: "17:42",
        dateLabel: "13 DE MAR.",
      },
    ],
  },
  {
    id: "bruna",
    name: "Bruna Januário",
    avatar: "/avatar-marketing.png",
    headline: "Marketing Digital | Brand Strategy",
    lastMessage: "Obrigada pelo retorno sobre a campanha!",
    lastMessageDate: "10 de mar.",
    unreadCount: 0,
    priority: true,
    messages: [
      {
        id: "b1",
        senderId: "bruna",
        text: "Obrigada pelo retorno sobre a campanha! Vamos alinhar os próximos passos na reunião de quinta.",
        timestamp: "09:15",
        dateLabel: "10 DE MAR.",
      },
    ],
  },
  {
    id: "juliana",
    name: "Juliana Santos",
    avatar: "/avatar-rh.png",
    headline: "Analista de RH | People & Culture",
    lastMessage: "Confirmado o onboarding para segunda-feira",
    lastMessageDate: "5 de mar.",
    unreadCount: 0,
    priority: false,
    messages: [
      {
        id: "j1",
        senderId: "juliana",
        text: "Confirmado o onboarding para segunda-feira. Te envio o link da sala virtual por e-mail.",
        timestamp: "14:20",
        dateLabel: "5 DE MAR.",
      },
    ],
  },
  {
    id: "alan",
    name: "Alan Reis Sc...",
    avatar: "/avatar-carlos-mendes.png",
    headline: "Engenheiro de Software | Full Stack",
    lastMessage: "Conseguiu revisar o PR que enviei?",
    lastMessageDate: "28 de fev.",
    unreadCount: 0,
    priority: false,
    messages: [
      {
        id: "a1",
        senderId: "alan",
        text: "Conseguiu revisar o PR que enviei? Preciso do feedback para seguir com o deploy.",
        timestamp: "11:05",
        dateLabel: "28 DE FEV.",
      },
    ],
  },
];

export const CURRENT_USER_ID = "me";
