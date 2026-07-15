export type BirthdayCardTemplate = {
  id: string;
  label: string;
  url: string;
};

/** Cartões candy/cartoon para parabenização de aniversário. */
export const BIRTHDAY_CARD_TEMPLATES: BirthdayCardTemplate[] = [
  { id: "bolo", label: "Bolo festivo", url: "/birthdays/cards/card-01-bolo.png" },
  { id: "cupcake", label: "Cupcake", url: "/birthdays/cards/card-02-cupcake.png" },
  { id: "presentes", label: "Presentes", url: "/birthdays/cards/card-03-presentes.png" },
  { id: "baloes", label: "Balões", url: "/birthdays/cards/card-04-baloes.png" },
  { id: "sorvete", label: "Sorvete", url: "/birthdays/cards/card-05-sorvete.png" },
  { id: "chapeu", label: "Chapéu de festa", url: "/birthdays/cards/card-06-chapeu.png" },
  { id: "macarons", label: "Macarons", url: "/birthdays/cards/card-07-macarons.png" },
  { id: "foguete", label: "Foguete", url: "/birthdays/cards/card-08-foguete.png" },
  { id: "doces", label: "Doceria", url: "/birthdays/cards/card-09-doces.png" },
  { id: "estrela", label: "Estrela", url: "/birthdays/cards/card-10-estrela.png" },
];

export function defaultBirthdayMessage(personName: string): string {
  const first = personName.trim().split(/\s+/)[0] || personName;
  return `Parabéns, ${first}! 🎉 Que seu dia seja doce, colorido e cheio de alegria. Bom aniversário!`;
}
