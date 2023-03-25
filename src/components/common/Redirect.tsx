import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

interface RedirectProps {
  path: string;
}

function Redirect({ path }: RedirectProps) {
  const router = useRouter();
  useEffect(() => {
    router.push(path);
  });
  return null;
}

export default Redirect;
