import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [generateClickCount, setGenerateClickCount] = useState(0);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(null);
  const [isFoucused, setIsFocused] = useState(false);
  const [suggestionPosition, setSuggestionPosition] = useState({ top: 0, left: 0, width: 0 });
  const textareaRefs = useRef({});

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
    
    return suggestions[i18n.language] || suggestions.id;
  }, [i18n.language]); // Update when language changes

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
            
            <div className="max-w-[1080px] w-full container mx-auto px-1 lg:px-4 py-6">
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

          {/* Suggestion List */}
          <SuggestionList
            activeSuggestionIndex={activeSuggestionIndex}
            filteredSuggestions={filteredSuggestions}
            suggestionPosition={suggestionPosition}
            onSuggestionClick={handleSuggestionClick}
          />

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
