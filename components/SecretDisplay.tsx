
import React from 'react';
import { Secret } from '../types';
import { CheckCircle, Link, Image, Video, MessageSquare } from 'lucide-react';

interface SecretDisplayProps {
  secret: Secret;
  title: string;
  moves?: number;
}

const SecretDisplay: React.FC<SecretDisplayProps> = ({ secret, title, moves }) => {
  const renderSecret = () => {
    switch (secret.type) {
      case 'text':
        return (
            <div className="flex items-start gap-3 p-4 bg-slate-700 rounded-lg">
                <MessageSquare className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <p className="text-lg text-slate-200 break-words">{secret.value}</p>
            </div>
        );
      case 'url':
        return (
            <div className="flex items-start gap-3 p-4 bg-slate-700 rounded-lg">
                <Link className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <a href={secret.value} target="_blank" rel="noopener noreferrer" className="text-lg text-cyan-400 hover:underline break-all">
                    {secret.value}
                </a>
            </div>
        );
      case 'image':
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2"><Image className="w-5 h-5 text-cyan-400" /> <p className="text-slate-300">Image revealed:</p></div>
                <img src={secret.value} alt="Secret Reward" className="max-w-full mx-auto rounded-lg shadow-lg" />
            </div>
        );
      case 'video':
        return (
            <div className="space-y-2">
                 <div className="flex items-center gap-2"><Video className="w-5 h-5 text-cyan-400" /> <p className="text-slate-300">Video revealed:</p></div>
                <video controls src={secret.value} className="max-w-full mx-auto rounded-lg shadow-lg" />
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="text-center p-6 bg-slate-800 rounded-xl shadow-2xl border border-cyan-500/30">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">{title}</h2>
        {typeof moves !== 'undefined' && (
            <p className="text-slate-400 mb-6">Completed in {moves} {moves === 1 ? 'move' : 'moves'}.</p>
        )}
        <div className="my-6">
            <h3 className="text-xl font-semibold text-slate-300 mb-4">Your Reward:</h3>
            {renderSecret()}
        </div>
    </div>
  );
};

export default SecretDisplay;
