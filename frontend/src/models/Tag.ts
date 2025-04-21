import TagData from './TagData';

class Tag {
  id: number;
  name: string;

  constructor(data: TagData) {
    this.id = data.id;
    this.name = data.name;
  }
}

export default Tag;
