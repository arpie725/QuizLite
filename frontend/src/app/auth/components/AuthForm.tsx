'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const AuthForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log('sending ' + username + ' ' + password + ' to the server');

    // make api call with the username, password
    fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, password: password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message);
          });
        }
        // continue if successful
        return response.json();
      })
      .then((data) => {
        console.log('Response from backend: ', data);
        // handle the response
        const { token } = data.data;
        console.log('TOKEN = ' + token);
        // put the token in local storage
        localStorage.setItem('token', data.data.token);
        // route to the url/dashboard page
        router.push('/dashboard');
      })
      .catch((error) => {
        console.error('Login error:', error.message);
      });
  };

  return (
    <section className='flex justify-center items-center'>
      <div className='w-fit border border-dashed p-24'>
        <div className='flex flex-col gap-8'>
          {/* form */}
          <form onSubmit={handleSubmit}>
            <div className='flex flex-col gap-8'>
              {/* username */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='username'
                  className='login-text'
                >
                  Username
                </label>
                <input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='max-w-sm user-input-bg user-input-text'
                />
              </div>
              {/* password */}
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='password'
                  className='login-text'
                >
                  Password
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='max-w-sm user-input-bg user-input-text'
                />
              </div>
              {/* buttons */}
              <div className='flex flex-col gap-4'>
                <button
                  type='submit'
                  className='bg-purple-pink max-w-sm py-2 text-white text-3xl font-semibold font-geist outline-none'
                >
                  Login
                </button>
              </div>
            </div>
          </form>
          <button className='flex mt-4 w-fit mx-auto text-fuchsia-300 text-lg font-geist font-semibold opacity-50 hover:opacity-100 transition duration-300 outline-none'>
            Register
          </button>
        </div>
      </div>
    </section>
  );
};
