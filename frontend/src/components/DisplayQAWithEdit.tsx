import Card from '@/models/Card';
import { IconPencil } from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

interface DisplayQAWithEditProps {
  card: Card;
  idx: number;
  updateCard: (updatedCard: Card) => void;
  onCardDeleted: (cardId: number) => void;
  isOwner: boolean;
}

export const DisplayQAWithEdit = ({
  card,
  idx,
  updateCard,
  onCardDeleted,
  isOwner,
}: DisplayQAWithEditProps) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const questionRef = useRef<HTMLInputElement>(null);
  const answerRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    if (question.trim() === card.question && answer.trim() === card.answer) {
      // no chance, just close turn isEditing to false
      setIsEditing(false);
      return;
    }
    try {
      // make API call to update the card given the question and answer
      const { data: res } = await axios.put(
        `${apiUrl}/card/${card.id}`,
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
      const updatedCard = res.data.updatedCard;
      updateCard(updatedCard);
      setIsEditing(false);
    } catch (er) {
      console.log('Error updating the card: ', er);
      // set the q / a back to the original and close the edit
      setQuestion(card.question);
      setAnswer(card.answer);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${apiUrl}/card/${card.id}`, {
        headers: {
          Authorization: token,
        },
      });
      onCardDeleted(card.id);
    } catch (er) {
      console.log('error deleting card: ', er);
    }
  };

  useEffect(() => {
    setQuestion(card.question);
    setAnswer(card.answer);
  }, [card]);

  return (
    <div className='rounded-xl p-4 bg-neutral-900 w-full flex flex-col items-start font-geist text-2xl text-zinc-300'>
      <div className='flex gap-2'>
        {isOwner && (
          <IconPencil
            className='text-zinc-300 size-6 cursor-pointer hover:text-zinc-100 hover:rotate-2 hover:scale-125 transition duration-150'
            onClick={handleEdit}
          />
        )}
        <h1>Card #{idx}:</h1>
      </div>
      <div className='mt-4 flex flex-col gap-4 w-full'>
        <div className='flex gap-4 p-4 items-center'>
          <h1>Question:</h1>
          <input
            ref={questionRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            readOnly={!isEditing}
            className={twMerge(
              'text-zinc-200 font-sans text-3xl font-bold w-full p-2 transition duration-500',
              isEditing
                ? 'bg-zinc-700 rounded px-2 outline-none focus:outline focus:outline-fuchsia-500/50'
                : 'bg-transparent cursor-default outline-none'
            )}
          />
        </div>
        <div className='flex gap-4 p-4 items-center'>
          <h1>Answer:</h1>
          <input
            ref={answerRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            readOnly={!isEditing}
            className={twMerge(
              'text-zinc-200 font-sans text-3xl font-bold w-full p-2 transition duration-500',
              isEditing
                ? 'bg-zinc-700 rounded px-2 outline-none focus:outline focus:outline-fuchsia-500/50'
                : 'bg-transparent cursor-default outline-none'
            )}
          />
        </div>
      </div>

      <div
        className={twMerge(
          'flex p-4 w-full justify-between transition duration-500',
          isEditing
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        )}
      >
        <div className='flex gap-4'>
          <button
            onClick={() => {
              setIsEditing(false);
            }}
            className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-red-500 text-xl transition-opacity hover:opacity-80'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-green-500 text-xl transition-opacity hover:opacity-80'
          >
            Save
          </button>
        </div>
        <div>
          <button
            onClick={handleDelete}
            className='flex justify-center items-center px-2 py-1 rounded bg-red-500 font-semibold font-geist text-white'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
