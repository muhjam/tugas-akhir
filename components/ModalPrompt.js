import { useState } from 'react';

const ModalPrompt = ({ isOpen, onClose, onSubmit }) => {
  const [isGenerating, setIsGenerating] = useState(false); 
  const [isParsing, setIsParsing] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    total: 1,
    difficulty: 'Acak',
    type: 'Acak',
    detail: ''
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  async function onGenerate(event) {
    event.preventDefault();
    const { prompt, difficulty, type, total, detail } = formData;
    setIsGenerating(true);
  
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt, type, difficulty, detail, mode: "list", total: total }),
      });
  
      const data = await response.json();
      const results = data.result.split("\n").map(item => item.trim());
      const questions = results.map((item) => {
        const [prompt, thisDifficulty, type] = item.split("|->").map(part => part.trim());
        const settingDifficulty = difficulty === "Acak" ? thisDifficulty : difficulty;
        return { prompt, difficulty: settingDifficulty, type };
      });

      // Pass the generated questions back to the parent component
      onSubmit(questions);
      onClose();

    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64File = btoa(e.target.result); // Convert to base64
        setIsParsing(true); // Set loading true saat mulai parsing
        try {
          const response = await fetch('/api/pdfParse', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: base64File }), // Send base64 file
          });
          const data = await response.json();
          handleChange('detail', data.text);
        } catch (error) {
          console.error('Error parsing PDF:', error);
          alert('Failed to parse PDF');
        } finally {
          setIsParsing(false); // Set loading false setelah selesai parsing
        }
      };
      reader.readAsBinaryString(file);
    }
  };

const handleOutsideClick = (event) => {
  if (event.target === event.currentTarget) {
    onClose();
  }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleOutsideClick}>
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg max-h-[500px] overflow-scroll">
        <h2 className="text-xl font-semibold mb-4">Generate Prompt Soal</h2>
        <form onSubmit={onGenerate}>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium mb-1">
              Prompt:
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
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium mb-1">
              Tingkat Kesulitan:
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="Acak">Acak</option>
              <option value="Mudah">Mudah</option>
              <option value="Normal">Normal</option>
              <option value="Sulit">Sulit</option>
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
            {!isParsing && formData?.detail?.length > 0 ? (
              <textarea 
              value={formData.detail} // Tampilkan 'Loading...' saat loading
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
              onClick={onClose}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className={`${isGenerating ? 'bg-gray-300 cursor-wait' : 'bg-green-500 hover:bg-green-600'} text-white font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5`}
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalPrompt;
