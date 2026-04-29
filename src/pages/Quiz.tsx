import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { quizQuestions, calculatePersonality } from "@/data/hidn";
import { hidnStore } from "@/store/hidnStore";

const Quiz = () => {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = quizQuestions[step];
  const progress = ((step) / quizQuestions.length) * 100;

  const choose = (i: number) => {
    const next = [...answers];
    next[step] = i;
    setAnswers(next);
    setTimeout(() => {
      if (step === quizQuestions.length - 1) {
        const p = calculatePersonality(next);
        hidnStore.setPersonality(p);
        nav(`/quiz/result?p=${p}`);
      } else {
        setStep((s) => s + 1);
      }
    }, 220);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto py-12 md:py-20 max-w-3xl">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>Pertanyaan {step + 1} dari {quizQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden mb-12">
          <div className="h-full gradient-hero transition-smooth" style={{ width: `${((step + 1) / quizQuestions.length) * 100}%` }} />
        </div>

        <h1 className="font-display text-3xl md:text-5xl font-medium leading-tight text-balance mb-10 animate-fade-up">
          {q.question}
        </h1>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => choose(i)}
              className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-smooth hover:border-primary hover:bg-primary/5
                ${answers[step] === i ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
              <div className="flex items-start gap-4">
                <span className="flex-shrink-0 h-8 w-8 rounded-full border-2 border-current inline-flex items-center justify-center text-sm font-mono opacity-50">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-base md:text-lg leading-snug pt-0.5">{opt.text}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-12">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth disabled:opacity-30">
            <ArrowLeft className="h-4 w-4" /> Sebelumnya
          </button>
          {answers[step] != null && step < quizQuestions.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Lanjut <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;
