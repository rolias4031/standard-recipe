import HomeDock from 'components/home/HomeDock';
import Home, { HomeView } from 'components/home/Home';
import { useRouter } from 'next/router';
import Redirect from 'components/common/Redirect';

function useExtractHomePageQueryParams() {
  const router = useRouter();
  const { view } = router.query;
  if (view && !Array.isArray(view)) {
    return { view };
  }
  return { view: 'recipes' };
}

export default function HomePage() {
  const { view } = useExtractHomePageQueryParams();
  if (view) {
    return (
      <HomeDock>
        {(homeData) => <Home homeData={homeData} view={view as HomeView} />}
      </HomeDock>
    );
  }
  return (
    <Redirect
      path={{
        pathname: '/me',
        query: { view: 'recipes' },
      }}
      shallow
    />
  );
}
