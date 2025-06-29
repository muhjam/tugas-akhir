import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'next-i18next';

const ModalPrompt = ({ isOpen, onClose, onSubmit }) => {
  const { t, i18n } = useTranslation('common');
  const [isGenerating, setIsGenerating] = useState(false); 
  const [isParsing, setIsParsing] = useState(false);
  const [streamingQuestions, setStreamingQuestions] = useState([]);
  const [formData, setFormData] = useState({
    prompt: '',
    total: 1,
    difficulty: t('difficulties.random'),
    type: t('types.random'),
    reference: ''
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const abortControllerRef = useRef(null);
  const eventSourceRef = useRef(null);
  const blurTimeoutRef = useRef(null);
  const collectedQuestionsRef = useRef([]);

  const suggestionList = [
    {
      label: t('suggestions.algebra.label'),
      value: t('suggestions.algebra.value')
    },
    {
      label: t('suggestions.trigonometry.label'),
      value: t('suggestions.trigonometry.value')
    },
    {
      label: t('suggestions.calculus.label'),
      value: t('suggestions.calculus.value')
    },
    {
      label: t('suggestions.geometry.label'),
      value: t('suggestions.geometry.value')
    },
    {
      label: t('suggestions.statistics.label'),
      value: t('suggestions.statistics.value')
    },
    {
      label: t('suggestions.probability.label'),
      value: t('suggestions.probability.value')
    },
    {
      label: t('suggestions.numberTheory.label'),
      value: t('suggestions.numberTheory.value')
    },
    {
      label: t('suggestions.linearAlgebra.label'),
      value: t('suggestions.linearAlgebra.value')
    },
    {
      label: t('suggestions.discreteMath.label'),
      value: t('suggestions.discreteMath.value')
    },
    {
      label: t('suggestions.mathLogic.label'),
      value: t('suggestions.mathLogic.value')
    }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    if (field === 'prompt') {
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

  const handleFocus = () => {
    setFilteredSuggestions(suggestionList);
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setFilteredSuggestions([]);
    }, 200);
  };

  // Cleanup timeout and event source on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSuggestionClick = (suggestion) => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
    }
    setFormData({ ...formData, prompt: suggestion });
    setFilteredSuggestions([]);
  };

  // Streaming generation function
  async function onGenerateStreaming(event) {
    event.preventDefault();
    const { prompt, difficulty, type, total, reference } = formData;
    
    // Prepare skeleton data for immediate submission
    const skeletonQuestions = Array.from({ length: parseInt(total) }, (_, index) => ({
      prompt: prompt,
      difficulty: difficulty === t('difficulties.random') ? "c1" : difficulty,
      type: type === t('types.random') ? "essay" : type,
      title: "",
      description: "",
      answer: "",
      topic: "",
      isLoading: true,
      loadingIndex: index
    }));

    // Submit skeleton questions immediately and close modal
    onSubmit(skeletonQuestions, { isStreaming: true, total: parseInt(total) });
    onClose();
    
    setIsGenerating(true);
    setStreamingQuestions([]);
    collectedQuestionsRef.current = [];

    try {
      // Create a POST request to initiate streaming
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt, 
          type, 
          difficulty, 
          reference, 
          mode: "list", 
          total: total, 
          lang: i18n.language,
          stream: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start streaming');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'question') {
                collectedQuestionsRef.current.push(data.data);
                setStreamingQuestions(prev => [...prev, data.data]);
                
                // Send update to parent via window event
                window.dispatchEvent(new CustomEvent('streamingQuestionReady', {
                  detail: {
                    question: data.data,
                    completed: data.completed,
                    total: data.total
                  }
                }));
              } else if (data.type === 'progress') {
                // Progress updates are handled by parent page
              } else if (data.type === 'status') {
                // Status updates are handled by parent page
              } else if (data.type === 'complete') {
                // Send complete event to parent
                window.dispatchEvent(new CustomEvent('streamingComplete', {
                  detail: {
                    completed: data.completed,
                    total: data.total
                  }
                }));
              } else if (data.type === 'error') {
                console.error('Streaming error:', data.message);
                
                // Send error event to parent
                window.dispatchEvent(new CustomEvent('streamingError', {
                  detail: {
                    message: data.message,
                    completed: data.completed,
                    total: data.total
                  }
                }));
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }

      // No need to submit collected questions - parent is handling via events

    } catch (error) {
      console.error('Streaming error:', error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
      collectedQuestionsRef.current = [];
    }
  }

  // All generation now uses streaming by default
  const onGenerate = onGenerateStreaming;

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64File = btoa(e.target.result); 
        setIsParsing(true);
        try {
          const response = await fetch('/api/pdf-parse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64File }),
          });
          const data = await response.json();
          handleChange('reference', data.text);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          alert('Failed to parse PDF');
        } finally {
          setIsParsing(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

const handleOutsideClick = (event) => {
  if (event.target === event.currentTarget && !isGenerating) {
    onClose();
  }
};

const handleClose = () => {
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }
  if (eventSourceRef.current) {
    eventSourceRef.current.close();
  }
  // Reset streaming state
  setIsGenerating(false);
  setStreamingQuestions([]);
  collectedQuestionsRef.current = [];
  onClose();
};

useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }
  
  return () => {
    document.body.style.overflow = 'unset';
  };
}, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-1" onClick={handleOutsideClick}>
      <div className="bg-white w-full md:max-w-md px-2 md:px-6 pt-6 rounded-lg shadow-lg max-h-[600px] overflow-y-scroll overflow-x-hidden">
        <h2 className="text-xl font-semibold mb-4">{t('modal.title')}</h2>
        <form onSubmit={onGenerate}>
          <div className="mb-4 relative">
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              {t('modal.prompt')}
            </label>
            <input
              type="text"
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
            />
            {filteredSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion.value)}
                  >
                    <div className="font-medium text-blue-600">{suggestion.label}</div>
                    <div className="text-sm text-gray-600">{suggestion.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
              {t('modal.difficulty')}
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={t('difficulties.random')}>{t('difficulties.random')}</option>
              <option value={t('difficulties.easy')}>{t('difficulties.easy')}</option>
              <option value={t('difficulties.medium')}>{t('difficulties.medium')}</option>
              <option value={t('difficulties.hard')}>{t('difficulties.hard')}</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              {t('modal.type')}
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={t('types.random')}>{t('types.random')}</option>
              <option value={t('types.multipleChoice')}>{t('types.multipleChoice')}</option>
              <option value={t('types.essay')}>{t('types.essay')}</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="total" className="block text-sm font-medium mb-1">
              {t('modal.total')}
            </label>
            <input
              type="number"
              id="total"
              min="1"
              max="100"
              value={formData.total}
              onChange={(e) => handleChange('total', parseInt(e.target.value))}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reference" className="block text-sm font-medium mb-1">
              {t('modal.reference')}
            </label>
            <textarea
              id="reference"
              value={formData.reference}
              onChange={(e) => handleChange('reference', e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            />
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="mt-2"
            />
            {isParsing && <p className="text-sm text-gray-600 mt-1">{t('modal.uploading')}</p>}
          </div>



          

          <div className="sticky bottom-0 left-0 right-0 bg-white pt-2 flex justify-end space-x-2 pb-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isGenerating}
            >
              {t('modal.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
              disabled={isGenerating}
            >
              {isGenerating ? t('modal.generating') : t('modal.generate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPrompt;
