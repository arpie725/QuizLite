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
import ToggleSwitch from '@/components/ui/toggle-switch';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const PersonalSetsSection = () => {
  const [sets, setSets] = useState<Set[]>([]);
  const [isSetsEmpty, setIsSetsEmpty] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [title, setTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [editingSetId, setEditingSetId] = useState(-1);
  const [deletingSetId, setDeletingSetId] = useState(-1);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSetError, setNewSetError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const h3Ref = useRef<HTMLHeadingElement>(null);
  const newSetRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleSetRename = async (setId: number, setTitle: string) => {
    const token = localStorage.getItem('token');
    // make the API call to rename the set
    try {
      // check if title and setTitle are the same
      if (title === setTitle) {
        // no change was made, don't do anything
        setIsEditing(false);
        return;
      }
      console.log('making API call to rename the study set to: ' + title);
      const { data: res } = await axios.put(
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
      const updatedSet = res.data.set;
      updateSet(updatedSet);
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

  const updateSet = (updatedSet: Set) => {
    setSets((prevSets) =>
      prevSets.map((set) => (set.id === updatedSet.id ? updatedSet : set))
    );
  };

  const handleIsFavorite = async (setId: number, isFavorite: boolean) => {
    console.log(setId);
    console.log(isFavorite);

    const token = localStorage.getItem('token');
    try {
      const newIsFavorite = !isFavorite;
      const { data: res } = await axios.put(
        `${apiUrl}/study-set/${setId}`,
        {
          isFavorite: newIsFavorite,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(res);
      const updatedSet = res.data.set;
      updateSet(updatedSet);
    } catch (er) {}
  };

  const filteredSets = sets.filter((set) =>
    set.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // .sort((a: Set, b: Set) => {
  //   if (a.isFavorite && !b.isFavorite) return -1;
  //   if (!a.isFavorite && b.isFavorite) return 1;
  //   return a.id - b.id;
  // });

  const handleAddNewSet = async () => {
    const token = localStorage.getItem('token');
    try {
      // create the new set (newTitle, isPublic)
      const { data: res } = await axios.post(
        `${apiUrl}/study-set/`,
        {
          title: newTitle,
          isPublic,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log(res);
      const newSet = res.data.set;
      // bring the user to that newly created set page
      router.push(`/set/${newSet.id}`);
    } catch (er) {
      console.log('Error creating a new set: ', er);
      if (axios.isAxiosError(er) && er.response) {
        setNewSetError(er.response.data.message);
      } else {
        setNewSetError('An unexpected error occurred');
      }
    }
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
        const sortedSets = sets.sort((a: Set, b: Set) => {
          if (a.isFavorite && !b.isFavorite) return -1;
          if (!a.isFavorite && b.isFavorite) return 1;
          return b.id - a.id;
        });

        setSets(sortedSets);
        setIsSetsEmpty(sets.length === 0);
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
    if (isAdding && newSetRef.current) {
      newSetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      const timer = setTimeout(() => {
        newSetRef.current?.focus();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isAdding]);

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
    <section className='mt-12 border border-dashed'>
      <div className='container border'>
        <div className='mt-4 flex justify-center items-center gap-12 py-4'>
          <h1 className='login-text'>Your Study Sets</h1>
          <input
            className='user-input-bg user-input-text placeholder-zinc-500'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search...'
          />
          <button
            onClick={() => {
              setIsAdding(true);
            }}
            className='px-2 py-1 bg-zinc-300 rounded font-geist hover:bg-fuchsia-300 '
          >
            New Set +
          </button>
        </div>
        {/* TODO: Turn this into a component similar to Card.tsx */}
        <DisplayCardBackground
          className={twMerge(!isSetsEmpty && 'grid grid-cols-2 lg:grid-cols-3')}
        >
          {filteredSets.length === 0 && searchTerm !== '' && (
            <div className='flex justify-center items-center w-full h-96 col-span-3'>
              <p className='login-text'>
                No sets found matching '{searchTerm}'
              </p>
            </div>
          )}

          {/* Infinitely horizontally moving study sets */}
          {/* TODO: create a component to display a single study set (title) */}
          {/* TODO: Create a smooth disappear */}
          {isSetsEmpty && !isAdding && (
            <NewSetUpload
              onClick={() => {
                // want to add a new study set box
                setIsAdding(true);
              }}
            />
          )}
          {/* Add a new set here */}
          {isAdding && (
            <DisplayCard className='border-2 border-lime-500/50'>
              <div>
                {/* ispublic toggle switch */}
                <div className='p-2 flex justify-end items-center gap-4'>
                  <p className='font-geist text-zinc-300'>
                    {isPublic ? 'public' : 'private'}
                  </p>
                  <ToggleSwitch
                    onChange={() => {
                      setIsPublic((prev) => !prev);
                    }}
                  />
                </div>
                {/* input for set title */}
                <div className='absolute-center w-full px-4'>
                  <input
                    // TODO: have it focus on the input
                    ref={newSetRef}
                    className='w-full bg-zinc-200 rounded outline-none focus:outline focus:outline-fuchsia-500/50 caret-black text-zinc-700 font-mono font-semibold placeholder-zinc-500 p-2 text-xl'
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      setNewSetError(null);
                    }}
                    placeholder='Title...'
                  />
                  <p className='mt-2 font-geist text-red-500 text-center h-4'>
                    {newSetError}
                  </p>
                </div>
                {/* cancel and save options */}
                <div className='w-full px-4 absolute bottom-1 flex justify-between py-4 gap-4 transition duration-500 opacity-100 pointer-events-auto'>
                  <button
                    onClick={() => {
                      setIsAdding(false);
                      // clear the newTitle
                      setNewTitle('');
                    }}
                    className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-red-500 text-xl transition-opacity hover:opacity-80'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNewSet}
                    className='flex justify-center items-center px-2 py-1 rounded bg-zinc-500 font-semibold font-geist text-green-500 text-xl transition-opacity hover:opacity-80'
                  >
                    Create
                  </button>
                </div>
              </div>
            </DisplayCard>
          )}
          {filteredSets.map((set) => (
            <DisplayCard
              key={set.id}
              className={twMerge(
                !isEditing &&
                  'hover:bg-zinc-600 hover:border-fuchsia-500/50 transition duration:250',
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
                    setSets((prevSets) => {
                      const updatedSets = prevSets.filter(
                        (s) => s.id !== set.id
                      );
                      setIsSetsEmpty(updatedSets.length === 0);
                      return updatedSets;
                    });
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
                  className={twMerge(
                    'transition duration-150 cursor-pointer',
                    set.isFavorite
                      ? 'fill-yellow-200 hover:fill-zinc-400'
                      : 'fill-zinc-400 hover:fill-yellow-200'
                  )}
                  onClick={() => handleIsFavorite(set.id, set.isFavorite)}
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
      </div>
    </section>
  );
};
