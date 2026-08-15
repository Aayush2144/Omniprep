import React, { useState } from 'react';
import { useTracker } from '../../context/TrackerContext';
import { BookA, Plus, Search, CheckCircle2, Volume2, Sparkles, Star } from 'lucide-react';

export const VocabularyVault = () => {
  const { data, addVocabularyWord, updateVocabStatus } = useTracker();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [word, setWord] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState('adjective');
  const [meaning, setMeaning] = useState('');
  const [example, setExample] = useState('');
  const [synonyms, setSynonyms] = useState('');

  const vocabulary = data.english?.vocabulary || [];

  const filteredVocab = vocabulary.filter(v =>
    v.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = (e) => {
    e.preventDefault();
    if (!word.trim() || !meaning.trim()) return;
    addVocabularyWord({
      word: word.trim(),
      phonetic: phonetic.trim() || `/${word.toLowerCase()}/`,
      partOfSpeech,
      meaning: meaning.trim(),
      example: example.trim() || `The concept is ${word.toLowerCase()}.`,
      synonyms: synonyms ? synonyms.split(',').map(s => s.trim()) : [],
      status: 'Learning'
    });
    setWord('');
    setMeaning('');
    setExample('');
    setSynonyms('');
    setIsAdding(false);
  };

  const statusMap = {
    'Mastered': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    'Practicing': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'Learning': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
  };

  const cycleStatus = (id, current) => {
    const next = current === 'Learning' ? 'Practicing' : current === 'Practicing' ? 'Mastered' : 'Learning';
    updateVocabStatus(id, next);
  };

  // Word of the Day (First word in list)
  const wordOfTheDay = vocabulary[0];

  return (
    <div className="space-y-6">
      
      {/* Word of the Day Spotlight */}
      {wordOfTheDay && (
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Word of the Day</span>
              <span className="text-[10px] text-slate-400 font-mono">{wordOfTheDay.phonetic}</span>
            </div>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-xl font-bold text-white">{wordOfTheDay.word}</h3>
              <span className="text-xs text-rose-300 italic">({wordOfTheDay.partOfSpeech})</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">{wordOfTheDay.meaning}</p>
            <p className="text-[11px] text-slate-400 mt-1 italic">"{wordOfTheDay.example}"</p>
          </div>

          <button
            onClick={() => cycleStatus(wordOfTheDay.id, wordOfTheDay.status)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold self-start md:self-center transition ${statusMap[wordOfTheDay.status]}`}
          >
            Status: {wordOfTheDay.status}
          </button>
        </div>
      )}

      {/* Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search words, idioms, meanings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Vocabulary Word</span>
        </button>
      </div>

      {/* Add Word Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-3 animate-slide-up">
          <h4 className="text-xs font-semibold text-white">Add New Word / Idiom to Vault</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Word (e.g. Ubiquitous)"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Phonetic (e.g. /juːˈbɪk.wɪ.təs/)"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            />
            <select
              value={partOfSpeech}
              onChange={(e) => setPartOfSpeech(e.target.value)}
              className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="adjective">adjective</option>
              <option value="noun">noun</option>
              <option value="verb">verb</option>
              <option value="adverb">adverb</option>
              <option value="idiom">idiom / phrase</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Definition / Meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Example sentence in Data Science or Tech context..."
            value={example}
            onChange={(e) => setExample(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <input
            type="text"
            placeholder="Synonyms (comma separated, e.g. omnipresent, pervasive)"
            value={synonyms}
            onChange={(e) => setSynonyms(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          />
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold">Save to Vault</button>
          </div>
        </form>
      )}

      {/* Vocabulary Word Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredVocab.map((v) => (
          <div key={v.id} className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2.5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">{v.word}</h4>
                  <div className="text-[10px] text-slate-400 font-mono">{v.phonetic} • <span className="italic">{v.partOfSpeech}</span></div>
                </div>
                <button
                  onClick={() => cycleStatus(v.id, v.status)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold transition ${statusMap[v.status]}`}
                  title="Click to cycle Mastery Status"
                >
                  {v.status}
                </button>
              </div>

              <p className="text-xs text-slate-300 mt-2">{v.meaning}</p>
              
              {v.example && (
                <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-white/5 mt-2 italic">
                  "{v.example}"
                </p>
              )}
            </div>

            {v.synonyms && v.synonyms.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2 border-t border-white/5">
                {v.synonyms.map((syn, idx) => (
                  <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {syn}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
