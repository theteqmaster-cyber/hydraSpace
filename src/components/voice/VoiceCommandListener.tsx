'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VoiceCommandListener() {
  const router = useRouter();

  useEffect(() => {
    const handleCommand = (event: any) => {
      const command = event.detail;
      console.log('Mphathi Command Received:', command);

      if (command.startsWith('NAVIGATE_')) {
        const target = command.replace('NAVIGATE_', '').toLowerCase();
        switch (target) {
          case 'dashboard': router.push('/'); break;
          case 'calendar': router.push('/calendar'); break;
          case 'timetable': router.push('/timetable'); break;
          case 'courses': router.push('/courses'); break;
          case 'settings': router.push('/settings'); break;
          case 'signup': router.push('/signup'); break;
          case 'login': router.push('/login'); break;
          default: console.warn('Unknown navigation target:', target);
        }
      } else if (command.startsWith('SEARCH_')) {
        const query = command.replace('SEARCH_', '');
        // Search logic could go here
        console.log('Searching for:', query);
      }
    };

    window.addEventListener('MPHATHI_COMMAND', handleCommand);
    return () => window.removeEventListener('MPHATHI_COMMAND', handleCommand);
  }, [router]);

  return null;
}
