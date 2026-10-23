import React, { useState } from 'react';
import { QuizQuestion } from '../types/gis';
import { QUIZ_QUESTIONS } from '../data/lahendongData';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Award,
  BookOpen
} from 'lucide-react';

interface KnowledgeQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  preTestScore: number | undefined;
  setPreTestScore: (score: number) => void;
  postTestScore: number | undefined;
  setPostTestScore: (score: number) => void;
}

export const KnowledgeQuizModal: React.FC<KnowledgeQuizModalProps> = ({
  isOpen,
  onClose,
  preTestScore,
  setPreTestScore,
  postTestScore,
  setPostTestScore,
}) => {
  const [activeMode, setActiveMode] = useState<'pre_test' | 'post_test'>('pre_test');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const questions: QuizQuestion[] = QUIZ_QUESTIONS;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (qId: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitQuiz = () => {
    const finalScore = calculateScore();
    setIsSubmitted(true);
    if (activeMode === 'pre_test') {
      setPreTestScore(finalScore);
    } else {
      setPostTestScore(finalScore);
    }
  };

  const handleResetQuiz = (mode: 'pre_test' | 'post_test') => {
    setActiveMode(mode);
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const currentScore = isSubmitted ? calculateScore() : 0;
  const competenceGain =
    preTestScore !== undefined && postTestScore !== undefined
      ? postTestScore - preTestScore
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/90 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Evaluasi Kompetensi Spasial Geothermal
              </h3>
              <p className="text-xs text-slate-400">
                Instrumen Evaluasi Pre-Test &amp; Post-Test Sesuai Indikator Capaian PKM UNSRAT (Target Gain ≥30%)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-sm px-2.5 py-1 rounded-md hover:bg-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs & Competence Summary */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResetQuiz('pre_test')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMode === 'pre_test'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              1. Pre-Test Awal {preTestScore !== undefined && `(${preTestScore}%)`}
            </button>
            <button
              onClick={() => handleResetQuiz('post_test')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeMode === 'post_test'
                  ? 'bg-orange-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              2. Post-Test Akhir {postTestScore !== undefined && `(${postTestScore}%)`}
            </button>
          </div>

          {competenceGain !== null && (
            <div className="flex items-center gap-2 font-mono">
              <span className="text-slate-400">Peningkatan (Gain):</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  competenceGain >= 30
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                }`}
              >
                +{competenceGain}% {competenceGain >= 30 && '✓ Capaian Terpenuhi'}
              </span>
            </div>
          )}
        </div>

        {/* Quiz Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* Question Nav Dots */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
            <span>
              Pertanyaan {currentIdx + 1} dari {questions.length}
            </span>
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isCur = idx === currentIdx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-6 h-6 rounded text-xs font-mono font-medium transition-colors ${
                      isCur
                        ? 'bg-orange-600 text-white'
                        : isAnswered
                        ? 'bg-slate-700 text-slate-200'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question Block */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Options */}
            <div className="space-y-2">
              {currentQ.options.map((option, optIdx) => {
                const isSelected = selectedAnswers[currentQ.id] === optIdx;
                const isCorrect = currentQ.correctIndex === optIdx;

                let stateClasses = 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300';
                if (isSubmitted) {
                  if (isCorrect) {
                    stateClasses = 'bg-emerald-950/50 border-emerald-500 text-emerald-200';
                  } else if (isSelected) {
                    stateClasses = 'bg-red-950/50 border-red-500 text-red-200';
                  }
                } else if (isSelected) {
                  stateClasses = 'bg-slate-800 border-orange-500 text-white ring-1 ring-orange-500';
                }

                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(currentQ.id, optIdx)}
                    disabled={isSubmitted}
                    className={`w-full p-3 text-xs text-left rounded-lg border transition-all flex items-start gap-3 ${stateClasses}`}
                  >
                    <span className="font-mono font-bold w-5 shrink-0 text-slate-400">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span className="flex-1 leading-normal">{option}</span>
                    {isSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    {isSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation card after submit */}
            {isSubmitted && (
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1.5 mt-4">
                <div className="flex items-center gap-2 text-orange-400 font-semibold">
                  <BookOpen className="w-4 h-4" />
                  <span>Penjelasan Ilmiah &amp; Rujukan PKM:</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {currentQ.explanation}
                </p>
                <p className="text-[11px] text-slate-500 font-mono pt-1">
                  Sumber: {currentQ.academicReference}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-t border-slate-700">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(i - 1, 0))}
            disabled={currentIdx === 0}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40"
          >
            Sebelumnya
          </button>

          <div className="flex items-center gap-3">
            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((i) => Math.min(i + 1, questions.length - 1))}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 rounded-md"
              >
                <span>Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : !isSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-md shadow"
              >
                <Award className="w-4 h-4" />
                <span>Selesaikan &amp; Hitung Nilai</span>
              </button>
            ) : (
              <button
                onClick={() => onClose()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md shadow"
              >
                Tutup &amp; Tinjau di Peta
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
