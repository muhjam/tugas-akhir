import { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css'; 
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ModalPrompt from '/components/modal-prompt';
import Login from '/components/login';
import users from '../mock/users/index.json';
import { RiPlayListAddFill } from "react-icons/ri";
import { LuPlus } from "react-icons/lu";
import { IoIosStarOutline, IoIosArrowDown } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import Editor from '../components/editor';

const suggestionList = [
  {
    label: "Soal Simple",
    value: "Buatkan satu soal matematika tingkat SMA tentang [...]."
  },
  {
    label: "Soal Bergambar",
    value: "Buatkan satu soal matematika tingkat SMA tentang [...], sertakan gambar pada soal serta informasinya."
  },
  {
    label: "Soal Bermodel",
    value: "Buat satu soal latihan ujian matematika model [UNBK/UTBK/SBMPTN] untuk tingkat SMA dengan topik [...]. Gunakan gaya bahasa dan struktur soal yang mirip dengan soal asli ujian. Sertakan opsi jawaban (jika ada) dan pembahasannya."
  },
  {
    label: "Soal HOTS",
    value: "Buatkan soal matematika tingkat SMA yang menuntut keterampilan berpikir tingkat tinggi (HOTS), seperti analisis, sintesis, atau evaluasi, dengan topik [...]. Sertakan soal, jawaban, dan alasan mengapa soal tersebut masuk kategori HOTS."
  },
  {
    label: "Soal Singkat",
    value: "Buatkan satu soal matematika isian singkat untuk siswa SMA tentang [...]. Soal harus memiliki jawaban akhir berupa angka atau ekspresi matematika. Sertakan juga kunci jawaban dan langkah-langkah penyelesaiannya."
  },
  {
    label: "Soal Cerita",
    value: "Buat satu soal cerita kontekstual matematika tingkat SMA yang berkaitan dengan kehidupan sehari-hari, dengan topik [...]. Soal harus mengandung narasi dan membutuhkan pemahaman konsep matematika. Sertakan juga jawabannya lengkap dengan pembahasan."
  },
  {
    label: "Soal Fungsi Kuadrat dan Grafiknya",
    value: "Buatlah sebuah soal mengenai fungsi kuadrat yang mencakup analisis grafik, akar-akar persamaan, dan hubungan koefisien dengan bentuk parabola. Sertakan penjelasan konsep, langkah-langkah penyelesaian, serta interpretasi hasil agar siswa dapat memahami perubahan bentuk grafik akibat variasi koefisien."
  },
  {
    label: "Soal Limit Fungsi Aljabar",
    value: "Kembangkan soal mengenai limit fungsi aljabar, misalnya limit fungsi polinomial atau rasional saat mendekati titik tertentu. Berikan langkah-langkah perhitungan, penjelasan konsep limit, serta diskusi mengenai bagaimana limit berperan dalam analisis kelangsungan fungsi."
  },
  {
    label: "Soal Turunan Fungsi",
    value: "Buat soal yang menantang siswa untuk menghitung turunan dari fungsi (bisa fungsi aljabar atau trigonometri) dan mengaitkannya dengan aplikasi grafik (misalnya mencari titik maksimum, minimum, atau titik belok). Sertakan uraian tentang aturan turunan dan interpretasi grafik dari hasil turunan."
  },
  {
    label: "Soal Integral Tak Tentu",
    value: "Rancang soal integral tak tentu dari fungsi aljabar yang sederhana, misalnya fungsi polinomial. Sertakan langkah-langkah pengintegrasian, teknik substitusi (jika perlu), dan penjelasan mengenai antiturunan, sehingga siswa memahami hubungan antara fungsi asli dan integralnya."
  },
  {
    label: "Soal Statistika dan Pengolahan Data",
    value: "Buat soal yang berkaitan dengan statistika dasar, seperti perhitungan nilai rata-rata, median, modus, serta simpangan baku dari sekumpulan data nyata. Sertakan penjelasan metode pengolahan data dan interpretasi hasil untuk membantu siswa mengaitkan konsep statistika dengan aplikasi di dunia nyata."
  },
];


export default function Home() {
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "C1 (Mengingat)",
    type: "Esai",
    title: "",
    description: "",
    answer: "",
    topic: ""
  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("");
  const [nama, setNama] = useState("");
  const [generateClickCount, setGenerateClickCount] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Logika login
    const storedNupkt = localStorage.getItem('nupkt');
    const storedPassword = localStorage.getItem('password');
    
    if (storedNupkt && storedPassword) {
      const user = users.find(user => user.NUPTK === storedNupkt && user.Password === storedPassword);
      if (user) {
        setNupkt(storedNupkt);
        setNama(user.Nama);
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

    if (field === "prompt") {
      if (value.trim() === "") {
        setFilteredSuggestions([]);
        setShowSuggestions(false);
      } else {
        const filtered = suggestionList.filter(suggestion =>
          suggestion.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
        setShowSuggestions(true);
      }
    }
  };

  const handleSuggestionClick = (indexQuestion, suggestion) => {
    const updatedQuestions = [...questions];
    updatedQuestions[indexQuestion].prompt = suggestion;
    setQuestions(updatedQuestions);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      prompt: "",
      difficulty: "C1 (Mengingat)",
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

  let generateQueue = Promise.resolve();

  function addToQueue(task) {
    generateQueue = generateQueue
      .then(() => task())
      .catch((err) => {
        console.error('Error di queue:', err);
      });
    return generateQueue;
  }

  async function onGenerate(event, index) {
    event.preventDefault();
    
    setIsGenerating((prev) => {
      const newIsGenerating = [...prev];
      newIsGenerating[index] = true;
      return newIsGenerating;
    });
    
    await addToQueue(async () => {
      const { prompt, difficulty, type } = questions[index];
      let retryCount = 0;
      const maxRetries = 3;
    
      while (retryCount < maxRetries) {
        try {
          const result = await fetch('/api/generate', {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, type, difficulty, mode: "detail" }),
          });
    
          const response = await result.json();
          const data = response?.result || "";
    
          const [title = "", description = "", answer = "", topic = ""] = data
            .split("|->")
            .map(item => item.trim());
    
          if ((title && description && answer && topic) || retryCount >= maxRetries) {
            setQuestions((prevQuestions) => {
              const newQuestions = [...prevQuestions];
              newQuestions[index] = {
                ...newQuestions[index],
                title,
                description,
                answer,
                topic,
              };
              return newQuestions;
            });
            setIsShow((prev) => [...prev, index]);
            break;
          } else {
            retryCount++;
          }
        } catch (error) {
          console.error(error);
          if (retryCount >= maxRetries) {
            alert(error.message);
          }
        }
      }
    });
    
    setIsGenerating((prev) => {
      const newIsGenerating = [...prev];
      newIsGenerating[index] = false;
      return newIsGenerating;
    });
    setGenerateClickCount((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount % 5 === 0) {
        window.Tally.openPopup('m61EBN', {
          layout: 'modal',
          width: 376,
          emoji: {
            text: "👋",
            animation: "wave"
          },
        });
      }
      return newCount;
    });
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
          <div className="p-[8px] lg:p-[24px] flex justify-center">
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
            <div className="p-[8px] lg:p-[24px] flex flex-col justify-center">
              {questions.map((question, index) => (
                <div className="max-w-[1080px] w-full shadow-md p-2 lg:p-4" key={index}>
                  <div className="flex flex-col mb-[8px]">
                    <form onSubmit={(e) => onGenerate(e, index)}>
                      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                        {questions.length > 1 && (
                          <div className="w-[40px] lg:w-[60px] hover:opacity-[0.8] cursor-pointer bg-red-500 p-2 rounded-md flex items-center justify-center" onClick={() => removeQuestion(index)}>
                            <GoTrash className='text-md text-white'/>
                          </div>
                        )}
                        <div className="w-full space-y-1 relative">
                          <label htmlFor="prompt" className="text-[14px] font-[600]">Perintah:</label>
                          <input 
                            type="text" 
                            id="prompt" 
                            value={question.prompt} 
                            onChange={(e) => handleInputChange(index, 'prompt', e.target.value)} 
                            onFocus={() => {
                              setFilteredSuggestions(suggestionList);
                              setShowSuggestions(true);
                            }}
                            onBlur={() => {
                              setTimeout(() => setShowSuggestions(false), 100);
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                            placeholder="Masukan perintah untuk membuat soal" 
                            required 
                            autoComplete="off"
                          />
                          {showSuggestions && filteredSuggestions.length > 0 && (
                            <ul className="absolute z-[11] w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                              {filteredSuggestions.map((suggestion, sIndex) => (
                                  <li 
                                  key={sIndex} 
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleSuggestionClick(index, `${suggestion.label}: ${suggestion.value}`)}
                                  >
                                  <strong>{suggestion.label}:</strong> {suggestion.value}
                                  </li>
                              ))}

                            </ul>
                          )}
                        </div>
                        <div className="flex flex-col justify-center w-full lg:max-w-[200px] space-y-1">
                          <label className="text-[14px] font-[600] capitalize">tingkat kognitif:</label>
                          <select 
                            value={question.difficulty} 
                            onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5 cursor-pointer"
                          >
                            <option value="C1 (Mengingat)">C1 (Mengingat)</option>
                            <option value="C2 (Memahami)">C2 (Memahami)</option>
                            <option value="C3 (Menerapkan)">C3 (Menerapkan)</option>
                            <option value="C4 (Menganalisis)">C4 (Menganalisis)</option>
                            <option value="C5 (Mengevaluasi)">C5 (Mengevaluasi)</option>
                            <option value="C6 (Mencipta)">C6 (Mencipta)</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-center w-full space-y-1">
                          <label className="text-[14px] font-[600]">Tipe Soal:</label>
                          <div className="flex gap-2">
                            <select 
                              value={question.type} 
                              onChange={(e) => handleInputChange(index, 'type', e.target.value)} 
                              className="bg-gray-50 w-full lg:max-w-[200px] border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5 cursor-pointer"
                            >
                              <option value="Esai">Esai</option>
                              <option value="PG">PG</option>
                            </select>
                            <div className="lg:flex items-center gap-2 justify-end w-full lg:w-[180px] ms-auto hidden">
                              <button 
                                type="submit" 
                                disabled={isGenerating[index]}
                                className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-[180px] px-5 py-2.5`}
                              >
                                {isGenerating[index] ? "Membuat.." : "Buat Soal"}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => toggleVisibility(index)} 
                                className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5"
                              >
                                <IoIosArrowDown className={`text-xl duration-200 ${isShow.includes(index) && ('-rotate-180')}`}/>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col justify-center w-full lg:hidden">
                          <div className="flex items-center gap-2 justify-end w-full lg:hidden">
                              <button 
                                type="submit" 
                                disabled={isGenerating[index]}
                                className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait ' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full px-5 py-2.5`}
                              >
                                {isGenerating[index] ? "Membuat..." : "Buat Soal"}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => toggleVisibility(index)} 
                                className="bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5"
                              >
                                <IoIosArrowDown className={`text-xl duration-200 ${isShow.includes(index) && ('-rotate-180')}`}/>
                              </button>
                            </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  {/* Bagian tambahan untuk input judul, deskripsi, dll */}
                  <div className={`duration-300 px-1 ${isShow.includes(index) ? 'h-[1220px] overflow-y-scroll' : 'h-0 overflow-y-hidden'}`}>
                    <div className="flex flex-col mb-[8px] space-y-1">
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
                    <div className="mb-[10px]">
                        <Editor label={"Deskripsi"} id={"description"} index={index} value={question.description} onChange={(index, id, val ) => handleInputChange(index, id, val)}  />
                    </div>
                    <div className="mb-[10px]">
                      <Editor label={"Jawaban"} id={"answer"} index={index} value={question.answer} onChange={(index, id, val ) => handleInputChange(index, id, val)}  />
                    </div>
                    <div className="flex flex-col mb-[8px] space-y-1">
                      <label htmlFor="topic" className="text-[14px] font-[600]">Cabang Ilmu:</label>
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
            <div className="flex justify-between items-center px-2 lg:pl-6 lg:pr-5 gap-2 w-full mb-2 mt-2 lg:mt-0">
              <a      
                href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-medium rounded-md text-sm lg:w-auto px-5 py-2.5 flex items-center justify-between gap-1" >
                  <IoIosStarOutline className='text-xl'/>
                  <span className="lg:block hidden">Tanggapan</span>
              </a>
              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={openModal} 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-full lg:w-auto px-5 py-2.5"
                >
                  <RiPlayListAddFill className='text-xl'/>
                </button>
                <button 
                  type="button" 
                  onClick={addQuestion} 
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm w-full lg:w-auto px-5 py-2.5 flex justify-between items-center gap-1"
                >
                  <LuPlus className='text-xl'/>
                </button>
              </div>
            </div>
            <div className="flex lg:hidden justify-between lg:justify-end px-2 lg:px-0 lg:pr-5 gap-2 w-full mb-4">
            </div>
          </div>
        </div>
        <div>
          <button 
            type="button" 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-medium rounded-md text-sm w-fit px-5 py-2.5 flex justify-between items-center gap-1 m-2"
          >
            <CiLogout className="text-xl"/>
            Keluar
          </button>
        </div>
      </div>
      )}
    </>
  );
}
