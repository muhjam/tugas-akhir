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
        {/* Primary Meta Tags */}
        <title>Jam Math - AI-Powered Math Problem Generator</title>
        <meta name="title" content="Jamjam Math Quest - AI-Powered Math Problem Generator" />
        <meta name="description" content="Generate custom math problems and worksheets with AI. Perfect for teachers, students, and parents looking for personalized math exercises." />
        <meta name="keywords" content="math problems, math generator, AI math, education, mathematics, worksheets, math exercises, learning math" />
        <meta name="author" content="Math Quest Team" />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
        <link rel="icon" href="/math.png" />
        <link rel="canonical" href="https://mathquest.com" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mathquest.com/" />
        <meta property="og:title" content="Math Quest - AI-Powered Math Problem Generator" />
        <meta property="og:description" content="Generate custom math problems and worksheets with AI. Perfect for teachers, students, and parents." />
        <meta property="og:image" content="https://mathquest.com/images/math-quest-og.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://mathquest.com/" />
        <meta property="twitter:title" content="Math Quest - AI-Powered Math Problem Generator" />
        <meta property="twitter:description" content="Generate custom math problems and worksheets with AI. Perfect for teachers, students, and parents." />
        <meta property="twitter:image" content="https://mathquest.com/images/math-quest-twitter.jpg" />

        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#3b82f6" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
