import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { runMigrations } from '../database/migrations';

export default function RootLayout() {

  useEffect(() => {
    runMigrations();
  }, []);

  return <Slot />;
}
