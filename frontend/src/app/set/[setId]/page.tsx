'use client';
import Card from '@/models/Card';
import CardData from '@/models/CardData';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Set from '@/models/Set';
import { Header } from '@/sections/HeaderSection';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SpecificSetPage() {
  const params = useParams();
  const setId = params.setId;

  const [set, setSet] = useState<Set>();
  const [cards, setCards] = useState<Card[]>([]);
  const [cardCount, setCardCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchAllCards();
  }, []);

  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  if (loading) {
    return <div className='login-text'>Loading</div>;
  }
  return (
    <>
      <Header />
      <section className='mt-24 pb-[1000px]'>
        <div className='container'>
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
      </section>
    </>
  );
}
