import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Roboto, Roboto_Mono } from '@next/font/google';
import '../styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['100', '300', '400', '500', '700'],
});

const roboto_mono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto_mono',
});

const queryClient = new QueryClient();

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <QueryClientProvider client={queryClient}>
        <main className={`${roboto.className} ${roboto_mono.variable}`}>
          <div id="app-root">
            <Component {...pageProps} />
          </div>
          <div id="modal-root" />
        </main>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
