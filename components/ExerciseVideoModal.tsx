import React from 'react';

interface ExerciseVideoModalProps {
  videoUrl: string;
  exerciseName: string;
  onClose: () => void;
}

const ExerciseVideoModal: React.FC<ExerciseVideoModalProps> = ({ videoUrl, exerciseName, onClose }) => {
  // Simple YouTube URL parser to get video ID
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : '';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex justify-center items-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{exerciseName}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
        </div>
        <div className="p-4">
          {embedUrl ? (
            <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg">
              <iframe
                src={embedUrl}
                title={exerciseName}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            <p className="text-center text-gray-400">Vídeo indisponível.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseVideoModal;
