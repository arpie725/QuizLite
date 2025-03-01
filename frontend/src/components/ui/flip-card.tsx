import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import Card from '@/models/Card';
import { IconPencil } from '@tabler/icons-react';
import EditQAModal from '@/components/ui/edit-qa-modal';

interface FlipCardProps extends React.HTMLAttributes<HTMLDivElement> {
  card: Card;
  idx: number;
  tot: number;
  rotate?: 'x' | 'y';
  updateCard: (card: Card) => void;
  onEdit: (card: Card) => void;
  flipCard?: (Flipfn: () => void) => void;
}

export default function FlipCard({
  card,
  idx,
  tot,
  rotate = 'y',
  updateCard,
  onEdit,
  flipCard,
  className,
  ...props
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const q = card.question;
    const a = card.answer;
    const s = card.status;
    setQuestion(q);
    setAnswer(a);
    setStatus(s);
  }, [card]);

  useEffect(() => {
    if (flipCard) {
      flipCard(() => setIsFlipped((prev) => !prev));
    }
  });

  const rotationClass = {
    x: ['[transform:rotateX(180deg)]'],
    y: ['[transform:rotateY(180deg)]'],
  };
  const flipStyle = rotationClass[rotate][0];
  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div
      className={cn('group w-full h-96 [perspective:1000px]', className)}
      {...props}
    >
      <div
        className={cn(
          'relative h-full rounded-2xl transition-all duration-700 [transform-style:preserve-3d]',
          isFlipped && flipStyle
        )}
        onDoubleClick={handleFlip}
      >
        {/* Front */}
        <div className='relative flashcard-style text-slate-200 flex items-start justify-center'>
          <div className='absolute top-2 left-2'>
            <p className='font-geist text-zinc-500 text-lg'>
              <span className='text-zinc-300'>{idx}</span>/{tot}
            </p>
          </div>
          <div className='absolute top-2 right-2'>
            <p className='font-geist text-zinc-500 text-3xl'>
              {status === 'CORRECT' && '✅'}
              {status === 'WRONG' && '❌'}
            </p>
          </div>
          <div className='mt-12 flex flex-col gap-12 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <h1 className='title-font'>Question:</h1>
              <IconPencil
                onClick={() => onEdit(card)}
                className='text-zinc-300 size-6 cursor-pointer hover:text-zinc-100 hover:rotate-2 hover:scale-125 transition duration-150'
              />
            </div>
            <h3 className='text-zinc-200 font-geist font-bold text-5xl'>
              {question}
            </h3>
          </div>
        </div>

        {/* Back */}
        <div
          className={cn(
            'flashcard-style text-slate-200 flex items-start justify-center',
            flipStyle
          )}
        >
          <div className='absolute top-2 left-2'>
            <p className='font-geist text-zinc-500 text-lg'>
              <span className='text-zinc-300'>{idx}</span>/{tot}
            </p>
          </div>
          <div className='absolute top-2 right-2'>
            <p className='font-geist text-zinc-500 text-3xl'>
              {status === 'CORRECT' && '✅'}
              {status === 'WRONG' && '❌'}
            </p>
          </div>
          <div className='mt-12 flex flex-col gap-12 text-center'>
            <div className='flex items-center justify-center gap-2'>
              <h1 className='title-font'>Answer:</h1>
              <IconPencil
                onClick={() => onEdit(card)}
                className='text-zinc-300 size-6 cursor-pointer hover:text-zinc-100 hover:rotate-2 hover:scale-125 transition duration-150'
              />
            </div>
            <h3 className='text-zinc-200 font-geist font-bold text-4xl'>
              {answer}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
