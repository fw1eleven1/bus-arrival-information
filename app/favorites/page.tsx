'use client';

import dynamic from 'next/dynamic';
import Loading from '@/components/Loading';

const FavoritesContent = dynamic(() => import('./FavoritesContent'), {
  ssr: false,
  loading: () => <Loading />,
});

export default function FavoritesPage() {
  return <FavoritesContent />;
}
