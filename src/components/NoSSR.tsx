'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

const NoSSR = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default dynamic(() => Promise.resolve(NoSSR), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-gray-200 h-4 rounded"></div>,
});
