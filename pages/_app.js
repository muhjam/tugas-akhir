// pages/_app.js
import Head from "next/head";
import './styles/globals.css';

function MyApp({ Component, pageProps }) {
  
  return (
    <>
    <Head>
    <title>Tugas Akhir | Jamjam</title>
    <link rel="icon" href="/math.png" />
  </Head>
  <Component {...pageProps} />
  </>
  );
}

export default MyApp;
