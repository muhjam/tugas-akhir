// pages/_app.js
import Head from "next/head";
import { appWithTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import '../i18n';
import '../styles/globals.css';
import 'katex/dist/katex.min.css';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // Pastikan komponen sudah di-mount di sisi klien
  useEffect(() => {
    setMounted(true);
  }, []);

  // Jangan render apa-apa sampai komponen di-mount
  // Ini mencegah masalah hydration
  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Math Quest</title>
        <link rel="icon" href="/math.png" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
