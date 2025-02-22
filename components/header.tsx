'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainMenu } from './main-menu';
import { GuestMenu } from './guest-menu';
import { ProMenu } from './pro-menu';
import { supabase } from "@/lib/supabase"


const Header = () => {
  const [menuType, setMenuType] = useState<'guest' | 'main' | 'premium'>('guest');

  useEffect(() => {
    const checkUserSession = async () => {
      const session = localStorage.getItem('session');

      if (session) {
        const parsedSession = JSON.parse(session);
        if (parsedSession?.user?.email) {
          const profileId = localStorage.getItem('profileId');

          if (profileId) {
            // Fetch profile data from Supabase
            const { data, error } = await supabase
              .from('profiles')
              .select('tier_id')
              .eq('id', profileId)
              .single();

            if (!error && data?.tier_id) {
              setMenuType('premium'); // User has a tier
            } else {
              setMenuType('main'); // Logged in but no tier
            }
          } else {
            setMenuType('main'); // Logged in but no profileId
          }
        }
      }
    };

    checkUserSession();
  }, []);

  return (
    <header className="bg-black">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {menuType === 'guest' && <GuestMenu />}
          {menuType === 'main' && <MainMenu />}
          {menuType === 'premium' && <ProMenu />}
          <Link href="/">
            <Image
              src="https://oppstech.cloud/assets/chiongster-logo.jpg"
              alt="ChioNightOut"
              width={120}
              height={30}
              className="h-8 w-auto ml-3"
            />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

