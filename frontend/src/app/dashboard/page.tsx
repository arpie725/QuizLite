//
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Header } from '@/sections/HeaderSection';
import axios from 'axios';
import SetData from '@/models/SetData';
import Set from '@/models/Set';
import { PersonalSetsSection } from './sections/PersonalSetsSection';
import { PublicSetsSection } from './sections/PublicSetsSection';

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
    <div>
      <Header />
      <div className='mt-48'></div>
      <h1 className='text-5xl login-text'>Dashboard! - Welcome, {username}</h1>

      <PersonalSetsSection />
      <PublicSetsSection />
    </div>
  );
};

export default DashboardPage;
