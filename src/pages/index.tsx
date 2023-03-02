import { useSession } from 'next-auth/react';
import SignInModal from 'components/auth/SignInModal';
import Redirect from 'components/util/Redirect';

export default function Home() {
  const session = useSession();
  return session.status === 'authenticated' ? <div>Home</div> : <Redirect path='/signin' />
}
