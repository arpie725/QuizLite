'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('no token found!');
      router.push('/auth');
    }
    // TODO: token can exist but be a faulty token

    // if valid token, navigate to the dashboard
    if (token) {
      router.push('/dashboard');
    }
  }, []);
  return <div></div>;
}
