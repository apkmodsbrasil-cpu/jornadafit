import React from 'react';
import type { ExerciseDetails } from '../types.ts';

interface RoutineHowToModalProps {
  itemDetails: ExerciseDetails;
  onClose: () => void;
}

const RoutineHowToModal: React.FC<RoutineHowToModalProps> = ({ itemDetails, onClose }) => {
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = itemDetails.videoUrl ? getYouTubeId(itemDetails.videoUrl) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : '';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[80]" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-700 overflow-hidden flex flex-col h-auto max-h-[90vh] m-4" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">{itemDetails.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>
        
        <div className="p-4 md:p-6 overflow-y-auto">
            {itemDetails.tutorial && <p className="text-gray-300">{itemDetails.tutorial}</p>}
            
            <div className="bg-black rounded-lg mt-6 shadow-lg">
              {itemDetails.gifUrl ? (
                 <img src={itemDetails.gifUrl} alt={`Demonstração de ${itemDetails.name}`} className="w-full h-auto rounded-lg" />
              ) : embedUrl ? (
                <div className="aspect-video">
                  <iframe
                      src={embedUrl}
                      title={itemDetails.name}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                  ></iframe>
                </div>
              ) : (
                <div className="p-4 bg-gray-700/50 rounded-lg text-center text-gray-400 text-sm">
                    Mídia de demonstração indisponível.
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineHowToModal;