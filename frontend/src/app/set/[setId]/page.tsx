'use client';
import Card from '@/models/Card';
import CardData from '@/models/CardData';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EditQAModal from '@/components/ui/edit-qa-modal';
import { SetTitleTagsSection } from './sections/SetTitleTagsSection';
import { DisplayCardSection } from './sections/DisplayCardSection';
import {
  IconArrowsShuffle,
  IconCheck,
  IconLayersSubtract,
  IconList,
  IconPlus,
  IconRectangle,
  IconX,
} from '@tabler/icons-react';
import { FloatingDock } from '@/components/ui/floating-dock';
import { twMerge } from 'tailwind-merge';
import { DisplayQAWithEdit } from '@/components/DisplayQAWithEdit';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SpecificSetPage() {
  const params = useParams();
  const setId = params.setId ? parseInt(params.setId.toString()) : null;
  const [cards, setCards] = useState<Card[]>([]);
  const [showAllCards, setShowAllCards] = useState(true);
  const [isEditing, setIsEditing] = useState(false); // editing the q / a of a card
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEditCard = (card: Card) => {
    setEditingCard(card);
    setIsEditing(true);
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
        cards.sort((a: Card, b: Card) => a.id - b.id);
        setCards(cards);
      } catch (er) {
        console.log('Error fetching cards:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCards();
  }, []);

  const updateCard = (updatedCard: Card) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
  };

  const handleCardMenu = () => {
    console.log('card menu');
    // if shuffled, unshuffle
    if (isShuffled) {
      handleShuffle();
    }
    setShowAllCards((prev) => !prev);
  };

  const handleShuffle = () => {
    if (isShuffled) {
      // unshuffle
      setCards((prevCards) => {
        const sortedCards = [...prevCards].sort(
          (a: Card, b: Card) => a.id - b.id
        );
        return sortedCards;
      });
      setIsShuffled(false);
    } else {
      setCards((prevCards) => {
        const shuffledCards = [...prevCards];
        for (let i = shuffledCards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledCards[i], shuffledCards[j]] = [
            shuffledCards[j],
            shuffledCards[i],
          ];
        }
        return shuffledCards;
      });
      setIsShuffled(true);
    }
  };

  const handleAddCard = () => {
    console.log('add card');
  };

  const handleWrongAnswer = () => {
    console.log('wrong');
  };

  const handleCorrectAnswer = () => {
    console.log('correct');
  };

  const linksBase = [
    {
      title: showAllCards ? 'Individual Card' : 'All Cards',
      icon: showAllCards ? (
        <IconLayersSubtract
          className={twMerge('h-full w-full text-neutral-700')}
        />
      ) : (
        <IconList className={twMerge('h-full w-full text-neutral-700')} />
      ),
      onClick: handleCardMenu,
    },

    {
      title: 'Shuffle',
      icon: (
        <IconArrowsShuffle
          className={twMerge(
            'h-full w-full',
            isShuffled ? 'text-cyan-500' : 'text-neutral-700'
          )}
        />
      ),
      onClick: handleShuffle,
    },
    {
      title: 'Add Card',
      icon: <IconPlus className='h-full w-full text-neutral-700' />,
      onClick: handleAddCard,
    },
    {
      title: 'Wrong',
      icon: <IconX className='h-full w-full text-red-500' />,
      onClick: handleWrongAnswer,
    },
    {
      title: 'Correct',
      icon: <IconCheck className='h-full w-full text-lime-500' />,
      onClick: handleCorrectAnswer,
    },
  ];

  const links = linksBase.filter(
    (link) =>
      !showAllCards ||
      (link.title !== 'Wrong' &&
        link.title !== 'Correct' &&
        link.title != 'Shuffle')
  );

  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  if (loading) {
    return <div className='login-text'>Loading</div>;
  }
  return (
    <>
      {setId && <SetTitleTagsSection setId={setId} />}
      {!showAllCards && (
        <DisplayCardSection
          cards={cards}
          handleEditCard={handleEditCard}
          updateCard={updateCard}
        />
      )}
      {showAllCards && (
        <section className='border border-dashed'>
          <div className='my-24 container border'>
            {/* show all cards */}
            <div className='flex flex-col gap-8'>
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className='flex'
                >
                  <DisplayQAWithEdit
                    updateCard={updateCard}
                    card={card}
                    idx={idx + 1} // 1 indexed
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className='fixed bottom-0 left-0 w-full flex items-center justify-center px-4 py-4'>
        <FloatingDock items={links} />
      </div>

      {editingCard && (
        <EditQAModal
          modalSize='lg'
          isOpen={isEditing}
          setIsOpen={setIsEditing}
          card={editingCard}
          updateCard={updateCard}
        />
      )}
    </>
  );
}
