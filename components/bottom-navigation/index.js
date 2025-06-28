import React from 'react';
import { RiPlayListAddFill } from 'react-icons/ri';
import { LuPlus } from 'react-icons/lu';
import { IoIosStarOutline } from 'react-icons/io';

export default function BottomNavigation({ 
  nuptk, 
  nama, 
  onOpenModal, 
  onAddQuestion,
  t 
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
      <div className="max-w-[1080px] mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex justify-center">
            <a      
              href={`#tally-open=m61EBN&tally-layout=modal&tally-emoji-text=👋&tally-emoji-animation=wave&nuptk=${nuptk}&nama=${nama}`}
              className="flex flex-col items-center gap-1 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
            >
              <IoIosStarOutline className="text-2xl" />
              <span className="text-xs font-medium">{t('main.feedback')}</span>
            </a>
          </div>
          <div className="flex-1 flex justify-center">
            <button 
              onClick={onOpenModal}
              className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <RiPlayListAddFill className="text-2xl" />
              <span className="text-xs font-medium">{t('main.generate') || 'Buat Otomatis'}</span>
            </button>
          </div>
          <div className="flex-1 flex justify-center">
            <button 
              onClick={onAddQuestion}
              className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              <LuPlus className="text-2xl" />
              <span className="text-xs font-medium">{t('main.addQuestion') || 'Tambah Soal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
