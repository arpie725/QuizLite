'use client';
import { useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const router = useRouter();
  // TODO: logged in users should be rerouted to the dashboard
  useEffect(() => {
    const token = localStorage.getItem('token');
    // TODO: make sure token is valid

    if (token) {
      // route to the dashboard
      router.push('/dashboard');
    }
  }, []);

  return (
    <div>
      {/* temp: TODO: create section */}
      <AuthForm />
    </div>
  );
};

export default AuthPage;
