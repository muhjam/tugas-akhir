import { useState, useRef, useEffect } from 'react';

const suggestionList = [
  {
    label: "Algebra",
    value: "Buatkan soal yang menguji pemahaman siswa tentang konsep dasar aljabar, termasuk operasi dan persamaan aljabar."
  },
  {
    label: "Trigonometry",
    value: "Buatkan soal yang melatih kemampuan siswa dalam memahami dan menerapkan konsep trigonometri, seperti sudut dan identitas trigonometri."
  },
  {
    label: "Calculus",
    value: "Rancang soal yang menguji keterampilan siswa dalam kalkulus, termasuk diferensiasi dan integrasi fungsi."
  },
  {
    label: "Geometry",
    value: "Buatkan soal yang menilai pemahaman siswa tentang konsep geometri, termasuk bentuk, ukuran, dan sifat ruang."
  },
  {
    label: "Statistics",
    value: "Kembangkan soal yang menguji kemampuan siswa dalam statistika, termasuk analisis data dan interpretasi hasil statistik."
  },
  {
    label: "Probability",
    value: "Buat soal yang melatih siswa dalam memahami konsep probabilitas dan penerapannya dalam berbagai situasi."
  },
  {
    label: "Number Theory",
    value: "Rancang soal yang menguji pengetahuan siswa tentang teori bilangan, termasuk faktor, kelipatan, dan bilangan prima."
  },
  {
    label: "Linear Algebra",
    value: "Buatkan soal yang menguji pemahaman siswa tentang aljabar linear, termasuk matriks dan vektor."
  },
  {
    label: "Discrete Mathematics",
    value: "Kembangkan soal yang melatih siswa dalam konsep matematika diskrit, seperti graf dan kombinatorik."
  },
  {
    label: "Mathematical Logic",
    value: "Buat soal yang menguji kemampuan siswa dalam logika matematika, termasuk proposisi dan pembuktian."
  },
];

const ModalPrompt = ({ isOpen, onClose, onSubmit }) => {
  const [isGenerating, setIsGenerating] = useState(false); 
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    total: 1,
    difficulty: 'Acak',
    type: 'Acak',
    reference: ''
  });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const abortControllerRef = useRef(null);
  const blurTimeoutRef = useRef(null);

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
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

  async function onGenerate(event) {
    event.preventDefault();
    const { prompt, difficulty, type, total, reference } = formData;
    setIsGenerating(true);
  
    abortControllerRef.current = new AbortController();
  
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: abortControllerRef.current.signal, 
        body: JSON.stringify({ prompt, type, difficulty, reference, mode: "list", total: total }),
      });
  
      const data = await response.json();
      const results = data.result.split("<_>").map(item => item.trim());
      const questions = results.map((item) => {
        const [prompt, thisDifficulty, type] = item.split("|->").map(part => part.trim());
        const settingDifficulty = difficulty === "Acak" ? thisDifficulty : difficulty;
        return { prompt, difficulty: settingDifficulty, type };
      });

      onSubmit(questions);
      onClose();

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
      } else {
        console.error(error);
        alert(error.message);
      }
    } finally {
      setIsGenerating(false);
    }
  }

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
  onClose();
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleOutsideClick}>
      <div className="bg-white w-full max-w-md px-6 pt-6 rounded-lg shadow-lg max-h-[600px] overflow-scroll">
        <h2 className="text-xl font-semibold mb-4">Membuat Perintah Soal AI Otomatis</h2>
        <form onSubmit={onGenerate}>
        <div className="mb-4 relative">
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              Perintah:
            </label>
            <input
              type="text"
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Contoh: Ujian Tengah Semester Matematika"
              autoComplete="off"
              required
            />
            {filteredSuggestions?.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                {filteredSuggestions.map((s, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(s.value)}
                  >
                    <strong>{s.label}:</strong> {s.value}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="total" className="block text-sm font-medium mb-1">
              Jumlah Soal:
            </label>
            <input
              type="number"
              id="total"
              value={formData.total}
              onChange={(e) => handleChange('total', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              min="1"
              max="100"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium mb-1 capitalize">
              tingkat kognitif:
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
                <option value="Acak">Acak</option>
                <option value="C2 (Memahami)">C2 (Memahami)</option>
                <option value="C3 (Menerapkan)">C3 (Menerapkan)</option>
                <option value="C4 (Menganalisis)">C4 (Menganalisis)</option>
                <option value="C5 (Mengevaluasi)">C5 (Mengevaluasi)</option>
                <option value="C6 (Mencipta)">C6 (Mencipta)</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="type" className="block text-sm font-medium mb-1">
              Tipe Soal:
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Acak">Acak</option>
              <option value="Essay">Essay</option>
              <option value="PG">PG</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium mb-1">
              Unggah Silabus:
            </label>
            <input
              type="file"
              id="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="mb-4">
            {!isParsing && formData?.reference?.length > 0 ? (
              <textarea 
              value={formData.reference}
              className='w-full h-[200px]' 
              readOnly={true}
              ></textarea>
            ): isParsing &&(
              <>Membaca...</>
            )}
             
          </div>
          <div className="flex justify-end gap-2 sticky bottom-0 py-4 bg-white">
            <button
              type="button"
              onClick={handleClose}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating || isParsing}
              className={`${isGenerating || isParsing ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
            >
              {isGenerating ? 'Membuat...': 'Buat Perintah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPrompt;
