import React from 'react';
import type { ExerciseDetails } from '../types.ts';

interface HowToModalProps {
  exerciseDetails: ExerciseDetails;
  onClose: () => void;
}

const TutorialRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        
        if (line.startsWith('**') && line.endsWith('**')) {
          return (
            <h4 key={index} className="text-md font-semibold text-blue-400 pt-4 first:pt-0 pb-1">
              {line.replace(/\*\*/g, '')}
            </h4>
          );
        }
        
        if (line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex items-start pl-2">
              <span className="text-blue-400 mr-3 mt-1 text-xs">&#9679;</span>
              <p className="flex-1 text-gray-300 text-sm">{line.trim().substring(1).trim()}</p>
            </div>
          );
        }
        
        if (line.match(/^\d+\./)) {
           const content = line.replace(/^\d+\.\s*/, '');
           const number = line.match(/^\d+/)?.[0];
           return (
            <div key={index} className="flex items-start pl-2">
              <span className="text-gray-400 font-medium mr-2 text-sm">{number}.</span>
              <p className="flex-1 text-gray-300 text-sm">{content}</p>
            </div>
           );
        }
        
        return <p key={index} className="text-gray-300 text-sm">{line}</p>;
      })}
    </div>
  );
};


const HowToModal: React.FC<HowToModalProps> = ({ exerciseDetails, onClose }) => {

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = exerciseDetails.videoUrl ? getYouTubeId(exerciseDetails.videoUrl) : null;
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0` : '';

  const hasMedia = exerciseDetails.gifUrl || embedUrl;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-[70]" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 overflow-hidden flex flex-col h-[90vh] max-h-[800px]" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex justify-between items-center border-b border-gray-700 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white">{exerciseDetails.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </header>
        
        <div className="p-4 md:p-6 overflow-y-auto">
          {hasMedia ? (
            <div className="bg-black rounded-lg mb-6 shadow-lg">
              {exerciseDetails.gifUrl ? (
                <img src={exerciseDetails.gifUrl} alt={`Demonstração de ${exerciseDetails.name}`} className="w-full h-auto rounded-lg" />
              ) : embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={exerciseDetails.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                  ></iframe>
                </div>
              ) : null}
            </div>
          ) : (
             <div className="text-center p-4 bg-gray-900/50 rounded-lg mb-6">
                <p className="text-gray-400">Nenhuma mídia de demonstração disponível.</p>
             </div>
          )}

          {exerciseDetails.tutorial ? (
            <div className={hasMedia ? "border-t border-gray-700 pt-6" : ""}>
               <TutorialRenderer text={exerciseDetails.tutorial} />
            </div>
          ) : (
             <div className="text-center">
                <p className="text-gray-400">Nenhum tutorial em texto disponível para este exercício.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HowToModal;