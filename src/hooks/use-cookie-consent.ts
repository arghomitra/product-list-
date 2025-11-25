"use client";

import { useState, useEffect, useCallback } from 'react';

const CONSENT_COOKIE_KEY = 'prolist-cookie-consent';

export function useCookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const consentCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${CONSENT_COOKIE_KEY}=`));
      
      if (consentCookie) {
        setConsent(consentCookie.split('=')[1] === 'true');
      } else {
        setConsent(false);
      }
    } catch (e) {
      setConsent(false);
    }
  }, []);

  const giveConsent = useCallback(() => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 365); // 1 year expiry
    document.cookie = `${CONSENT_COOKIE_KEY}=true;expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    setConsent(true);
  }, []);

  return { consent, giveConsent };
}
