import Card from './Card';
import CardData from './CardData';
import SetData from './SetData';
import Tag from './Tag';
import TagData from './TagData';

class Set {
  id: number;
  title: string;
  isPublic: boolean;
  isFavorite: boolean;
  cards: Card[];
  tags: Tag[];

  constructor(data: SetData) {
    this.id = data.id;
    this.title = data.title;
    this.isPublic = data.isPublic;
    this.isFavorite = data.isFavorite;
    this.cards = data.cards
      ? data.cards.map((cardData: CardData) => new Card(cardData))
      : [];
    this.tags = data.tags
      ? data.tags.map((tagData: TagData) => new Tag(tagData))
      : [];
  }
}

export default Set;
