import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ModalPrompt from '/components/modal-prompt';
import Login from '/components/login';
import users from '../mock/users/index.json';
import Navbar from '../components/navbar';
import QuestionEditor from '../components/question-editor';
import QuestionSkeleton from '../components/question-skeleton';
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
  const [streamingState, setStreamingState] = useState({
    isStreaming: false,
    total: 0,
    completed: 0
  });

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
  const [generateClickCount, setGenerateClickCount] = useState(0);


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

  // Listen for streaming events
  useEffect(() => {
    const handleStreamingQuestionReady = (event) => {
      const { question, completed, total, chunkIndex, chunkCompleted, chunkTotal, globalIndex } = event.detail;
      
      setQuestions(prevQuestions => {
        const newQuestions = [...prevQuestions];
        
        // Find the skeleton question at the correct position based on globalIndex
        // Since we create skeleton questions in order, we can use globalIndex directly
        const targetIndex = globalIndex;
        
        if (targetIndex < newQuestions.length && newQuestions[targetIndex].isLoading) {
          newQuestions[targetIndex] = {
            prompt: question.prompt,
            difficulty: question.difficulty,
            type: question.type,
            title: "",
            description: "",
            answer: "",
            topic: "",
            isLoading: false,
            questionNumber: question.questionNumber, // Store question number for display
            globalIndex: globalIndex
          };
        } else {
          // If for some reason the index doesn't match, find the first available skeleton
          const skeletonIndex = newQuestions.findIndex(q => q.isLoading);
          if (skeletonIndex !== -1) {
            newQuestions[skeletonIndex] = {
              prompt: question.prompt,
              difficulty: question.difficulty,
              type: question.type,
              title: "",
              description: "",
              answer: "",
              topic: "",
              isLoading: false,
              questionNumber: question.questionNumber,
              globalIndex: globalIndex
            };
          }
        }
        
        return newQuestions;
      });

      setStreamingState(prev => ({
        ...prev,
        completed: completed
      }));
    };

    const handleStreamingStatus = (event) => {
      const { type, message, completed, total, currentChunk, totalChunks } = event.detail;
      
      setStreamingState(prev => ({
        ...prev,
        completed: completed,
        total: total,
        currentChunk: currentChunk,
        totalChunks: totalChunks,
        message: message
      }));
    };

    const handleStreamingComplete = (event) => {
      const { completed, total } = event.detail;
      
      // Remove any remaining skeleton questions
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => !q.isLoading)
      );
      
      setStreamingState({
        isStreaming: false,
        total: 0,
        completed: 0,
        currentChunk: 0,
        totalChunks: 0,
        message: ''
      });
    };

    const handleStreamingCancelled = (event) => {
      const { completed, total, message } = event.detail;
      
      // Remove any remaining skeleton questions
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => !q.isLoading)
      );
      
      setStreamingState({
        isStreaming: false,
        total: 0,
        completed: 0,
        currentChunk: 0,
        totalChunks: 0,
        message: ''
      });
    };

    const handleStreamingError = (event) => {
      const { message, chunkIndex } = event.detail;
      console.error('Streaming error:', message);
      // Optionally show error to user
    };

    window.addEventListener('streamingQuestionReady', handleStreamingQuestionReady);
    window.addEventListener('streamingStatus', handleStreamingStatus);
    window.addEventListener('streamingComplete', handleStreamingComplete);
    window.addEventListener('streamingCancelled', handleStreamingCancelled);
    window.addEventListener('streamingError', handleStreamingError);

    return () => {
      window.removeEventListener('streamingQuestionReady', handleStreamingQuestionReady);
      window.removeEventListener('streamingStatus', handleStreamingStatus);
      window.removeEventListener('streamingComplete', handleStreamingComplete);
      window.removeEventListener('streamingCancelled', handleStreamingCancelled);
      window.removeEventListener('streamingError', handleStreamingError);
    };
  }, []);

  const handleModalSubmit = (data, options = {}) => {
    if (options.isStreaming) {
      // Handle streaming mode - set up skeleton questions
      setStreamingState({
        isStreaming: true,
        total: options.total,
        completed: 0,
        currentChunk: 0,
        totalChunks: Math.ceil(options.total / 5),
        message: 'Preparing generation...'
      });
    }

    data?.map((item, dataIndex) => {
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
          isLoading: item?.isLoading || false,
          loadingIndex: item?.loadingIndex !== undefined ? item.loadingIndex : dataIndex,
          questionNumber: item?.loadingIndex !== undefined ? item.loadingIndex + 1 : dataIndex + 1,
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

  const cancelStreaming = () => {
    // Send cancel event to modal
    window.dispatchEvent(new CustomEvent('cancelStreaming'));
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
              {/* Streaming Progress */}
              {streamingState.isStreaming && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      <span className="text-sm font-medium text-green-700">
                        {streamingState.message || t('streaming.generatingQuestions')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-green-600">
                        {streamingState.completed} / {streamingState.total} {t('streaming.completed')}
                        {streamingState.totalChunks > 1 && (
                          <span className="ml-2 text-xs text-blue-600">
                            ({t('streaming.chunk')} {streamingState.currentChunk}/{streamingState.totalChunks})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={cancelStreaming}
                        className="text-xs px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        {t('streaming.cancel')}
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(streamingState.completed / streamingState.total) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {questions.map((question, index) => (
                  question.isLoading ? (
                    <QuestionSkeleton 
                      key={`skeleton-${index}`}
                      index={index}
                      loadingIndex={question.loadingIndex}
                      total={streamingState.total}
                    />
                  ) : (
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
                  )
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
