'use client';
import Card from '@/models/Card';
import { useEffect, useRef, useState } from 'react';
import FlipCard from '@/components/ui/flip-card';
import { motion, AnimatePresence } from 'framer-motion';

interface DisplayCardSectionProps {
  cards: Card[];
  handleEditCard: (card: Card) => void;
  updateCard: (card: Card) => void;
}

export const DisplayCardSection = ({
  cards,
  handleEditCard,
  updateCard,
}: DisplayCardSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const flipRef = useRef<(() => void) | null>(null);

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const goToNextCard = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const goToPreviousCard = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
          goToNextCard();
          break;
        case 'ArrowLeft':
          goToPreviousCard();
          break;
        case 'ArrowUp':
        case 'ArrowDown':
          if (flipRef.current) {
            flipRef.current();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
  }, [cards]);

  return (
    <section className='border border-dashed'>
      <div className='border container'>
        <div className='flex flex-col my-32 overflow-hidden px-20 pt-32'>
          <div className='w-full h-96 relative'>
            {cards.length > 0 && (
              <AnimatePresence
                initial={false}
                custom={direction}
              >
                <motion.div
                  key={cards[currentIndex].id}
                  variants={cardVariants}
                  initial='enter'
                  animate='center'
                  exit='exit'
                  custom={direction}
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className='absolute w-full h-full'
                >
                  <FlipCard
                    key={cards[currentIndex].id}
                    card={cards[currentIndex]}
                    idx={currentIndex + 1}
                    tot={cards.length}
                    updateCard={updateCard}
                    onEdit={handleEditCard}
                    flipCard={(flipFn) => (flipRef.current = flipFn)}
                  />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <div className='mt-4 flex font-geist text-2xl gap-4 justify-center items-center'>
            <button
              onClick={goToPreviousCard}
              className='bg-zinc-300 rounded-full px-3'
            >
              {'<'}
            </button>
            <button
              onClick={goToNextCard}
              className='bg-zinc-300 rounded-full px-3'
            >
              {'>'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
