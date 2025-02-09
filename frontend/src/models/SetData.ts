import CardData from './CardData';

interface SetData {
  id: number;
  title: string;
  isPublic: boolean;
  cards?: CardData[];
}

export default SetData;
