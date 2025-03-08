import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css'; 
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math'; 
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ModalPrompt from '/components/ModalPrompt';
import Login from '/components/Login';
import users from '../users/index.json';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false },
);

export default function Home() {
  const [isGenerating, setIsGenerating] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "C1",
    type: "Esai",
    title: "",
    description: "",
    answer: "",
    topic: ""
  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("")
  const [nama, setNama] = useState("")

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Logika login
    const storedNupkt = localStorage.getItem('nupkt');
    const storedPassword = localStorage.getItem('password');
    
    if (storedNupkt && storedPassword) {
      const user = users.find(user => user.NUPTK === storedNupkt && user.Password === storedPassword);
      if (user) {
        setNupkt(storedNupkt)
        setNama(user.Nama)
        setIsLoggedIn(true);
      }
    }

    const script = document.createElement('script');
    script.src = "https://tally.so/widgets/embed.js";
    script.async = true;
    document.body.appendChild(script);
    setIsLoading(false);
  }, []);

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
    setQuestions([...questions, {
      prompt: "",
      difficulty: "C1",
      type: "Esai",
      title: "",
      description: "",
      answer: "",
      topic: ""
    }]);
    setIsGenerating((prev) => [...prev, false]);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    const updatedIsGenerating = isGenerating.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    setIsGenerating(updatedIsGenerating);
    setIsShow(prev => prev.filter(i => i !== index));
  };

  async function onGenerate(event, index) {
    event.preventDefault();
    setIsWaiting(true);
    const updatedIsGenerating = [...isGenerating];
    updatedIsGenerating[index] = true;
    setIsGenerating(updatedIsGenerating);

    const { prompt, difficulty, type } = questions[index];
  
    try {
      const result = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, type, difficulty, mode: "detail" }),
      });
  
      const response = await result?.json(); 
      const data = response?.result || "";

      console.log(response?.result)
  
      const [title, description, answer, topic] = data?.split("|->").map(item => item.trim());
  
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
      setIsWaiting(false);
      setIsGenerating(updatedIsGenerating);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('nupkt');
    localStorage.removeItem('password');
    setIsLoggedIn(false);
  };

  return (
    <>
      {isLoading ? ( 
        <div className="flex items-center justify-center w-full h-screen bg-white">
          <h1 className="text-gray-500">Loading...</h1>
        </div>
      ) : !isLoggedIn ? ( 
        <Login/>
      ) : (
      <div className='flex flex-col justify-between w-full h-[100dvh]'>
        <div>
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
            <div className="max-w-[1080px] w-full shadow-md p-2 md:p-4" key={index}>
              <div className="flex flex-col mb-[8px]">
                <form onSubmit={(e) => onGenerate(e, index)}>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    {questions.length > 1 &&(
                    <div className="w-[40px] md:w-[60px] hover:opacity-[0.8] cursor-pointer bg-red-500 p-2 rounded-md flex items-center justify-center" onClick={() => removeQuestion(index)}>
                      <img src="/ic-trash.svg" className="w-[24px]"/>
                    </div>
                    )}
                    <div className="w-full">
                      <label htmlFor="prompt" className="text-[14px] font-[600]">Perintah:</label>
                      <input 
                        type="text" 
                        id="prompt" 
                        value={question.prompt} 
                        onChange={(e) => handleInputChange(index, 'prompt', e.target.value)} 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                        placeholder="Contoh: Buatkan soal tentang Aritmatika" 
                        required 
                        autoComplete="off"
                      />
                    </div>
                    <div className="flex flex-col justify-center w-full md:max-w-[200px]">
                      <label className="text-[14px] font-[600]">Tingkat Kesulitan:</label>
                      <select 
                        value={question.difficulty} 
                        onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)} 
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5"
                      >
                        <option value="C1">C1</option>
                        <option value="C2">C2</option>
                        <option value="C3">C3</option>
                        <option value="C4">C4</option>
                        <option value="C5">C5</option>
                        <option value="C6">C6</option>
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
                            disabled={isGenerating[index] || isWaiting}
                            className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait' : isWaiting ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
                          >
                             {isGenerating[index] ? "Loading.." : "Generate"}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleVisibility(index)} 
                            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
                          >
                            <img src="/ic-arrow.svg" className={`w-[20px] min-w-[20px] duration-200 ${isShow.includes(index) && ('rotate-180')}`}/>
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center w-full md:max-w-[200px] md:hidden">
                      <div className="flex items-center gap-2 justify-end w-full md:w-auto md:hidden">
                          <button 
                            type="submit" 
                            disabled={isGenerating[index] || isWaiting}
                            className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait ' : isWaiting ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full px-5 py-2.5`}
                          >
                            {isGenerating[index] ? "Loading.." : "Generate"}
                          </button>
                          <button 
                            type="button" 
                            onClick={() => toggleVisibility(index)} 
                            className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5"
                          >
                            <img src="/ic-arrow.svg" className={`w-[20px] duration-200 ${isShow.includes(index) && ('rotate-180')}`}/>
                          </button>
                        </div>
                    </div>
                  </div>
                </form>
              </div>
              {/* colabs */}
                <div className={`duration-300 ${isShow.includes(index) ? 'h-[620px] overflow-scroll' : 'h-0 overflow-hidden'}`}>
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
                        remarkPlugins: [remarkMath], 
                        rehypePlugins: [rehypeKatex],
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
                        remarkPlugins: [remarkMath], 
                        rehypePlugins: [rehypeKatex],
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
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center px-2 md:pl-6 md:pr-5 gap-2 w-full mb-2 mt-2 md:mt-0">
        <a      
        
          href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
          className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium rounded-md text-sm md:w-auto px-5 py-2.5 flex items-center justify-between gap-1" >
              <img src="/ic-star.svg" className="w-[20px]"/>
              <span className="md:block hidden">Review</span>
            </a>
            <div className="flex justify-end gap-2">
          <button 
            type="button" 
            onClick={openModal} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5"
          >
            <img src="/ic-gear.svg" className="w-[20px]"/>
          </button>
          <button 
            type="button" 
            onClick={addQuestion} 
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-full md:w-auto px-5 py-2.5 flex justify-between items-center gap-1"
          >
            <img src="/ic-plus.svg" className="w-[20px]"/>
          </button>
          </div>
        </div>
        <div className="flex md:hidden justify-between md:justify-end px-2 md:px-0 md:pr-5 gap-2 w-full mb-4">
        </div>
      </div>
      </div>
      <div>
        <button 
        type="button" 
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex justify-between items-center gap-1 m-2"
      >
        <img src="/ic-arrow-out.svg" className="w-[20px]"/>
        Logout
      </button>
      </div>
      </div>
      )}
    </>
  );
}
