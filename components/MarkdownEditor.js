import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'; // Untuk menangani sintaks matematika di Markdown
import rehypeKatex from 'rehype-katex'; // Untuk rendering LaTeX ke dalam HTML
import 'katex/dist/katex.min.css'; // Import CSS untuk katex agar tampilan matematika lebih rapi

const MarkdownEditor = () => {
  const [markdownText, setMarkdownText] = useState('');

  // Fungsi untuk mengubah input markdown
  const handleChange = (event) => {
    setMarkdownText(event.target.value);
  };

  return (
    <div>
      <h1>Markdown Editor dengan Matematika</h1>
      
      {/* Textarea untuk input markdown */}
      <textarea
        value={markdownText}
        onChange={handleChange}
        placeholder="Tulis Markdown di sini..."
        rows="10"
        style={{ width: '100%' }}
      />
      
      {/* Render Markdown dengan matematika */}
      <div style={{ marginTop: '20px' }}>
        <ReactMarkdown
          children={markdownText}
          remarkPlugins={[remarkMath]} // Menambahkan plugin untuk matematika
          rehypePlugins={[rehypeKatex]} // Menambahkan plugin untuk Katex (render matematika)
        />
      </div>
    </div>
  );
};

export default MarkdownEditor;
