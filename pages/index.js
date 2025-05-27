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
    label: "Simple Assessment",
    value: "Create one high school level math assessment about [...]"
  },
  {
    label: "Assessment with Image",
    value: "Create one high school level math assessment about [...] including an image and its information."
  },
  {
    label: "Exam-Style Assessment",
    value: "Create a practice exam math assessment in the style of [UNBK/UTBK/SBMPTN] for high school level about [...]. Use language and assessment structure similar to actual exam questions. Include answer options (if any) and explanations."
  },
  {
    label: "HOTS Assessment",
    value: "Create a high school level math assessment that requires higher-order thinking skills (HOTS) such as analysis, synthesis, or evaluation, about [...]. Include the assessment, answer, and explanation of why this is considered a HOTS assessment."
  },
  {
    label: "Short Answer Assessment",
    value: "Create one short-answer math assessment for high school students about [...]. The assessment should have a final answer in the form of a number or mathematical expression. Also include the answer key and solution steps."
  },
  {
    label: "Word Assessment",
    value: "Create a contextual math word assessment for high school level related to daily life, about [...]. The assessment should contain a narrative and require understanding of mathematical concepts. Also include the complete answer with explanation."
  },
  {
    label: "Quadratic Function and Graph Assessment",
    value: "Create an assessment about quadratic functions that includes graph analysis, equation roots, and the relationship between coefficients and parabola shape. Include concept explanations, solution steps, and result interpretation to help students understand how coefficient variations affect the graph's shape."
  },
  {
    label: "Algebraic Limit Assessment",
    value: "Develop an assessment about algebraic limits, such as limits of polynomial or rational functions approaching a certain point. Include calculation steps, limit concept explanations, and discussion of how limits function in continuity analysis."
  },
  {
    label: "Function Derivative Assessment",
    value: "Create a challenging assessment for students to calculate the derivative of a function (could be algebraic or trigonometric) and relate it to graphical applications (e.g., finding maximum, minimum, or inflection points). Include explanations of derivative rules and graphical interpretations of the derivative results."
  },
  {
    label: "Indefinite Integral Assessment",
    value: "Design an indefinite integral assessment of a simple algebraic function, such as a polynomial function. Include integration steps, substitution techniques (if needed), and explanations about antiderivatives, so students understand the relationship between the original function and its integral."
  },
  {
    label: "Statistics and Data Processing Assessment",
    value: "Create an assessment related to basic statistics, such as calculating mean, median, mode, and standard deviation from a set of real data. Include explanations of data processing methods and result interpretations to help students connect statistical concepts with real-world applications."
  },
];


export default function Home() {
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "C1 (Remember)",
    type: "Essay",
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
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [isFoucused, setIsFocused] = useState(false);

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
      // Translate difficulty and type to English
      const translatedDifficulty = item?.difficulty
        .replace('Mengingat', 'Remember')
        .replace('Memahami', 'Understand')
        .replace('Menerapkan', 'Apply')
        .replace('Menganalisis', 'Analyze')
        .replace('Mengevaluasi', 'Evaluate')
        .replace('Mencipta', 'Create');
      
      const translatedType = item?.type === 'Esai' ? 'Essay' : item?.type;
      
      setQuestions((prev) => [
        ...prev,
        {
          prompt: item?.prompt,
          difficulty: translatedDifficulty || item?.difficulty,
          type: translatedType || item?.type,
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
      difficulty: "C1 (Remember)",
      type: "Essay",
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

  console.log(activeSuggestionIndex)

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
                <h1 className="text-[24px] font-[600] text-center">Automatic Math Problem Generator</h1>
                <h2 className="text-[14px] text-gray-800 font-[500] text-center">
                  Automatic high school level math problem generation using AI <br />
                  developed by <a href="https://www.instagram.com/muhamadjamaludinpad/" className="font-[600] hover:underline">Jamjam</a>.
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
                          <label htmlFor="prompt" className="text-[14px] font-[600]">Prompt:</label>
                          <input 
                            type="text" 
                            id="prompt" 
                            value={question.prompt} 
                            onChange={(e) => handleInputChange(index, 'prompt', e.target.value)} 
                            onFocus={() => {
                              setIsFocused(true);
                              setFilteredSuggestions(suggestionList);
                              setTimeout(() => {
                                  setActiveSuggestionIndex(index);
                              }, 200);
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                if (activeSuggestionIndex === index) {
                                  setActiveSuggestionIndex(null);
                                }
                              }, 100);
                            }}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 focus:outline-none" 
                            placeholder="Enter command to Generate" 
                            required 
                            autoComplete="off"
                          />
                         {activeSuggestionIndex === index && filteredSuggestions.length > 0 && (
                            <ul className="absolute z-[11] w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                              {filteredSuggestions.map((s, sIndex) => (
                                <li
                                  key={sIndex}
                                  className="p-2 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={(e) => handleSuggestionClick(index, s.value, e)}
                                >
                                  <strong>{s.label}:</strong> {s.value}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex flex-col justify-center w-full lg:max-w-[200px] space-y-1">
                          <label className="text-[14px] font-[600] capitalize">Cognitive Level:</label>
                          <select 
                            value={question.difficulty} 
                            onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)} 
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5 cursor-pointer"
                          >
                            <option value="C1 (Remember)">C1 (Remember)</option>
                            <option value="C2 (Understand)">C2 (Understand)</option>
                            <option value="C3 (Apply)">C3 (Apply)</option>
                            <option value="C4 (Analyze)">C4 (Analyze)</option>
                            <option value="C5 (Evaluate)">C5 (Evaluate)</option>
                            <option value="C6 (Create)">C6 (Create)</option>
                          </select>
                        </div>
                        <div className="flex flex-col justify-center w-full space-y-1">
                          <label className="text-[14px] font-[600]">Question Type:</label>
                          <div className="flex gap-2">
                            <select 
                              value={question.type} 
                              onChange={(e) => handleInputChange(index, 'type', e.target.value)} 
                              className="bg-gray-50 w-full lg:max-w-[200px] border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-2.5 cursor-pointer"
                            >
                              <option value="Essay">Essay</option>
                              <option value="Multiple Choice">Multiple Choice</option>
                            </select>
                            <div className="lg:flex items-center gap-2 justify-end w-full lg:w-[180px] ms-auto hidden">
                              <button 
                                type="submit" 
                                disabled={isGenerating[index]}
                                className={`${isGenerating[index] ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-[180px] px-5 py-2.5`}
                              >
                                {isGenerating[index] ? "Generating..." : "Generate"}
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
                                {isGenerating[index] ? "Generating..." : "Generate"}
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
                      <label htmlFor="title" className="text-[14px] font-[600]">Title:</label>
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
                        <Editor label={"Description"} id={"description"} index={index} value={question.description} onChange={(index, id, val ) => handleInputChange(index, id, val)}  />
                    </div>
                    <div className="mb-[10px]">
                      <Editor label={"Answer"} id={"answer"} index={index} value={question.answer} onChange={(index, id, val ) => handleInputChange(index, id, val)}  />
                    </div>
                    <div className="flex flex-col mb-[8px] space-y-1">
                      <label htmlFor="topic" className="text-[14px] font-[600]">Topic:</label>
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
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-md text-sm lg:w-auto px-5 py-2.5 flex items-center justify-between gap-1" >
                  <IoIosStarOutline className='text-xl'/>
                  <span className="lg:block hidden">Feedback</span>
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
            Logout
          </button>
        </div>
      </div>
      )}
    </>
  );
}
