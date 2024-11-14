import Head from "next/head";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function Home() {
  const [result, setResult] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShow, setIsShow] = useState([]); // Control visibility of generated questions
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "Mudah",
    type: "Essay",
    title: "",
    description: "",
    answer: "",
    topic: ""
  }]); // Array of questions
  
  const toggleVisibility = (index) => {
    setIsShow((prev) => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    // Add a new question template
    setQuestions([...questions, {
      prompt: "",
      difficulty: "Mudah",
      type: "Essay",
      title: "",
      description: "",
      answer: "",
      topic: ""
    }]);
  };

  async function onGenerate(event, index) {
    event.preventDefault();
    setIsGenerating(true);
    const { prompt, difficulty, type } = questions[index];
    
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt, type, difficulty }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      const validatedJson = JSON.parse(data.result);
      if (validatedJson) {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          title: validatedJson.title,
          description: validatedJson.description,
          answer: validatedJson.answer,
          topic: validatedJson.topics,
        };
        setQuestions(updatedQuestions);
        setIsShow((prev) => [...prev, index]);
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
        <div className="flex justify-center mb-[8px]">
          <div className="max-w-[500px]">
            <h1 className="text-[24px] font-[600] text-center">Pembuatan Soal Matematika Otomatis</h1>
            <h2 className="text-[14px] text-gray-800 font-[500] text-center">
              Pembuatan soal matematika tingkat SMA otomatis menggunakan AI <br />
              dikembangkan oleh <a href="https://www.instagram.com/muhamadjamaludinpad/" className="font-[600] hover:underline">Jamjam</a>.
            </h2>
          </div>
        </div>
      </div>

      <div className="max-w-[1080px] w-full container mx-auto">
        <div className="p-[8px] md:p-[24px] flex flex-col justify-center">
          {questions.map((question, index) => (
            <div className="max-w-[1080px] w-full shadow-md p-4" key={index}>
              <div className="flex flex-col mb-[8px]">
                <form onSubmit={(e) => onGenerate(e, index)}>
                  <div className="flex items-center gap-2">
                    <div className="w-full">
                      <label htmlFor="prompt" className="text-[14px] font-[600]">Prompt:</label>
                      <input 
                        type="text" 
                        id="prompt" 
                        value={question.prompt} 
                        onChange={(e) => handleInputChange(index, 'prompt', e.target.value)} 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                        placeholder="Contoh: Buatkan soal tentang Aritmatika" 
                        required 
                      />
                    </div>
                    <div className="flex flex-col justify-center w-full max-w-[200px]">
                      <label className="text-[14px] font-[600]">Tingkat Kesulitan:</label>
                      <select 
                        value={question.difficulty} 
                        onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)} 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      >
                        <option value="Mudah">Mudah</option>
                        <option value="Normal">Normal</option>
                        <option value="Sulit">Sulit</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-center w-full">
                      <label className="text-[14px] font-[600]">Tipe Soal:</label>
                      <div className="flex gap-2">
                      <select 
                        value={question.type} 
                        onChange={(e) => handleInputChange(index, 'type', e.target.value)} 
                        className="bg-gray-50 w-full max-w-[200px] border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      >
                        <option value="Essay">Essay</option>
                        <option value="PG">PG</option>
                      </select>
                      <div className="flex items-center gap-2 justify-end w-full md:w-auto">
                    <button 
                      type="submit" 
                      className={`${isGenerating ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
                    >
                      {isGenerating ? 'Loading...' : 'Generate'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => toggleVisibility(index)} 
                      className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
                    >
                      {isShow.includes(index) ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  </div>
                    </div>
                  </div>
                </form>
              </div>

              {isShow.includes(index) && (
                <div>
                  <div className="flex flex-col mb-[8px]">
                    <label htmlFor="title" className="text-[14px] font-[600]">Judul:</label>
                    <input 
                      type="text" 
                      id="title" 
                      value={question.title} 
                      onChange={(e) => handleInputChange(index, 'title', e.target.value)} 
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                      required 
                    />
                  </div>
                  <div className="mb-[8px]">
                    <label htmlFor="description" className="text-[14px] font-[600]">Deskripsi:</label>
                    <MDEditor 
                      id="description" 
                      data-color-mode="light" 
                      value={question.description} 
                      onChange={(value) => handleInputChange(index, 'description', value)} 
                      className="focus:outline-none focus:ring-0 focus:border-none"
                    />
                  </div>
                  <div className="mb-[8px]">
                    <label htmlFor="answer" className="text-[14px] font-[600]">Jawaban:</label>
                    <MDEditor 
                      id="answer" 
                      data-color-mode="light" 
                      value={question.answer} 
                      onChange={(value) => handleInputChange(index, 'answer', value)} 
                      className="focus:outline-none focus:ring-0 focus:border-none"
                    />
                  </div>
                  <div className="flex flex-col mb-[8px]">
                    <label htmlFor="topic" className="text-[14px] font-[600]">Topik:</label>
                    <input 
                      type="text" 
                      id="topic" 
                      value={question.topic} 
                      onChange={(e) => handleInputChange(index, 'topic', e.target.value)} 
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                      required 
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end mr-4 pr-2">
          <button 
            type="button" 
            onClick={addQuestion} 
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
          >
            Tambah Soal
          </button>
        </div>
      </div>
    </>
  );
}
