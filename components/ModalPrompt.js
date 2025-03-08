import { useState, useRef } from 'react';

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
  const abortControllerRef = useRef(null);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
          const response = await fetch('/api/pdfParse', {
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
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg max-h-[500px] overflow-scroll">
        <h2 className="text-xl font-semibold mb-4">Generate Prompt Soal</h2>
        <form onSubmit={onGenerate}>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              Perintah:
            </label>
            <input
              type="text"
              id="prompt"
              value={formData.prompt}
              onChange={(e) => handleChange('prompt', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Contoh: Tentang matematika dasar"
              required
            />
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
                <option value="C1 (Mengingat)">C1 (Mengingat)</option>
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
              Unggah PDF:
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
              className='w-full h-[80px]' 
              readOnly={true}
              ></textarea>
            ): isParsing &&(
              <>Loading...</>
            )}
             
          </div>
          <div className="flex justify-end gap-2">
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
              {isGenerating ? 'Loading...': 'Generate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPrompt;
