export type Practice = {
  sentence: string;
  ru: string;
  blank: string;
  answer: string;
  prompt: string;
  response: string;
  other: string;
};
export const practice: Practice[] = [
  {
    sentence: "السلام عليكم",
    ru: "Здравствуйте",
    blank: "السلام ____",
    answer: "عليكم",
    prompt: "السلام عليكم",
    response: "وعليكم السلام",
    other: "مع السلامة",
  },
  {
    sentence: "ب ا ب",
    ru: "Соберите по буквам باب — дверь",
    blank: "بَ = b + ____ (латиницей)",
    answer: "a",
    prompt: "Какая буква называется «ба»?",
    response: "ب",
    other: "ت",
  },
  {
    sentence: "ب ي ت",
    ru: "Соберите по буквам بيت — дом",
    blank: "بَيْت — дом, в диалекте b____t (латиницей)",
    answer: "ē",
    prompt: "Какая буква называется «мим»?",
    response: "م",
    other: "ن",
  },
  {
    sentence: "أنا من روسيا",
    ru: "Я из России",
    blank: "أنا من ____ (Россия)",
    answer: "روسيا",
    prompt: "من وين أنت؟",
    response: "أنا من روسيا",
    other: "الحساب لو سمحت",
  },
  {
    sentence: "هي من السعودية",
    ru: "Она из Саудовской Аравии",
    blank: "____ من السعودية (она)",
    answer: "هي",
    prompt: "مين هذي؟",
    response: "هذي سارة",
    other: "أبي قهوة",
  },
  {
    sentence: "الحساب عشرة ريال",
    ru: "Счёт — десять риялов",
    blank: "الحساب ____ ريال (десять)",
    answer: "عشرة",
    prompt: "بكم هذا؟",
    response: "بعشرة ريال",
    other: "أنا من روسيا",
  },
  {
    sentence: "هذا مو غالي",
    ru: "Это недорого",
    blank: "هذا ____ غالي (отрицание)",
    answer: "مو",
    prompt: "وين البيت؟",
    response: "البيت هنا",
    other: "أبي شاي",
  },
  {
    sentence: "أبي قهوة بدون سكر",
    ru: "Я хочу кофе без сахара",
    blank: "أبي قهوة بدون ____ (сахар)",
    answer: "سكر",
    prompt: "وش تبي؟",
    response: "أبي قهوة لو سمحت",
    other: "مع السلامة",
  },
  {
    sentence: "عندكم مقاس كبير",
    ru: "У вас есть большой размер?",
    blank: "عندكم مقاس ____ (большой)",
    answer: "كبير",
    prompt: "تدفع كاش؟",
    response: "لا، بالبطاقة",
    other: "أنا من روسيا",
  },
  {
    sentence: "أنا أشتغل في الرياض",
    ru: "Я работаю в Эр-Рияде",
    blank: "أنا ____ في الرياض (работаю)",
    answer: "أشتغل",
    prompt: "تتكلم عربي؟",
    response: "شوي، أتعلم عربي",
    other: "الحساب عشرة ريال",
  },
  {
    sentence: "عندي موعد اليوم",
    ru: "У меня сегодня запись",
    blank: "عندي ____ اليوم (запись)",
    answer: "موعد",
    prompt: "يعطيك العافية",
    response: "الله يعافيك",
    other: "من وين أنت؟",
  },
  {
    sentence: "ممكن تعيد لو سمحت",
    ru: "Повторите, пожалуйста",
    blank: "ممكن ____؟ (повторить)",
    answer: "تعيد",
    prompt: "تتكلم عربي؟",
    response: "أنا ما أتكلم عربي زين",
    other: "أبي مقاس كبير",
  },
];
