import PageGuard from 'components/auth/PageGuard';
import StandardRecipeLogo from 'components/display/StandardRecipeLogo';
import NavBar from 'components/NavBar';

export default function Home() {
  return (
    <PageGuard redirectPath="/signin">
      {(session) => (
        <div className="">
          <NavBar session={session} />
        </div>
      )}
    </PageGuard>
  );
}
