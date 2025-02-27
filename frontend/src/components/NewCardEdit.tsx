import Card from '@/models/Card';
import axios from 'axios';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface NewCardEditProps {
  setId: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addCard: (newCard: Card) => void;
}

export const NewCardEdit = ({
  setId,
  isOpen,
  setIsOpen,
  addCard,
}: NewCardEditProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const questionRef = useRef<HTMLInputElement>(null);

  const handleCreateCard = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data: res } = await axios.post(
        `${apiUrl}/card/${setId}`,
        {
          question,
          answer,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      const newCard = res.data;
      console.log(newCard);
      addCard(new Card(newCard));
      setIsOpen(false);
    } catch (er) {
      console.log('Error adding a new card! ', er);
      if (axios.isAxiosError(er) && er.response) {
        setError(er.response.data.message + '!');
      } else {
        setError('An unexpected error occurred');
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        questionRef.current?.focus();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div className='rounded-xl p-4 bg-zinc-500 w-full flex flex-col items-start font-geist text-2xl text-zinc-300'>
      <div className='flex gap-2 items-center justify-center'>
        <h1>New Card:</h1>
        {/* error message */}
        <p className='font-geist font-bold text-red-500 text-xl'>{error}</p>
      </div>
      <div className='mt-4 flex flex-col gap-4 w-full'>
        <div className='flex gap-4 p-4 items-center'>
          <h1>Question:</h1>
          <input
            ref={questionRef}
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (error) {
                setError(null);
              }
            }}
            className='text-zinc-200 font-sans text-3xl font-bold w-full p-2 bg-zinc-700 rounded px-2 outline-none focus:outline focus:outline-fuchsia-500/50'
          />
        </div>
        <div className='flex gap-4 p-4 items-center'>
          <h1>Answer:</h1>
          <input
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (error) {
                setError(null);
              }
            }}
            className='text-zinc-200 font-sans text-3xl font-bold w-full p-2 transition duration-500 bg-zinc-700 rounded px-2 outline-none focus:outline focus:outline-fuchsia-500/50'
          />
        </div>
      </div>

      <div className='flex py-4 gap-4 justify-center items-center transition duration-500 opacity-100 pointer-events-auto'>
        <button
          onClick={() => {
            setIsOpen(false);
          }}
          className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-red-500 text-xl transition-opacity hover:opacity-80'
        >
          Cancel
        </button>
        <button
          onClick={handleCreateCard}
          className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-green-500 text-xl transition-opacity hover:opacity-80'
        >
          Create
        </button>
      </div>
    </div>
  );
};
