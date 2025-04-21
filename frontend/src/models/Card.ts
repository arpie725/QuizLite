import CardData from './CardData';

class Card {
  id: number;
  question: string;
  answer: string;
  status: 'NOT_ASSESSED' | 'CORRECT' | 'WRONG';
  setId: number;

  constructor(data: CardData) {
    this.id = data.id;
    this.question = data.question;
    this.answer = data.answer;
    this.status = data.status || 'NOT_ASSESSED'; // can this be undefined?
    this.setId = data.setId;
  }
}

export default Card;
