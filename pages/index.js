import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ModalPrompt from '/components/modal-prompt';
import Login from '/components/login';
import users from '../mock/users/index.json';
import Navbar from '../components/navbar';
import QuestionEditor from '../components/question-editor';
import SuggestionList from '../components/suggestion-list';
import BottomNavigation from '../components/bottom-navigation';
import Footer from '../components/footer';

export default function Home() {
  const { t, ready, i18n } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState([]);
  const [isShow, setIsShow] = useState([]);
  const [questions, setQuestions] = useState([{
    prompt: "",
    difficulty: "c1",
    type: "essay",
    title: "",
    description: "",
    answer: "",
    topic: ""
  }]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const nupkt = localStorage.getItem('nupkt');
      setIsLoggedIn(!!nupkt);
    }
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [nuptk, setNupkt] = useState("");
  const [nama, setNama] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [suggestionPosition, setSuggestionPosition] = useState({
    top: 0,
    left: 0,
    width: 0
  });
  const [isFoucused, setIsFocused] = useState(false);
  const textareaRefs = useRef({});
  const [suggestionQuery, setSuggestionQuery] = useState('');


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
  }, []); // Run only once on mount

  // Handle language changes
  useEffect(() => {
    if (ready && questions.length > 0) {
      setQuestions(prevQuestions => prevQuestions.map(q => ({
        ...q,
        difficulty: "c1",
        type: "essay"
      })));
    }
  }, [ready, t, i18n.language]); // Re-run when language changes

  // Listen for custom language change events
  useEffect(() => {
    const handleLanguageChange = (event) => {
      const { language } = event.detail;
      if (language && ready) {
        setQuestions(prevQuestions => prevQuestions.map(q => ({
          ...q,
          difficulty: "c1",
          type: "essay"
        })));
      }
    };

    window.addEventListener('languageChanged', handleLanguageChange);
    return () => window.removeEventListener('languageChanged', handleLanguageChange);
  }, [ready, t]);

  const handleModalSubmit = (data) => {
    data?.map((item) => {
      setQuestions((prev) => [
        ...prev,
        {
          prompt: item?.prompt,
          difficulty: item?.difficulty || "c1",
          type: item?.type || "essay",
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
    setQuestions(prev => {
      const newQuestions = [...prev];
      newQuestions[index] = {
        ...newQuestions[index],
        [field]: value
      };
      return newQuestions;
    });
  
    if (field === 'prompt') {
      setSuggestionQuery(value);
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
      difficulty: "c1",
      type: "essay",
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
            body: JSON.stringify({ prompt, type, difficulty, mode: "detail", lang: i18n.language }),
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
    if (index === null) {
      // If index is null, it means we're blurring
      setActiveSuggestionIndex(null);
      return;
    }
  
    setIsFocused(true);
    setActiveSuggestionIndex(index);
    setSuggestionQuery('');
  
    // Get textarea position
    const rect = event.target?.getBoundingClientRect?.();
    if (rect) {
      setSuggestionPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
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
    <div key={i18n.language}>
      {isLoading ? ( 
        <div className="flex items-center justify-center w-full h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
          <h1 className="text-gray-500">Loading...</h1>
        </div>
      ) : !isLoggedIn ? ( 
        <Login/>
      ) : (
        <div className='flex flex-col justify-between w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50'>
          <Navbar showLogout={isLoggedIn} onLogout={handleLogout} />

          {/* Main Content */}
          <div className="flex-grow mt-16">
            <ModalPrompt isOpen={isModalOpen} onClose={closeModal} onSubmit={handleModalSubmit} />
            
            <div className="max-w-[1080px] w-full container mx-auto px-1 lg:px-4 py-6 relative">
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <QuestionEditor
                    key={index}
                    index={index}
                    question={question}
                    isGenerating={isGenerating}
                    isShow={isShow}
                    onRemove={questions.length > 1 ? removeQuestion : null}
                    onInputChange={handleInputChange}
                    onGenerate={onGenerate}
                    onToggleVisibility={toggleVisibility}
                    onTextareaFocus={handleTextareaFocus}
                    textareaRefs={textareaRefs}
                    activeSuggestionIndex={activeSuggestionIndex}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>

          {activeSuggestionIndex !== null && (
            <SuggestionList
              activeSuggestionIndex={activeSuggestionIndex}
              onSuggestionClick={(index, value) => {
                handleInputChange(index, 'prompt', value);
                setActiveSuggestionIndex(null);
              }}
              position={suggestionPosition}
              query={suggestionQuery}
            />
          )}
          {/* Bottom Navigation */}
          <BottomNavigation
            nuptk={nuptk}
            nama={nama}
            onOpenModal={openModal}
            onAddQuestion={addQuestion}
            t={t}
          />

          {/* Footer */}
          <Footer t={t} />
        </div>
      )}
    </div>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'id', ['common'])),
    },
  };
}
