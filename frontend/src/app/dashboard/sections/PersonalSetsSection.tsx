'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Set from '@/models/Set';
import SetData from '@/models/SetData';
import { PopupConfirmation } from '../components/PopupConfirmation';
import axios from 'axios';
import { twMerge } from 'tailwind-merge';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const PersonalSetsSection = () => {
  const [sets, setSets] = useState<Set[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('401 Final Review');
  const [isEditing, setIsEditing] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);

  const router = useRouter();

  // const handleBlur = () => {
  //   setIsEditing(false);
  // };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsEditing(false);
      // handleBlur();
    }
  };

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    resizeTextArea();
  };

  const resizeTextArea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const handleDelete = () => {
    setIsPopupOpen(true);
  };

  // on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUserSets = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(`${apiUrl}/user/sets`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        const setsArray = res.data.sets;
        const sets = setsArray.map((set: SetData) => new Set(set));
        setSets(sets);
      } catch (er) {
        console.log('Error fetching sets:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSets();
  }, []);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const textarea = textareaRef.current;
      const textLength = textarea.value.length;
      textarea.focus();
      textarea.setSelectionRange(textLength, textLength);
      resizeTextArea();
      setTimeout(() => {
        textarea.scrollTop = textarea.scrollHeight;
      }, 0);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing && h3Ref.current) {
      const h3ref = h3Ref.current;
      setTimeout(() => {
        h3ref.scrollTop = 0;
      }, 0);
    }
  }, [isEditing, title]);

  useEffect(() => {
    resizeTextArea();
  }, [title]);

  const routeToSet = async (setId: number) => {
    router.push(`/set/${setId}`);
  };

  // handle loading, error, success
  if (loading) {
    return <div className='login-text'>LOADING...</div>;
  }
  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  // success
  return (
    <section className='border border-dashed'>
      <div className='container border'>
        <div className='mt-4 flex gap-12'>
          <h1 className='login-text'>Your Study Sets</h1>
          <input
            className='user-input-bg user-input-text placeholder-zinc-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search...'
          />
        </div>
        {/* TODO: Turn this into a component similar to Card.tsx */}
        <div className='bg-gray-800 rounded-3xl flex -z-10 overflow-hidden outline-white/20 max-w-3xl lg:max-w-full mx-auto'>
          {/* Infinitely horizontally moving study sets */}
          {/* TODO: create a component to display a single study set (title) */}
          <div
            className={twMerge(
              'border-4 border-zinc-400 flex -z-5 relative flex-col bg-zinc-700 rounded-xl w-1/3 h-28 md:h-60 lg:h-72 m-6 group transition duration-150',
              !isEditing && 'hover:bg-zinc-700/75'
            )}
          >
            <PopupConfirmation
              isOpen={isPopupOpen}
              setIsOpen={setIsPopupOpen}
              title={title}
              setId={31} // replace this with the set's setId
            />
            <div className='absolute top-2 left-2'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 -960 960 960'
                width='32'
                // use twMerge
                // later, you set the fill color based on the set.isFavorite ? fill-yellow-200 hover:fill-zinc-400 : fill-zinc-400 hover:fill-yellow-200
                className='fill-zinc-400 hover:fill-yellow-200 transition duration-150 cursor-pointer'
                onClick={() => {
                  console.log('isFavorite star tapped');
                }}
              >
                <path d='m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z' />
              </svg>
            </div>
            <div className='flex-grow flex justify-center items-center mx-2'>
              {isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={title}
                  spellCheck='false'
                  onChange={handleTextAreaChange}
                  // onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className='flex font-set-title caret-white text-center resize-none focus:outline-none focus:ring-0 transition duration-150 bg-transparent overflow-hidden w-full h-auto max-h-40'
                />
              ) : (
                <h3
                  ref={h3Ref}
                  className='flex justify-center font-set-title text-center overflow-hidden break-words w-full h-auto max-h-40 hover:underline transition duration-150 cursor-pointer'
                  onClick={() => {
                    if (!isEditing) {
                      router.push(`/set/${31}`);
                    }
                  }}
                >
                  {title}
                </h3>
              )}
            </div>

            <div
              className={twMerge(
                'flex w-5/6 justify-between self-end mx-auto mb-4 transition duration-150',
                isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              )}
            >
              <button
                className={twMerge(
                  'hover:underline font-geist text-xl',
                  isEditing ? 'text-lime-500' : 'text-orange-500'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  isEditing ? setIsEditing(false) : setIsEditing(true);
                  console.log('Clicked the rename / done button');
                }}
              >
                {isEditing ? 'Done' : 'Rename'}
              </button>
              <button
                className='text-red-500 hover:underline font-geist text-xl'
                onClick={(e) => {
                  e.stopPropagation();
                  isEditing
                    ? (setTitle(''),
                      textareaRef.current && textareaRef.current.focus())
                    : handleDelete();

                  console.log('Clicked the delete / clear button');
                }}
              >
                {isEditing ? 'Clear' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        <div className='mt-24 border max-w-lg mx-auto min-h-96 flex flex-col gap-2'>
          {sets.map((set, index) => (
            <div key={index}>
              <button
                className='login-text'
                onClick={() => routeToSet(set.id)}
              >
                {set.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
