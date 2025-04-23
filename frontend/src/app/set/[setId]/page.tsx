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
import { NewCardEdit } from '@/components/NewCardEdit';
import { AnimatePresence, motion } from 'framer-motion';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function generateStaticParams() {
  return []; // No static pages generated
}

export default function SpecificSetPage() {
  const params = useParams();
  const setId = params.setId ? parseInt(params.setId.toString()) : null;
  const [isOwner, setIsOwner] = useState(false);
  const [author, setAuthor] = useState('');
  const [cards, setCards] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [showAllCards, setShowAllCards] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // editing the q / a of a card
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isShuffled, setIsShuffled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newCardEditRef = useRef<HTMLDivElement>(null);

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
        const author_ = res.data.set.user.username;
        const cardsArray = res.data.cards;
        const cards = cardsArray.map((card: CardData) => new Card(card));
        cards.sort((a: Card, b: Card) => a.id - b.id);
        setAuthor(author_);
        setCards(cards);
        setCurrentCard(cards.length > 0 ? cards[0] : null);
      } catch (er) {
        console.log('Error fetching cards:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    const determineUserStatus = async () => {
      // determines if the user owns the current study set
      const token = localStorage.getItem('token');
      try {
        // get the user and all sets belonging to the user
        const { data: res } = await axios.get(`${apiUrl}/user/sets`, {
          headers: {
            Authorization: token,
          },
        });
        console.log(res);
        const cur_user_sets = res.data.sets;
        // search the cur_user_sets to see if the id exists
        const ownsSet = cur_user_sets.some(
          (set: { id: number }) => set.id === setId
        );
        setIsOwner(ownsSet);
        // for dev:
        if (ownsSet) {
          console.log('User owns the set');
        } else {
          console.log("User doesn't own the set");
        }
      } catch (er) {
        console.log('Error retrieving the user and sets: ', er);
      }
    };

    determineUserStatus();
    fetchAllCards();
  }, []);

  useEffect(() => {
    if (isCreatingCard && newCardEditRef.current) {
      newCardEditRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isCreatingCard]);

  const updateCard = (updatedCard: Card) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );
    if (currentCard?.id === updatedCard.id) {
      setCurrentCard(updatedCard);
    }
  };

  const addCard = (newCard: Card) => {
    setCards((prevCards) => [...prevCards, newCard]);
  };

  const handleCardMenu = () => {
    console.log('card menu');
    // if shuffled, unshuffle
    if (isShuffled) {
      handleShuffle();
    }
    if (showAllCards) {
      setIsCreatingCard(false);
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

  const handleCardDeleted = (cardId: number) => {
    setCards(cards.filter((card) => card.id !== cardId));
  };

  const handleAddCard = () => {
    // open the card menu
    // if shuffled, unshuffle
    if (isShuffled) {
      handleShuffle();
    }
    setShowAllCards(true);
    // set isCreatingCard to true
    setIsCreatingCard(true);
  };

  const handleWrongAnswer = () => {
    apiCardStatus('WRONG');
  };

  const handleCorrectAnswer = () => {
    apiCardStatus('CORRECT');
  };

  const apiCardStatus = async (status: string) => {
    console.log('Changing status to ', status);
    // should set isComplete to true
    const token = localStorage.getItem('token');
    if (!currentCard) return;
    try {
      // update the card
      const { data: res } = await axios.put(
        `${apiUrl}/card/${currentCard.id}`,
        {
          status: status,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      const updatedCard = new Card(res.data.updatedCard);
      updateCard(updatedCard);
    } catch (er) {
      console.log('error setting isComplete to True: ', er);
    }
  };

  const handleCurrentCardChange = (card: Card) => {
    setCurrentCard(card);
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

  const links = linksBase.filter((link) => {
    const alwaysVisible = ['Individual Card', 'All Cards', 'Shuffle'];
    if (!isOwner) {
      return alwaysVisible.includes(link.title);
    }
    return (
      !showAllCards ||
      (link.title !== 'Wrong' &&
        link.title !== 'Correct' &&
        link.title != 'Shuffle')
    );
  });

  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  if (loading) {
    return <div className='login-text'>Loading</div>;
  }
  return (
    <>
      {setId && (
        <SetTitleTagsSection
          setId={setId}
          isOwner={isOwner}
          author={author}
        />
      )}
      {!showAllCards && (
        <DisplayCardSection
          cards={cards}
          handleEditCard={handleEditCard}
          updateCard={updateCard}
          onCurrentCardChange={handleCurrentCardChange}
          isOwner={isOwner}
        />
      )}
      {showAllCards && (
        <section className=''>
          <div className='my-24 container'>
            {/* show all cards */}
            <div className='flex flex-col gap-8'>
              {cards.map((card, idx) => (
                <div
                  key={card.id}
                  className='flex'
                >
                  <DisplayQAWithEdit
                    updateCard={updateCard}
                    onCardDeleted={handleCardDeleted}
                    card={card}
                    idx={idx + 1} // 1 indexed
                    isOwner={isOwner}
                  />
                </div>
              ))}
              {/* add new card here */}
              <AnimatePresence>
                {setId && isCreatingCard && (
                  <motion.div
                    ref={newCardEditRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <NewCardEdit
                      setId={setId}
                      isOpen={isCreatingCard}
                      setIsOpen={setIsCreatingCard}
                      addCard={addCard}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
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
