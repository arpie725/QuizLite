//
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Header } from '@/sections/HeaderSection';
import axios from 'axios';
import SetData from '@/models/SetData';
import Set from '@/models/Set';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DashboardPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [sets, setSets] = useState<Set[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // TODO: validate token properly
    if (!token) {
      // TEMP
      router.push('/auth');
      return;
    }

    const fetchUserSets = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(`${apiUrl}/user/sets`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        const username = res.data.user.username;
        setUsername(username);
        const setsArray = res.data.sets;
        const sets = setsArray.map((set: SetData) => new Set(set));
        // populate the sets array
        setSets(sets);
      } catch (er) {
        console.error('Error fetching sets:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSets();
    // call helper function to fetch all user sets

    // load the data into an array of set objects??
  }, []);

  if (loading) {
    // display a loading div
    return <div className='login-text'>LOADING...</div>;
  }

  if (error) {
    // display an error div
    return <div className='login-text'>{error}</div>;
  }

  return (
    <div>
      <Header />
      <div className='mt-48'></div>
      <h1 className='text-5xl login-text'>Dashboard! - Welcome, {username}</h1>
      <div className='mt-24 border max-w-lg mx-auto min-h-96 flex flex-col gap-2'>
        {sets.map((set, index) => (
          <div key={index}>
            <h1 className='login-text'>{set.title}</h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
