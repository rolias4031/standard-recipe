import React, { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import Redirect from 'components/util/Redirect';
import { Session } from 'next-auth';
import LoadingPage from 'components/display/LoadingPage';

interface PageGuardProps<> {
  children: (session: Session) => ReactNode;
  redirectPath: string;
}

function PageGuard({ children, redirectPath }: PageGuardProps) {
  const { data: session, status } = useSession();

  if (session) {
    return <>{children(session)}</>;
  }

  if (status === 'loading') {
    return <LoadingPage />
  }

  if (status === 'unauthenticated') {
    return <Redirect path={redirectPath} />;
  }

  return null;
}

export default PageGuard;
