'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Set from '@/models/Set';
import SetData from '@/models/SetData';
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const PersonalSetsSection = () => {

  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // handle loading, error, success
  if (loading) {
    return <div className='login-text'>LOADING...</div>;
  }
  if (error) {
    return <div className='login-text'>{error}</div>;
  }
  // success
  return (
    <section>
      <div className='container'>
        <h1 className='login-text'>Personal Sets Section</h1>
        <div className='mt-24 border max-w-lg mx-auto min-h-96 flex flex-col gap-2'>
          {sets.map((set, index) => (
            <div key={index}>
              <h1 className='login-text'>{set.title}</h1>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
