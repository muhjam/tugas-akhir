import Head from "next/head";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false },
);


export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [answer, setAnswer] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  async function onGenerate(event) {
    event.preventDefault();
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt}),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log(JSON.parse(data.result))
      const validatedJson = JSON.parse(data.result);
      if(validatedJson){
        setResult(validatedJson);

        setTitle(validatedJson.title);
        setDescription(validatedJson.description);
        setAnswer(validatedJson.answer)
        setTopic(validatedJson.topics);
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/quest.png" />
      </Head>
    <div className="p-[8px] md:p-[24px] flex justify-center">
      <div className="max-w-[1080px] w-full shadow-md p-4">
        <div className="flex justify-center mb-[8px]">
          <div className="max-w-[500px]">
            <h1 className="text-[24px] font-[600] text-center">
              Pembuatan Soal Matematika Otomatis
            </h1>
            <h2 className="text-[14px] text-gray-800 font-[500] text-center">
              Pembuatan soal matematika tingkat SMA otomatis menggunakan AI <br/> dikembangkan oleh <a href="https://www.instagram.com/muhamadjamaludinpad/" className="font-[600] hover:underline">Jamjam</a>.
            </h2>
          </div>
        </div>

        <div className="flex flex-col mb-[8px]">
        <form onSubmit={ onGenerate }>
          <label htmlFor="prompt" className="text-[14px] font-[600]">Prompt:</label>
          <div className="flex w-full gap-2 flex-wrap md:flex-nowrap">
            <input type="text" id="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" placeholder="Contoh: Buatkan soal tentang Aritmatika" required />
            <div className="flex items-center gap-2 justify-end w-full md:w-auto">
              <button type="submit" className={`${isGenerating ? 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600 focus:ring-green-300'} text-white focus:ring-4 focus:outline-none font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center h-fit`}>{isGenerating ? 'Loading...' : 'Generate'}</button>
              <button type="button" className="text-white bg-sky-500 hover:bg-sky-600 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center h-fit" >Export</button>
            </div>
          </div>
          </form>
        </div>

        <div className="flex flex-col mb-[8px]">
          <label htmlFor="title" className="text-[14px] font-[600]">Judul:</label>
          <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" required />
        </div>

        <div className="mb-[8px]">
          <label htmlFor="description" className="text-[14px] font-[600]">deskripsi:</label>
          <MDEditor
            className="focus:outline-none focus:ring-0 focus:border-none"
            id="description"
            data-color-mode="light"
            value={description} 
            onChange={(value) => setDescription(value)} 
          />
        </div>

        <div className="mb-[8px]">
          <label htmlFor="description" className="text-[14px] font-[600]">Jawaban:</label>
          <MDEditor
            className="focus:outline-none focus:ring-0 focus:border-none"
            id="description"
            data-color-mode="light"
            value={answer} 
            onChange={(value) => setDescription(value)} 
          />
        </div>

     <div className="flex flex-col mb-[8px]">
          <label htmlFor="topic" className="text-[14px] font-[600]">Topik:</label>
          <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" required />
      </div>
    </div>
  </div>
  </>
  );
}
