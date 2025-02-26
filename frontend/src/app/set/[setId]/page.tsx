'use client';
import Card from '@/models/Card';
import CardData from '@/models/CardData';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import EditQAModal from '@/components/ui/edit-qa-modal';
import { SetTitleTagsSection } from './sections/SetTitleTagsSection';
import { DisplayCardSection } from './sections/DisplayCardSection';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SpecificSetPage() {
  const params = useParams();
  const setId = params.setId ? parseInt(params.setId.toString()) : null;
  const [cards, setCards] = useState<Card[]>([]);
  const [isEditing, setIsEditing] = useState(false); // editing the q / a of a card
  const [editingCard, setEditingCard] = useState<Card | null>(null);
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

  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  if (loading) {
    return <div className='login-text'>Loading</div>;
  }
  return (
    <>
      {setId && <SetTitleTagsSection setId={setId} />}
      {setId && (
        <DisplayCardSection
          cards={cards}
          handleEditCard={handleEditCard}
          updateCard={updateCard}
        />
      )}
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
