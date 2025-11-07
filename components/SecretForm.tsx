
import React from 'react';
import { Secret, SecretType } from '../types';
import { Input } from './ui/Input';

interface SecretFormProps {
  secret: Secret;
  onSecretChange: (secret: Secret) => void;
}

const SecretForm: React.FC<SecretFormProps> = ({ secret, onSecretChange }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSecretChange({ ...secret, type: e.target.value as SecretType });
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSecretChange({ ...secret, value: e.target.value });
  };

  const getInputType = () => {
    switch (secret.type) {
      case 'url':
      case 'image':
      case 'video':
        return 'url';
      default:
        return 'text';
    }
  };

  return (
    <div className="p-4 border border-slate-700 rounded-lg space-y-4 bg-slate-800/50">
      <h3 className="font-semibold text-lg text-slate-300">Secret Reward</h3>
      <p className="text-sm text-slate-400">This will be revealed when the puzzle is solved.</p>
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <label className="block mb-2 text-sm font-medium text-slate-300">Type</label>
          <select 
            value={secret.type} 
            onChange={handleTypeChange}
            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
          >
            <option value="text">Text</option>
            <option value="url">Website URL</option>
            <option value="image">Image URL</option>
            <option value="video">Video URL</option>
          </select>
        </div>
        <div className="flex-grow">
          <label className="block mb-2 text-sm font-medium text-slate-300">Content</label>
          <Input 
            type={getInputType()}
            value={secret.value} 
            onChange={handleValueChange} 
            placeholder={
                secret.type === 'text' ? 'Enter secret message' : 'https://example.com/...'
            }
          />
        </div>
      </div>
    </div>
  );
};

export default SecretForm;
