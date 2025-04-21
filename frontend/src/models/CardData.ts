interface CardData {
  id: number;
  question: string;
  answer: string;
  status: 'NOT_ASSESSED' | 'CORRECT' | 'WRONG';
  setId: number;
}

export default CardData;
