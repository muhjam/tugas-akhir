import { useState, useRef, useEffect } from 'react';
import { GoTrash } from 'react-icons/go';
import { IoIosArrowDown } from 'react-icons/io';
import Editor from '../editor';

export default function QuestionEditor({
  index,
  question,
  isGenerating,
  isShow,
  onRemove,
  onInputChange,
  onGenerate,
  onToggleVisibility,
  onTextareaFocus,
  textareaRefs,
  activeSuggestionIndex,
  t
}) {
  return (
    <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="p-4 md:p-6">
        <form onSubmit={(e) => onGenerate(e, index)}>
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            {onRemove && (
              <div className="lg:pt-8">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="w-full lg:w-[40px] h-[40px] bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <GoTrash className='text-lg'/>
                </button>
              </div>
            )}
            <div className="flex-grow space-y-4">
              <div className="space-y-2">
                <label htmlFor={`prompt-${index}`} className="block text-sm font-semibold text-gray-700">
                  {t('main.command')}
                </label>
                <textarea 
                  ref={el => textareaRefs.current[index] = el}
                  id={`prompt-${index}`} 
                  value={question.prompt} 
                  onChange={(e) => onInputChange(index, 'prompt', e.target.value)} 
                  onFocus={(e) => onTextareaFocus(index, e)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (activeSuggestionIndex === index) {
                        onTextareaFocus(null, {}); 
                      }
                    }, 200);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-h-[100px] resize-y" 
                  placeholder={t('main.commandPlaceholder')}
                  required 
                  autoComplete="off"
                />
              </div>
              
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('main.cognitiveLevel')}
                  </label>
                  <select 
                    value={question.difficulty} 
                    onChange={(e) => onInputChange(index, 'difficulty', e.target.value)} 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="c1">{t('main.cognitive.c1')}</option>
                    <option value="c2">{t('main.cognitive.c2')}</option>
                    <option value="c3">{t('main.cognitive.c3')}</option>
                    <option value="c4">{t('main.cognitive.c4')}</option>
                    <option value="c5">{t('main.cognitive.c5')}</option>
                    <option value="c6">{t('main.cognitive.c6')}</option>
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('main.questionType')}
                  </label>
                  <div className="flex gap-2">
                    <select 
                      value={question.type} 
                      onChange={(e) => onInputChange(index, 'type', e.target.value)} 
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="essay">{t('types.essay')}</option>
                      <option value="multipleChoice">{t('types.multipleChoice')}</option>
                    </select>
                    
                    <button 
                      type="submit" 
                      disabled={isGenerating[index]}
                      className={`${isGenerating[index] ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'} px-6 py-2 text-white rounded-lg transition-colors duration-200 flex items-center gap-2`}
                    >
                      {isGenerating[index] ? t('main.creating') : t('main.createQuestion')}
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => onToggleVisibility(index)} 
                      className="bg-blue-500 hover:bg-blue-600 px-3 py-2 text-white rounded-lg transition-colors duration-200"
                    >
                      <IoIosArrowDown className={`text-xl transition-transform duration-200 ${isShow.includes(index) ? '-rotate-180' : ''}`}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div className={`transition-all duration-300 ${isShow.includes(index) ? 'max-h-[1280px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        <div className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t('main.title_field')}
            </label>
            <input 
              type="text" 
              value={question.title} 
              onChange={(e) => onInputChange(index, 'title', e.target.value)} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              required 
            />
          </div>
          
          <div>
            <Editor 
              label={t('main.description')} 
              id="description" 
              index={index} 
              value={question.description} 
              onChange={onInputChange} 
            />
          </div>
          
          <div>
            <Editor 
              label={t('main.answer')} 
              id="answer" 
              index={index} 
              value={question.answer} 
              onChange={onInputChange} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {t('main.branch')}
            </label>
            <input 
              type="text" 
              value={question.topic} 
              onChange={(e) => onInputChange(index, 'topic', e.target.value)} 
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              required 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
