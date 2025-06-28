// pages/_app.js
import Head from "next/head";
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';
import '../styles/globals.css';
import 'katex/dist/katex.min.css';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    if (!localStorage.getItem('language')) {
      localStorage.setItem('language', 'id');
    }
  }, []);

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

export default appWithTranslation(MyApp);
