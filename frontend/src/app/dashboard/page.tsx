'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/sections/HeaderSection';
import axios from 'axios';
import { PersonalSetsSection } from './sections/PersonalSetsSection';
import { PublicSetsSection } from './sections/PublicSetsSection';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DashboardPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUsername = async () => {
      setLoading(true);
      try {
        const { data: res } = await axios.get(`${apiUrl}/user`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        const username = res.data.username;
        setUsername(username);
      } catch (er) {
        console.error('Error fetching username:', er);
        setError(`ERROR: ${(er as any).response.data.message}`);
        // error fetching user, so take the user back to the auth page
        // remove any token in localStorage
        localStorage.removeItem('token');
        router.push('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchUsername();
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
    <div className='mt-12'>
      <div className='mx-14'>
        <h1 className='login-text'>
          Hi, <span className='text-gray-400'>{username}!</span>
        </h1>
      </div>
      <PersonalSetsSection />
      <PublicSetsSection />
    </div>
  );
};

export default DashboardPage;
