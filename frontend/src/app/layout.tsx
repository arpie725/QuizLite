'use client';
import { Geist, Geist_Mono, Inter, Calistoga } from 'next/font/google';
import './globals.css';
import {
  Sidebar,
  SidebarBody,
  SidebarButton,
  SidebarLink,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import {
  IconArrowLeft,
  IconHome,
  IconPlus,
  IconLayersSubtract,
  IconLogout2,
} from '@tabler/icons-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import LogoutButton from '@/components/LogoutButton';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const calistoga = Calistoga({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400'],
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  const links = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <IconHome className='text-neutral-200 h-5 w-5 flex-shrink-0' />,
    },
    {
      label: 'Study',
      href: '/auth',
      icon: (
        <IconLayersSubtract className='text-neutral-200 h-5 w-5 flex-shrink-0' />
      ),
    },
    {
      label: 'Create',
      href: '/auth',
      icon: <IconPlus className='text-neutral-200 h-5 w-5 flex-shrink-0' />,
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${calistoga.variable} ${inter.variable} antialiased`}
      >
        <div className='rounded-md flex md:flex-row bg-gray-100 dark:bg-neutral-800 w-full h-screen mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden'>
          {!isAuthPage && (
            <SidebarProvider>
              <Sidebar
                open={open}
                setOpen={setOpen}
                // animate={false} // for dev (animates the sidebar)
              >
                <SidebarBody className='h-full justify-between gap-10'>
                  {/* side bar content */}
                  <div className='flex flex-col flex-1 overflow-y-auto overflow-x-hidden'>
                    {/* LOGO */}
                    <h1 className='login-text'>{open ? 'Quizlite' : 'Q'}</h1>
                    <div className='mt-8 flex flex-col gap-2 font-geist'>
                      {links.map((link, idx) => (
                        <SidebarLink
                          key={idx}
                          link={link}
                        />
                      ))}
                    </div>
                    <div className='mt-12 font-geist'>
                      <LogoutButton />
                    </div>
                  </div>
                </SidebarBody>
              </Sidebar>
              <main className='flex-1 overflow-y-auto'>{children}</main>
            </SidebarProvider>
          )}
        </div>
      </body>
    </html>
  );
}
