import { useRouter } from 'next/navigation';

/**
 * should include the logout button
 *
 */

export const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    // remove the token from localStorage
    localStorage.removeItem('token');
    // bring the client back to the auth page
    router.push('auth');
  };

  return (
    <div className='z-10 fixed top-0 w-full backdrop-blur border'>
      <div className='my-4 px-24 flex justify-between'>
        <h1 className='login-text'>QuizLite</h1>
        {/* Insert future nav bar items below */}
        <button
          className='text-zinc-300 text-2xl font-extrabold font-geist hover:text-zinc-200 transition duration-150'
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};
