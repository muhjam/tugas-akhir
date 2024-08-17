// pages/_app.js

import './styles/globals.css';
import '@uiw/react-md-editor/markdown-editor.css';
// import '@uiw/react-markdown-preview/dist/markdown.css';

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
