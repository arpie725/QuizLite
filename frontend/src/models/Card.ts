import CardData from './CardData';

class Card {
  id: number;
  question: string;
  answer: string;
  isComplete: boolean;
  setId: number;
  
  constructor(data: CardData) {
    this.id = data.id;
    this.question = data.question;
    this.answer = data.answer;
    this.isComplete = data.isComplete; // can this be undefined?
    this.setId = data.setId;
  }
}

export default Card;
