'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Set from '@/models/Set';
import SetData from '@/models/SetData';
import axios from 'axios';
import { twMerge } from 'tailwind-merge';
import { DisplayCard } from '@/components/DisplayCard';
import { DisplayCardBackground } from '@/components/DisplayCardBackground';
import { NewSetUpload } from '@/components/ui/new-set-upload';
import ToggleSwitch from '@/components/ui/toggle-switch';
import { SetCard } from '../components/SetCard';
import { NewSetCard } from '../components/NewSetCard';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [editingSetError, setEditingSetError] = useState<string | null>(null);

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
      setEditingSetError(null);
      setIsEditing(false);
    } catch (er) {
      // TODO: handle errors
      // NOTE: there can be many errors (duplicate entry, empty title, etc.)
      // Prob just need to display the specific error message recieved from the backend
      // Prob need a renameError state
      console.error('Error renaming the set: ', er);
      if (axios.isAxiosError(er) && er.response) {
        setEditingSetError(er.response.data.message || 'Failed to rename set');
      } else {
        setEditingSetError('An unexpected error occurred');
      }
    }
  };

  const handleDelete = (setId: number) => {
    setSets((prevSets) => {
      const updatedSets = prevSets.filter((s) => s.id !== setId);
      setIsSetsEmpty(updatedSets.length === 0);
      return updatedSets;
    });
    setDeletingSetId(-1);
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

  const onEditStart = (setId: number, setTitle_: string) => {
    setEditingSetId(setId);
    setTitle(setTitle_);
    setIsEditing(true);
    setEditingSetError(null);
  };

  const onEditEnd = () => {
    setIsEditing(false);
    setEditingSetId(-1);
    setEditingSetError(null);
  };

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
          <AnimatePresence mode='wait'>
            {isSetsEmpty && !isAdding && (
              <motion.div
                key='new-set-upload'
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <NewSetUpload
                  onClick={() => {
                    // want to add a new study set box
                    setIsAdding(true);
                  }}
                />
              </motion.div>
            )}
            {isAdding && isSetsEmpty && (
              <motion.div
                key='new-set-card'
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                layout
              >
                <NewSetCard
                  newTitle={newTitle}
                  isPublic={isPublic}
                  newSetError={newSetError}
                  isSetsEmpty={isSetsEmpty}
                  onTitleChange={(title) => {
                    setNewTitle(title);
                    setNewSetError(null);
                  }}
                  onPublicToggle={() => setIsPublic((prev) => !prev)}
                  onCreate={handleAddNewSet}
                  onCancel={() => {
                    setIsAdding(false);
                    setNewTitle('');
                    setNewSetError(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {/* Add a new set here */}
            {isAdding && !isSetsEmpty && (
              <motion.div
                key='new-set-card'
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                layout
              >
                <NewSetCard
                  newTitle={newTitle}
                  isPublic={isPublic}
                  newSetError={newSetError}
                  isSetsEmpty={isSetsEmpty}
                  onTitleChange={(title) => {
                    setNewTitle(title);
                    setNewSetError(null);
                  }}
                  onPublicToggle={() => setIsPublic((prev) => !prev)}
                  onCreate={handleAddNewSet}
                  onCancel={() => {
                    setIsAdding(false);
                    setNewTitle('');
                    setNewSetError(null);
                  }}
                />
              </motion.div>
            )}
            {/* Mapping through all users' study sets */}
            {filteredSets.map((set) => (
              <motion.div
                key={set.id}
                layout
                initial={{ opacity: 0, y: 20 }} // Enter from below
                animate={{ opacity: 1, y: 0 }} // Fade in and slide up
                exit={{ opacity: 0, y: -20 }} // Exit upward
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <SetCard
                  key={set.id}
                  set={set}
                  isEditing={isEditing}
                  editingSetId={editingSetId}
                  deletingSetId={deletingSetId}
                  setDeletingSetId={setDeletingSetId}
                  title={title}
                  isPopupOpen={isPopupOpen}
                  onRename={handleSetRename}
                  onDelete={() => handleDelete(set.id)}
                  onFavoriteToggle={handleIsFavorite}
                  onEditStart={onEditStart}
                  onEditEnd={onEditEnd}
                  onTitleChange={setTitle}
                  setIsPopupOpen={setIsPopupOpen}
                  onNavigate={(setId) => router.push(`/set/${setId}`)}
                  editingSetError={
                    set.id === editingSetId ? editingSetError : null
                  }
                  setEditingSetError={setEditingSetError}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </DisplayCardBackground>
      </div>
    </section>
  );
};
