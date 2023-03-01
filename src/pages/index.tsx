import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';

export default function Home() {
  const [email, setEmail] = useState<string>('')
  const session = useSession();
  return (
    <div>
      <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="button" onClick={() => signIn("email", { email })}>signin</button>
      {email}
      <div>{session.status === 'authenticated' ? 'Success' : 'hi'}</div>
    </div>
  );
}
