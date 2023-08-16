import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UrlObject } from 'url';

interface RedirectProps {
  path: string | UrlObject;
  shallow?: boolean;
}

function Redirect({ path, shallow }: RedirectProps) {
  const router = useRouter();
  useEffect(() => {
    router.push(path, undefined, {
      shallow,
    });
  });
  return null;
}

export default Redirect;
