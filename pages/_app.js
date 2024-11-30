// pages/_app.js
import Head from "next/head";
import './styles/globals.css';

function MyApp({ Component, pageProps }) {
  
  return (
    <>
    <Head>
    <title>OpenAI Quickstart</title>
    <link rel="icon" href="/quest.png" />
  </Head>
  <Component {...pageProps} />
  </>
  );
}

export default MyApp;
