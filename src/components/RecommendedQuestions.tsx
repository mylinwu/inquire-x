"use client";

import { Sparkles } from "lucide-react";
import { useSettings } from "@/store";

interface RecommendedQuestionsProps {
  onSelect: (question: string) => void;
}

export function RecommendedQuestions({ onSelect }: RecommendedQuestionsProps) {
  const settings = useSettings();
  const questions = settings.recommendedQuestions;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-10 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center rotate-3 transform transition-transform hover:rotate-6">
            <Sparkles size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-3 tracking-tight">开始新对话</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            选择一个启发性问题，或直接在下方输入你的想法。AI 将通过三段式思考为你提供深度回答。
          </p>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSelect(question)}
              className="group relative text-left p-5 rounded-xl bg-card hover:bg-accent/50 border border-black/5 dark:border-white/5 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-auto"
            >
              <p className="text-sm text-foreground/80 group-hover:text-foreground leading-relaxed">
                {question}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
