'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, CheckCircle2 } from 'lucide-react'
import type { IQuiz, IQuizOption, IQuizQuestion } from '../../lib/types/course'
import { Button } from '../ui/button'

type LessonQuizEditorProps = {
  quiz: IQuiz
  onChange: (quiz: IQuiz) => void
}

function createId() {
  return Math.random().toString(36).slice(2, 10)
}

function createEmptyQuestion(): IQuizQuestion {
  const opts: IQuizOption[] = [
    { id: createId(), label: '' },
    { id: createId(), label: '' },
    { id: createId(), label: '' },
    { id: createId(), label: '' },
  ]
  return {
    id: createId(),
    prompt: '',
    options: opts,
    correctOptionId: opts[0].id,
  }
}

export function LessonQuizEditor({ quiz, onChange }: LessonQuizEditorProps) {
  const [passingScore, setPassingScore] = useState(quiz.passingScore ?? 70)

  const updateQuestion = (qId: string, updater: (q: IQuizQuestion) => IQuizQuestion) => {
    onChange({
      ...quiz,
      questions: quiz.questions.map((q) => (q.id === qId ? updater(q) : q)),
      passingScore,
    })
  }

  const addQuestion = () => {
    onChange({
      ...quiz,
      questions: [...quiz.questions, createEmptyQuestion()],
      passingScore,
    })
  }

  const removeQuestion = (qId: string) => {
    onChange({
      ...quiz,
      questions: quiz.questions.filter((q) => q.id !== qId),
      passingScore,
    })
  }

  const handlePassingScoreBlur = () => {
    onChange({ ...quiz, passingScore })
  }

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Passing score (%)</label>
        <input
          type="number"
          min={0}
          max={100}
          value={passingScore}
          onChange={(e) => setPassingScore(Number(e.target.value))}
          onBlur={handlePassingScoreBlur}
          className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
      </div>

      {quiz.questions.map((q, qi) => (
        <div key={q.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <GripVertical className="mt-2 size-3.5 shrink-0 text-slate-300" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-xs font-bold text-slate-500">Q{qi + 1}</span>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(q.id, (x) => ({ ...x, prompt: e.target.value }))}
                  placeholder="Tulis pertanyaan..."
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <button type="button" onClick={() => removeQuestion(q.id)} className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Hapus pertanyaan">
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              <div className="space-y-1.5 pl-6">
                {q.options.map((opt, oi) => {
                  const isCorrect = q.correctOptionId === opt.id
                  return (
                    <div key={opt.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuestion(q.id, (x) => ({ ...x, correctOptionId: opt.id }))}
                        className={`flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold transition-colors ${
                          isCorrect ? 'border-emerald-400 bg-emerald-100 text-emerald-700' : 'border-slate-300 bg-white text-slate-400 hover:border-emerald-300'
                        }`}
                        title={isCorrect ? 'Jawaban benar' : 'Pilih sebagai jawaban benar'}>
                        {isCorrect ? <CheckCircle2 className="size-3.5" /> : optionLabels[oi]}
                      </button>
                      <input
                        type="text"
                        value={opt.label}
                        onChange={(e) =>
                          updateQuestion(q.id, (x) => ({
                            ...x,
                            options: x.options.map((o) => (o.id === opt.id ? { ...o, label: e.target.value } : o)),
                          }))
                        }
                        placeholder={`Opsi ${optionLabels[oi]}`}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            updateQuestion(q.id, (x) => {
                              const filtered = x.options.filter((o) => o.id !== opt.id)
                              return {
                                ...x,
                                options: filtered,
                                correctOptionId: x.correctOptionId === opt.id ? (filtered[0]?.id ?? '') : x.correctOptionId,
                              }
                            })
                          }
                          className="shrink-0 rounded p-0.5 text-slate-400 hover:text-red-500"
                          title="Hapus opsi">
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  )
                })}

                {q.options.length < 8 && (
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(q.id, (x) => ({
                        ...x,
                        options: [...x.options, { id: createId(), label: '' }],
                      }))
                    }
                    className="flex items-center gap-1 pl-7 text-[11px] text-slate-400 hover:text-slate-600">
                    <Plus className="size-3" /> Tambah opsi
                  </button>
                )}
              </div>

              <div className="pl-6">
                <input
                  type="text"
                  value={q.explanation ?? ''}
                  onChange={(e) => updateQuestion(q.id, (x) => ({ ...x, explanation: e.target.value || undefined }))}
                  placeholder="Penjelasan jawaban (opsional)"
                  className="w-full rounded-lg border border-dashed border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="w-full rounded-xl border-dashed border-slate-300 bg-transparent text-xs">
        <Plus className="size-4" /> Tambah pertanyaan
      </Button>
    </div>
  )
}
