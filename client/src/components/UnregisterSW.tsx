'use client';

import { useEffect } from 'react';

export default function UnregisterSW() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((boolean) => {
            if (boolean) {
              console.log('🧹 Successfully unregistered stale Service Worker:', registration);
            }
          });
        }
      });
    }
  }, []);

  return null;
}
