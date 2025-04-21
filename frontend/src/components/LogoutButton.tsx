'use client';

import { useRouter } from 'next/navigation';
import { IconLogout2 } from '@tabler/icons-react';
import { SidebarButton } from './ui/sidebar';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth');
  };

  return (
    <SidebarButton
      label='Logout'
      icon={<IconLogout2 className='text-neutral-200 h-5 w-5 flex-shrink-0' />}
      onClick={handleLogout}
    />
  );
}
