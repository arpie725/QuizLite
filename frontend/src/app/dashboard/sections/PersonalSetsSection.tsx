'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Set from '@/models/Set';
import SetData from '@/models/SetData';
import { PopupConfirmation } from '../components/PopupConfirmation';
import axios from 'axios';
import { twMerge } from 'tailwind-merge';
import { DisplayCard } from '@/components/DisplayCard';
import { DisplayCardBackground } from '@/components/DisplayCardBackground';
import { NewSetUpload } from '@/components/ui/new-set-upload';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const token = localStorage.getItem('token');

export const PersonalSetsSection = () => {
  const [sets, setSets] = useState<Set[]>([]);
  const [isSetsEmpty, setIsSetsEmpty] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingSetId, setEditingSetId] = useState(-1);
  const [deletingSetId, setDeletingSetId] = useState(-1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);

  const router = useRouter();

  // const handleBlur = () => {
  //   setIsEditing(false);
  // };

  const handleSetRename = async (setId: number, setTitle: string) => {
    // make the API call to rename the set
    try {
      // check if title and setTitle are the same
      if (title === setTitle) {
        // no change was made, don't do anything
        setIsEditing(false);
        return;
      }
      console.log('making API call to rename the study set to: ' + title);
      await axios.put(
        `${apiUrl}/study-set/${setId}`,
        {
          title: title,
        },
        {
          headers: {
            Authorization: token,
          },
        }
      );
      // Update the sets state with the new title
      setSets(
        sets.map(
          (set) => (set.id === setId ? { ...set, title: title } : set) // Update the correct set
        )
      );
      setIsEditing(false);
    } catch (er) {
      // TODO: handle errors
      // NOTE: there can be many errors (duplicate entry, empty title, etc.)
      // Prob just need to display the specific error message recieved from the backend
      // Prob need a renameError state
      console.error('Error renaming the set: ', er);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    setId: number,
    setTitle_: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      try {
        // make the API call to rename the set
        await handleSetRename(setId, setTitle_);
      } catch (er) {
        console.error('Error renaming the set: ', er);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      // stop editing
      setTitle(setTitle_);
      setIsEditing(false);
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
        // sort the sets to maintain same ordering
        const sortedSets = sets.sort(
          (a: { id: number }, b: { id: number }) => a.id - b.id
        );
        setSets(sortedSets);
        setIsSetsEmpty(sets.length === 0 ? true : false);
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
    <section className='mt-24 border border-dashed'>
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
        <DisplayCardBackground
          className={twMerge(!isSetsEmpty && 'grid grid-cols-3')}
        >
          {/* Infinitely horizontally moving study sets */}
          {/* TODO: create a component to display a single study set (title) */}
          {isSetsEmpty && (
            <NewSetUpload
              onClick={() => {
                console.log('Tapped');
              }}
            ></NewSetUpload>
          )}
          {sets.map((set) => (
            <DisplayCard
              key={set.id}
              className={twMerge(
                !isEditing && 'hover:bg-zinc-600',
                isEditing && editingSetId == set.id && 'bg-zinc-600'
              )}
            >
              {deletingSetId === set.id && (
                <PopupConfirmation
                  key={set.id}
                  isOpen={isPopupOpen}
                  setIsOpen={setIsPopupOpen}
                  title={set.title}
                  setId={set.id}
                  onSetDeleted={() => {
                    // update the sets
                    setSets((prevSets) =>
                      prevSets.filter((s) => s.id !== set.id)
                    );
                    setIsSetsEmpty(sets.length === 0 ? true : false);
                    setDeletingSetId(-1);
                  }}
                />
              )}
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
                {isEditing && editingSetId === set.id ? (
                  <textarea
                    ref={textareaRef}
                    value={title}
                    spellCheck='false'
                    onChange={handleTextAreaChange}
                    onKeyDown={(e) => handleKeyDown(e, set.id, set.title)}
                    className='flex font-set-title caret-white text-center resize-none focus:outline-none focus:ring-0 transition duration-150 bg-transparent overflow-hidden w-full h-auto max-h-40'
                  />
                ) : (
                  <h3
                    ref={h3Ref}
                    className='flex justify-center font-set-title text-center overflow-hidden break-words w-full h-auto max-h-40 hover:underline transition duration-150 cursor-pointer'
                    onClick={() => {
                      router.push(`/set/${set.id}`);
                    }}
                  >
                    {set.title}
                  </h3>
                )}
              </div>

              <div
                className={twMerge(
                  'invisible flex w-5/6 justify-between self-end mx-auto mb-4 transition duration-150',
                  isEditing && editingSetId === set.id && 'visible',
                  !isEditing && 'group-hover:visible'
                )}
              >
                <button
                  className={twMerge(
                    'hover:underline font-geist text-xl',
                    isEditing ? 'text-lime-500' : 'text-orange-500'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isEditing) {
                      handleSetRename(set.id, set.title);
                    } else {
                      setTitle(set.title);
                      setEditingSetId(set.id);
                      setIsEditing(true);
                    }
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
                      : (setDeletingSetId(set.id), handleDelete());
                  }}
                >
                  {isEditing ? 'Clear' : 'Delete'}
                </button>
              </div>
            </DisplayCard>
          ))}
        </DisplayCardBackground>

        {/* for dev */}
        <div className='mt-24 mb-8 border max-w-sm mx-auto flex flex-col p-4'>
          <h1 className='mb-4 border-b login-text'>Sets:</h1>
          {sets.map((set, index) => (
            <div key={index}>
              <h1 className='font-geist text-xl text-zinc-300 font-bold'>
                {set.title}
              </h1>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
