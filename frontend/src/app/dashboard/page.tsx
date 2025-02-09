//
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Header } from '@/sections/HeaderSection';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const DashboardPage = () => {
  const router = useRouter();

  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log(token);
    if (!token) {
      console.log('no token found!');
      router.push('/auth');
      return;
    }

    // TODO: use token to get data from server
    // make sure to check if the token is a valid token (jwt.verify in server)
  }, []);

  const handleLogout = () => {
    // remove the token from localStorage
    localStorage.removeItem('token');
    // bring the client back to the auth page
    router.push('auth');
  };

  const fetchUserSets = async () => {
    try {
      const response = await fetch(`${apiUrl}/user/sets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
      } else {
        const data = await response.json();
        console.log(data);
        return data.data;
      }
    } catch (er) {
      throw er;
    }
  };

  return (
    <div>
      <Header />
      <div className='mt-[1000px]'></div>
      <h1 className='text-5xl login-text'>Dashboard!</h1>
      <button
        className='m-24 text-5xl font-bold bg-zinc-300 rounded-full p-4'
        onClick={async () => await fetchUserSets()}
      >
        Study Sets
      </button>
    </div>
  );
};

export default DashboardPage;
