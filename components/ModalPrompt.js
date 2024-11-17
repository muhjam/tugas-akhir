import { useState } from 'react';

const ModalPrompt = ({ isOpen, onClose, onSubmit }) => {
  const [isGenerating, setIsGenerating] = useState(false); 
  const [formData, setFormData] = useState({
    prompt: '',
    total: 1,
    difficulty: 'Acak',
    type: 'Acak',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  async function onGenerate(event) {
    event.preventDefault();
    const { prompt, difficulty, type, total } = formData;
    setIsGenerating(true);
  
    try {
      const response = await fetch('/api/generate', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: prompt, type, difficulty, mode: "list", total: total }),
      });
  
      const data = await response.json();
      const results = data.result.split("\n").map(item => item.trim());
      const questions = results.map((item) => {
        const [prompt, _, type] = item.split("|").map(part => part.trim());
        return { prompt, difficulty, type };
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Generate Soal</h2>
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
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
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
