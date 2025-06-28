import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ModalPrompt from '/components/modal-prompt';
import Login from '/components/login';
import users from '../mock/users/index.json';
import { RiPlayListAddFill } from "react-icons/ri";
import { LuPlus } from "react-icons/lu";
import { IoIosStarOutline, IoIosArrowDown } from "react-icons/io";
import { CiLogout } from "react-icons/ci";
import { GoTrash } from "react-icons/go";
import { FaHome } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import Editor from '../components/editor';
import LanguageSwitcher from '../components/language-switcher';

export default function Home() {
  const { t, ready, i18n } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("");
  const [nama, setNama] = useState("");
  const [generateClickCount, setGenerateClickCount] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [isFoucused, setIsFocused] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0, width: 0 });
  const textareaRefs = useRef({});
  const [currentLanguage, setCurrentLanguage] = useState('id');

  // Create dynamic suggestion list based on current language using useMemo
  const suggestionList = useMemo(() => {
    // Define suggestions for each language
    const suggestions = {
      id: [
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
          label: "Soal Fungsi Kuadrat",
          value: "Buatlah sebuah soal mengenai fungsi kuadrat yang mencakup analisis grafik, akar-akar persamaan, dan hubungan koefisien dengan bentuk parabola. Sertakan penjelasan konsep, langkah-langkah penyelesaian, serta interpretasi hasil agar siswa dapat memahami perubahan bentuk grafik akibat variasi koefisien."
        },
        {
          label: "Soal Limit Fungsi",
          value: "Kembangkan soal mengenai limit fungsi aljabar, misalnya limit fungsi polinomial atau rasional saat mendekati titik tertentu. Berikan langkah-langkah perhitungan, penjelasan konsep limit, serta diskusi mengenai bagaimana limit berperan dalam analisis kelangsungan fungsi."
        },
        {
          label: "Soal Turunan Fungsi",
          value: "Buat soal yang menantang siswa untuk menghitung turunan dari fungsi (bisa fungsi aljabar atau trigonometri) dan mengaitkannya dengan aplikasi grafik (misalnya mencari titik maksimum, minimum, atau titik belok). Sertakan uraian tentang aturan turunan dan interpretasi grafik dari hasil turunan."
        },
        {
          label: "Soal Integral",
          value: "Rancang soal integral tak tentu dari fungsi aljabar yang sederhana, misalnya fungsi polinomial. Sertakan langkah-langkah pengintegrasian, teknik substitusi (jika perlu), dan penjelasan mengenai antiturunan, sehingga siswa memahami hubungan antara fungsi asli dan integralnya."
        },
        {
          label: "Soal Statistika",
          value: "Buat soal yang berkaitan dengan statistika dasar, seperti perhitungan nilai rata-rata, median, modus, serta simpangan baku dari sekumpulan data nyata. Sertakan penjelasan metode pengolahan data dan interpretasi hasil untuk membantu siswa mengaitkan konsep statistika dengan aplikasi di dunia nyata."
        }
      ],
      en: [
        {
          label: "Simple Question",
          value: "Create a simple high school math question about [...]."
        },
        {
          label: "Illustrated Question",
          value: "Create a high school math question about [...] that includes diagrams, charts, or visual elements to support the problem."
        },
        {
          label: "Exam-Style Question",
          value: "Create a practice question in the style of [SAT/ACT/AP] exams for high school level on the topic of [...]. Use language and structure similar to actual exam questions. Include answer choices (if applicable) and detailed explanations."
        },
        {
          label: "HOTS Question",
          value: "Create a high school math question that requires higher-order thinking skills (HOTS), such as analysis, synthesis, or evaluation, on the topic of [...]. Include the question, answer, and explanation of why this qualifies as a HOTS question."
        },
        {
          label: "Short Answer Question",
          value: "Create a short-answer math question for high school students about [...]. The question should have a final answer in the form of a number or mathematical expression. Include the answer key and step-by-step solution."
        },
        {
          label: "Word Problem",
          value: "Create a contextual word problem for high school math related to real-life situations, focusing on [...]. The problem should include a narrative and require understanding of mathematical concepts. Provide the complete answer with detailed explanation."
        },
        {
          label: "Quadratic Function Question",
          value: "Create a question about quadratic functions that covers graph analysis, equation roots, and the relationship between coefficients and parabola shape. Include concept explanations, solution steps, and result interpretation to help students understand how coefficient variations affect graph shape."
        },
        {
          label: "Function Limit Question",
          value: "Develop a question about algebraic function limits, such as polynomial or rational function limits approaching specific points. Provide calculation steps, limit concept explanations, and discussion on how limits play a role in analyzing function continuity."
        },
        {
          label: "Function Derivative Question",
          value: "Create a challenging question for students to calculate derivatives of functions (algebraic or trigonometric) and relate them to graph applications (finding maximum, minimum, or inflection points). Include derivative rules and graph interpretation of derivative results."
        },
        {
          label: "Integral Question",
          value: "Design an indefinite integral question for simple algebraic functions, such as polynomial functions. Include integration steps, substitution techniques (if needed), and antiderivative explanations, helping students understand the relationship between original functions and their integrals."
        },
        {
          label: "Statistics Question",
          value: "Create a question related to basic statistics, such as calculating mean, median, mode, and standard deviation from real data sets. Include data processing method explanations and result interpretations to help students connect statistical concepts with real-world applications."
        }
      ]
    };
    
    return suggestions[currentLanguage] || suggestions.id;
  }, [currentLanguage]); // Update when language changes

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    // Set current language from localStorage and initialize i18n
    const storedLanguage = localStorage.getItem('language') || 'id';
    setCurrentLanguage(storedLanguage);
    
    // Set i18n language
    if (ready && i18n.language !== storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
    
    // Initialize questions with translations after component mounts
    setQuestions([{
      prompt: "",
      difficulty: t('cognitive.c1'),
      type: t('types.essay'),
      title: "",
      description: "",
      answer: "",
      topic: ""
    }]);

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

    // Listen for language changes
    const handleLanguageChange = (event) => {
      const newLanguage = event.detail || localStorage.getItem('language') || 'id';
      setCurrentLanguage(newLanguage);
      
      // Update i18n language
      if (i18n.language !== newLanguage) {
        i18n.changeLanguage(newLanguage);
      }
    };

    // Add event listener for storage changes (when language changes in other components)
    window.addEventListener('storage', handleLanguageChange);
    
    // Custom event for same-tab language changes
    window.addEventListener('languageChanged', handleLanguageChange);

    return () => {
      window.removeEventListener('storage', handleLanguageChange);
      window.removeEventListener('languageChanged', handleLanguageChange);
    };
  }, [t, ready, i18n]); // Add i18n as dependency

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
      } else {
        const filtered = suggestionList.filter(s =>
          s.value.toLowerCase().includes(value.toLowerCase()) ||
          s.label.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredSuggestions(filtered);
      }
    }
  };

  const handleSuggestionClick = (indexQuestion, suggestion, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setTimeout(() => {
      const updatedQuestions = [...questions];
      updatedQuestions[indexQuestion].prompt = suggestion;
      setQuestions(updatedQuestions);
      setFilteredSuggestions([]);
      setActiveSuggestionIndex(null);
    }, 100);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      prompt: "",
      difficulty: t('cognitive.c1'),
      type: t('types.essay'),
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

  const handleTextareaFocus = (index, event) => {
    setIsFocused(true);
    setFilteredSuggestions(suggestionList);
    
    // Get textarea position
    const rect = event.target.getBoundingClientRect();
    setSuggestionPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width
    });
    
    setTimeout(() => {
      setActiveSuggestionIndex(index);
    }, 200);
  };

  if (isLoading || !ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? ( 
        <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <h1 className="text-gray-500">Loading...</h1>
        </div>
      ) : !isLoggedIn ? ( 
        <Login/>
      ) : (
        <div className='flex flex-col justify-between w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
          {/* Fixed Navigation Bar at Top */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50">
            <div className="max-w-[1080px] mx-auto">
              <div className="flex justify-between items-center h-16 px-4">
                <div className="flex items-center gap-3">
                  <img src="/math.png" alt="Math Quest Logo" className="w-8 h-8" />
                  <span className="font-bold text-gray-800 text-lg hidden sm:block">{t('main.title')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <LanguageSwitcher />
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <CiLogout className="text-xl"/>
                    <span className="hidden sm:block">{t('main.logout')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-grow mt-16">
            <ModalPrompt isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} />
            
            <div className="max-w-[1080px] w-full container mx-auto px-4 py-6">
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
                    <div className="p-6">
                      <form onSubmit={(e) => onGenerate(e, index)}>
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {questions.length > 1 && (
                            <div className="lg:pt-8">
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="w-full lg:w-[40px] h-[40px] bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                              >
                                <GoTrash className='text-lg'/>
                              </button>
                            </div>
                          )}
                          <div className="flex-grow space-y-4">
                            <div className="space-y-2">
                              <label htmlFor="prompt" className="block text-sm font-semibold text-gray-700">{t('main.command')}</label>
                              <textarea 
                                ref={el => textareaRefs.current[index] = el}
                                id="prompt" 
                                value={question.prompt} 
                                onChange={(e) => handleInputChange(index, 'prompt', e.target.value)} 
                                onFocus={(e) => handleTextareaFocus(index, e)}
                                onBlur={() => {
                                  setTimeout(() => {
                                    if (activeSuggestionIndex === index) {
                                      setActiveSuggestionIndex(null);
                                    }
                                  }, 100);
                                }}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-y" 
                                placeholder={t('main.commandPlaceholder')}
                                required 
                                autoComplete="off"
                              />
                            </div>
                            
                            <div className="flex flex-col lg:flex-row gap-4">
                              <div className="flex-1 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">{t('main.cognitiveLevel')}</label>
                                <select 
                                  value={question.difficulty} 
                                  onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)} 
                                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                >
                                  <option value={t('cognitive.c1')}>{t('cognitive.c1')}</option>
                                  <option value={t('cognitive.c2')}>{t('cognitive.c2')}</option>
                                  <option value={t('cognitive.c3')}>{t('cognitive.c3')}</option>
                                  <option value={t('cognitive.c4')}>{t('cognitive.c4')}</option>
                                  <option value={t('cognitive.c5')}>{t('cognitive.c5')}</option>
                                  <option value={t('cognitive.c6')}>{t('cognitive.c6')}</option>
                                </select>
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">{t('main.questionType')}</label>
                                <div className="flex gap-2">
                                  <select 
                                    value={question.type} 
                                    onChange={(e) => handleInputChange(index, 'type', e.target.value)} 
                                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                  >
                                    <option value={t('types.essay')}>{t('types.essay')}</option>
                                    <option value={t('types.multipleChoice')}>{t('types.multipleChoice')}</option>
                                  </select>
                                  
                                  <button 
                                    type="submit" 
                                    disabled={isGenerating[index]}
                                    className={`${isGenerating[index] ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} px-6 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2`}
                                  >
                                    {isGenerating[index] ? t('main.creating') : t('main.createQuestion')}
                                  </button>
                                  
                                  <button 
                                    type="button" 
                                    onClick={() => toggleVisibility(index)} 
                                    className="bg-blue-500 hover:bg-blue-600 px-3 py-2 text-white rounded-lg transition-colors duration-200"
                                  >
                                    <IoIosArrowDown className={`text-xl transition-transform duration-200 ${isShow.includes(index) ? '-rotate-180' : ''}`}/>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>
                    
                    <div className={`transition-all duration-300 ${isShow.includes(index) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                      <div className="p-6 pt-0 space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">{t('main.title_field')}</label>
                          <input 
                            type="text" 
                            value={question.title} 
                            onChange={(e) => handleInputChange(index, 'title', e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                            required 
                          />
                        </div>
                        
                        <div>
                          <Editor 
                            label={t('main.description')} 
                            id="description" 
                            index={index} 
                            value={question.description} 
                            onChange={(index, id, val) => handleInputChange(index, id, val)} 
                          />
                        </div>
                        
                        <div>
                          <Editor 
                            label={t('main.answer')} 
                            id="answer" 
                            index={index} 
                            value={question.answer} 
                            onChange={(index, id, val) => handleInputChange(index, id, val)} 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">{t('main.branch')}</label>
                          <input 
                            type="text" 
                            value={question.topic} 
                            onChange={(e) => handleInputChange(index, 'topic', e.target.value)} 
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                            required 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Suggestion List Portal - Outside any overflow container */}
          {activeSuggestionIndex !== null && filteredSuggestions.length > 0 && (
            <div 
              className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              style={{
                top: suggestionPosition.top,
                left: suggestionPosition.left,
                width: suggestionPosition.width
              }}
            >
              <ul>
                {filteredSuggestions.map((s, sIndex) => (
                  <li
                    key={sIndex}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    onMouseDown={(e) => handleSuggestionClick(activeSuggestionIndex, s.value, e)}
                  >
                    <strong className="text-blue-600">{s.label}:</strong> {s.value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fixed Bottom Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
            <div className="max-w-[1080px] mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="flex-1 flex justify-center">
                  <a      
                    href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
                    className="flex flex-col items-center gap-1 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
                  >
                    <IoIosStarOutline className="text-2xl" />
                    <span className="text-xs font-medium">{t('main.feedback')}</span>
                  </a>
                </div>
                <div className="flex-1 flex justify-center">
                  <button 
                    onClick={openModal}
                    className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <RiPlayListAddFill className="text-2xl" />
                    <span className="text-xs font-medium">{t('main.generate') || 'Buat Otomatis'}</span>
                  </button>
                </div>
                <div className="flex-1 flex justify-center">
                  <button 
                    onClick={addQuestion}
                    className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    <LuPlus className="text-2xl" />
                    <span className="text-xs font-medium">{t('main.addQuestion') || 'Tambah Soal'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full bg-white py-4 border-t border-gray-100 mb-16">
            <div className="max-w-[1080px] mx-auto px-4 text-center text-sm text-gray-600">
              <p>{t('main.subtitle')}</p>
              <p className="mt-1">
                {t('main.developedBy')} <a href="https://www.instagram.com/muhamadjamaludinpad/" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">Jamjam</a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
