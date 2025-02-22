import CardData from './CardData';
import TagData from './TagData';

interface SetData {
  id: number;
  title: string;
  isPublic: boolean;
  cards?: CardData[];
  tags?: TagData[];
}

export default SetData;
