/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAdminAuthCode } from '../lib/api';

const STORAGE_KEY = 'clubs_admin_code';

const AdminContext = createContext({
  adminCode: null,
  setAdminCode: () => {},
  clearAdminCode: () => {},
});

export function AdminProvider({ children }) {
  const [adminCode, setAdminCodeState] = useState(() => {
    if (typeof window === 'undefined') return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setAdminAuthCode(stored);
    return stored;
  });

  useEffect(() => {
    setAdminAuthCode(adminCode);
    if (typeof window !== 'undefined') {
      if (adminCode) {
        window.localStorage.setItem(STORAGE_KEY, adminCode);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [adminCode]);

  const updateAdminCode = (code) => {
    setAdminAuthCode(code);
    setAdminCodeState(code);
  };

  const value = useMemo(
    () => ({
      adminCode,
      setAdminCode: updateAdminCode,
      clearAdminCode: () => updateAdminCode(null),
    }),
    [adminCode]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  return useContext(AdminContext);
}
