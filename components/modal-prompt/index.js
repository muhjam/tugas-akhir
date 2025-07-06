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

    // Create AbortController for cancellation
    abortControllerRef.current = new AbortController();
    let isCancelled = false;

    try {
      const totalQuestions = parseInt(total);
      
      // Split into chunks of 5
      const chunkSize = 5;
      const chunks = [];
      let startIndex = 1;
      
      while (startIndex <= totalQuestions) {
        const endIndex = Math.min(startIndex + chunkSize - 1, totalQuestions);
        const currentChunkSize = endIndex - startIndex + 1;
        chunks.push({
          start: startIndex,
          end: endIndex,
          size: currentChunkSize
        });
        startIndex = endIndex + 1;
      }

      let totalCompleted = 0;

      // Send initial status
      window.dispatchEvent(new CustomEvent('streamingStatus', {
        detail: {
          type: 'status',
          message: 'Starting generation...',
          total: totalQuestions,
          completed: 0,
          chunks: chunks.length
        }
      }));

      // Process each chunk
      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        // Check if cancelled
        if (abortControllerRef.current?.signal.aborted) {
          isCancelled = true;
          break;
        }

        const chunk = chunks[chunkIndex];
        
        // Send chunk progress
        window.dispatchEvent(new CustomEvent('streamingStatus', {
          detail: {
            type: 'progress',
            message: t('streaming.processingChunk', { 
              chunkIndex: chunkIndex + 1, 
              totalChunks: chunks.length, 
              start: chunk.start, 
              end: chunk.end 
            }),
            total: totalQuestions,
            completed: totalCompleted,
            currentChunk: chunkIndex + 1,
            totalChunks: chunks.length
          }
        }));

        try {
          // Create a POST request to initiate streaming for this chunk
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
              total: chunk.size,
              range: { start: chunk.start, end: chunk.end },
              lang: i18n.language,
              stream: true
            }),
            signal: abortControllerRef.current.signal
          });

          if (!response.ok) {
            throw new Error(t('streaming.failedToStartStreaming', { chunkIndex: chunkIndex + 1 }));
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let chunkCompleted = 0;

          while (true) {
            // Check if cancelled
            if (abortControllerRef.current?.signal.aborted) {
              isCancelled = true;
              reader.cancel();
              break;
            }

            const { done, value } = await reader.read();
            if (done) break;

            const chunkData = decoder.decode(value);
            const lines = chunkData.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'question') {
                    // Calculate correct global index based on chunk position
                    const globalIndex = chunk.start + chunkCompleted - 1;
                    
                    // Adjust question index for global position
                    const adjustedQuestion = {
                      ...data.data,
                      index: globalIndex,
                      questionNumber: chunk.start + chunkCompleted, // Add question number for display
                      chunkIndex: chunkIndex,
                      chunkPosition: chunkCompleted + 1
                    };
                    
                    collectedQuestionsRef.current.push(adjustedQuestion);
                    setStreamingQuestions(prev => [...prev, adjustedQuestion]);
                    chunkCompleted++;
                    
                    // Send update to parent via window event
                    window.dispatchEvent(new CustomEvent('streamingQuestionReady', {
                      detail: {
                        question: adjustedQuestion,
                        completed: totalCompleted + chunkCompleted,
                        total: totalQuestions,
                        chunkIndex: chunkIndex,
                        chunkCompleted: chunkCompleted,
                        chunkTotal: chunk.size,
                        globalIndex: globalIndex
                      }
                    }));
                  } else if (data.type === 'complete') {
                    // Chunk completed
                    totalCompleted += chunkCompleted;
                    break;
                  } else if (data.type === 'error') {
                    console.error('Streaming error:', data.message);
                    
                    // Send error event to parent
                    window.dispatchEvent(new CustomEvent('streamingError', {
                      detail: {
                        message: t('streaming.chunkError', { chunkIndex: chunkIndex + 1, message: data.message }),
                        completed: totalCompleted + chunkCompleted,
                        total: totalQuestions,
                        chunkIndex: chunkIndex
                      }
                    }));
                  }
                } catch (e) {
                  console.error('Error parsing streaming data:', e);
                }
              }
            }
          }

          // If cancelled during this chunk, break
          if (isCancelled) {
            break;
          }

        } catch (error) {
          if (error.name === 'AbortError') {
            isCancelled = true;
            break;
          }
          
          console.error(`Error in chunk ${chunkIndex + 1}:`, error);
          
          // Send error event to parent
          window.dispatchEvent(new CustomEvent('streamingError', {
            detail: {
              message: t('streaming.chunkError', { chunkIndex: chunkIndex + 1, message: error.message }),
              completed: totalCompleted,
              total: totalQuestions,
              chunkIndex: chunkIndex
            }
          }));
        }
      }

      // Send final status
      if (isCancelled) {
        window.dispatchEvent(new CustomEvent('streamingCancelled', {
          detail: {
            completed: totalCompleted,
            total: totalQuestions,
            message: t('streaming.generationCancelled')
          }
        }));
      } else {
        window.dispatchEvent(new CustomEvent('streamingComplete', {
          detail: {
            completed: totalCompleted,
            total: totalQuestions,
            message: t('streaming.allChunksCompleted')
          }
        }));
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Generation cancelled by user');
      } else {
        console.error('Streaming error:', error);
        window.dispatchEvent(new CustomEvent('streamingError', {
          detail: {
            message: error.message,
            completed: 0,
            total: parseInt(total)
          }
        }));
      }
    } finally {
      setIsGenerating(false);
      collectedQuestionsRef.current = [];
      abortControllerRef.current = null;
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
          alert(t('streaming.failedToParsePdf'));
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

// Listen for cancel streaming event
useEffect(() => {
  const handleCancelStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  window.addEventListener('cancelStreaming', handleCancelStreaming);
  
  return () => {
    window.removeEventListener('cancelStreaming', handleCancelStreaming);
  };
}, []);

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
