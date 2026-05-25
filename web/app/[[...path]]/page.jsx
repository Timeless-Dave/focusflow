'use client';

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('@/AppShell'), {
  ssr: false,
  loading: () => null
});

export default function Page() {
  return <AppShell />;
}
