import Head from "next/head";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css'; 
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math'; 
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ModalPrompt from '/components/ModalPrompt';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function Home() {
  const [isGenerating, setIsGenerating] = useState([]); // Array to track generating state for each question
  const [isShow, setIsShow] = useState([]); // Control visibility of generated questions
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "Mudah",
    type: "Esai",
    title: "",
    description: "",
    answer: "",
    topic: ""
  }]); // Array of questions
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Load Tally script
    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openTallyPopup = () => {
    Tally.openPopup('m61EBN', {
      layout: 'modal', // Open as a centered modal
      width: 700, // Set the width of the modal
      autoClose: 5000, // Close the popup 5 seconds after form was submitted (in ms)
      onOpen: () => {
        console.log('Popup opened');
      },
      onClose: () => {
        console.log('Popup closed');
      },
    });
  };

  const handleModalSubmit = (data) => {
    data?.map((item) => {
      setQuestions((prev) => [
        ...prev,
        {
          prompt: item?.prompt,
          difficulty: item?.difficulty,
          type: item?.type,
          title: "",
          description: "",
          answer: "",
          topic: "",
        },
      ]);
      // Add a new generating state for the new question
      setIsGenerating((prev) => [...prev, false]);
    });
  };

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
      type: "Esai",
      title: "",
      description: "",
      answer: "",
      topic: ""
    }]);
    setIsGenerating((prev) => [...prev, false]); // Add a new generating state
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index); // Remove question at index
    const updatedIsGenerating = isGenerating.filter((_, i) => i !== index); // Remove corresponding generating state
    setQuestions(updatedQuestions);
    setIsGenerating(updatedIsGenerating);
    setIsShow(prev => prev.filter(i => i !== index)); // Optionally remove from show state
  };

  async function onGenerate(event, index) {
    event.preventDefault();
    const updatedIsGenerating = [...isGenerating];
    updatedIsGenerating[index] = true; // Set the specific question's loading state to true
    setIsGenerating(updatedIsGenerating);

    const { prompt, difficulty, type } = questions[index];
  
    try {
      const result = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt, type, difficulty, mode: "detail" }),
      });
  
      const response = await result.json(); 
      const data = response.result;
  
      // Parsing respon CSV
      const [title, description, answer, topic] = data?.split("|->").map(item => item.trim());
  
      // Validasi jika semua elemen tersedia
      if (title && description && answer && topic) {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          title,
          description,
          answer,
          topic,
        };
        setQuestions(updatedQuestions);
        setIsShow((prev) => [...prev, index]);
      } else {
        throw new Error("Response format is invalid");
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      updatedIsGenerating[index] = false; 
      setIsGenerating(updatedIsGenerating);
    }
  }

  return (
    <>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/quest.png" />
      </Head>
      <ModalPrompt isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} />
      <div className="p-[8px] md:p-[24px] flex justify-center">
        <div className="flex justify-center mb-[8px]">
          <div className="max-w-[500px] w-full">
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
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    {questions.length > 1 &&(
                    <div className="w-[60px] hover:opacity-[0.8] cursor-pointer" onClick={() => removeQuestion(index)}>
                      <img src="/ic-close.svg" className="w-[24px]"/>
                    </div>
                    )}
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
                    <div className="flex flex-col justify-center w-full md:max-w-[200px]">
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
                          className="bg-gray-50 w-full md:max-w-[200px] border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5"
                        >
                          <option value="Esai">Esai</option>
                          <option value="PG">PG</option>
                        </select>
                        <div className="md:flex items-center gap-2 justify-end w-full md:w-auto hidden">
                          <button 
                            type="submit" 
                            disabled={isGenerating[index]} // Check the specific question's loading state
                            className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
                          >
                             Generate
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleVisibility(index)} 
                            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
                          >
                            {isShow.includes(index) ? 'Tutup' : 'Buka'}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center w-full md:max-w-[200px] md:hidden">
                      <div className="flex items-center gap-2 justify-end w-full md:w-auto md:hidden">
                          <button 
                            type="submit" 
                            disabled={isGenerating[index]} // Check the specific question's loading state
                            className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
                          >
                            Generate
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleVisibility(index)} 
                            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
                          >
                            {isShow.includes(index) ? 'Tutup' : 'Buka'}
                          </button>
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
                      previewOptions={{
                        remarkPlugins: [remarkMath], // Enable parsing of math syntax
                        rehypePlugins: [rehypeKatex], // Enable rendering of math
                      }}
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
                      previewOptions={{
                        remarkPlugins: [remarkMath], // Enable parsing of math syntax
                        rehypePlugins: [rehypeKatex], // Enable rendering of math
                      }}
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
        <div className="flex justify-between md:justify-end px-2 md:px-0 md:pr-5 gap-2 w-full mb-2">
          <button 
            type="button" 
            onClick={openModal} 
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5"
          >
            Prompt Soal
          </button>
          <button 
            type="button" 
            onClick={addQuestion} 
            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5"
          >
            Tambah Soal
          </button>
          <button      
          type="button" 
          onClick={openTallyPopup} 
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5 md:block hidden" >
            Review
            </button>
        </div>
        <div className="flex md:hidden justify-between md:justify-end px-2 md:px-0 md:pr-5 gap-2 w-full mb-4">
        <button      
          type="button" 
          onClick={openTallyPopup} 
          className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5" >
            Review
            </button>
        </div>
      </div>
    </>
  );
}
