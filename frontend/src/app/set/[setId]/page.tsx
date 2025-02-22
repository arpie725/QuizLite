'use client';
import Card from '@/models/Card';
import CardData from '@/models/CardData';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Set from '@/models/Set';
import Tag from '@/models/Tag';
import TagData from '@/models/TagData';
import { Header } from '@/sections/HeaderSection';
import { TagComponent } from '@/components/Tag';
import { IconPencil, IconPlus } from '@tabler/icons-react';
import Modal from '@/components/ui/modal';
import ToggleSwitch from '@/components/ui/toggle-switch';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const tagColors = [
  'cyan',
  'lime',
  'violet',
  'emarld',
  'indigo',
  'teal',
  'purple',
  'slate',
];

export default function SpecificSetPage() {
  const params = useParams();
  const setId = params.setId;

  const [set, setSet] = useState<Set>();
  const [cards, setCards] = useState<Card[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [cardCount, setCardCount] = useState(0);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    console.log('SUBMIT BUTTON CLICKED');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchAllCards = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(
          `${apiUrl}/study-set/${setId}/cards`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        console.log(res);
        // get data from response
        const cardsArray = res.data.cards;
        const cards = cardsArray.map((card: CardData) => new Card(card));
        const cardCount = res.data.cardCount;
        const set = res.data.set;
        // set data into useState variables to be displayed onto the page
        setSet(set);
        setCardCount(cardCount);
        setCards(cards);
      } catch (er) {
        console.log('Error fetching cards:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    const fetchTags = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(
          `${apiUrl}/study-set/${setId}/tags`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const tagsData: TagData[] = res.data.set.tags;
        const tags = tagsData.map((tagData: TagData) => new Tag(tagData));
        setTags(tags);
      } catch (er) {
        console.log('Error fetching tags: ', er);
        setError(`Error: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAllCards();
    fetchTags();
  }, []);

  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  if (loading) {
    return <div className='login-text'>Loading</div>;
  }
  return (
    <>
      <section className='border border-dashed mt-12'>
        <div className='border container'>
          {/* title / editing options */}
          <div className='flex justify-between'>
            {/* display all tags belonging to the current set */}
            <div className='left-2 top-2 relative'>
              <div className='flex gap-4'>
                <h1 className='text-zinc-300 font-serif text-xl'>Tags:</h1>
                <div className='flex gap-2 justify-center items-center'>
                  {tags.map(({ id, name }) => (
                    <TagComponent
                      key={id}
                      color={tagColors.at(id % tagColors.length)}
                    >
                      {name}
                    </TagComponent>
                  ))}
                  <TagComponent
                    onClick={() => {
                      setIsAddingTag(true);
                    }}
                    className='cursor-pointer group'
                  >
                    {set && (
                      <Modal
                        modalSize='lg'
                        isOpen={isAddingTag}
                        setIsOpen={setIsAddingTag}
                        handleSubmit={handleSubmit}
                        tags={tags}
                        setTags={setTags}
                        set={set}
                      />
                    )}
                    <span className='ml-2 hidden group-hover:inline transition duration-150'>
                      Add Tag
                    </span>
                  </TagComponent>
                </div>
              </div>
            </div>
            {/* display public toggle + option to edit the set title */}
            <div className='flex relative top-2 gap-8'>
              <div className='flex gap-4'>
                <h3 className='font-geist text-xl text-zinc-300'>isPublic</h3>
                <ToggleSwitch
                  onChange={() => {
                    console.log('SWITCH CHANGED');
                  }}
                />
              </div>
              <IconPencil
                className='text-zinc-300 size-8 cursor-pointer'
                onClick={() => {
                  console.log(
                    'TODO: Allow user to edit the name of the study set'
                  );
                }}
              />
            </div>
          </div>
          {/* actual cards / navigations */}
          <div></div>

          <div className='mt-[1000px]'>
            <h1 className='font-geist text-3xl font-semibold text-white'>
              Study set: {set?.title}, # of flashcards: {cardCount}
            </h1>
            <div className='mt-12 flex flex-col gap-12'>
              {cards.map((card, idx) => (
                <div
                  className='flex flex-col'
                  key={idx}
                >
                  <h1 className='login-text'>cardId: {card.id}</h1>
                  <h1 className='login-text'>Quation: {card.question}</h1>
                  <h1 className='login-text'>Answer: {card.answer}</h1>
                  <h1 className='login-text'>
                    {card.isComplete ? 'Completed' : 'Not completed'}
                  </h1>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
