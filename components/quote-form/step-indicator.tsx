import { useLanguage } from "@/contexts/language-context"

const TOTAL_STEPS = 5

const stepNames = [
  { step: 1, key: "step1Title" },
  { step: 2, key: "step2Title" },
  { step: 3, key: "step3Title" },
  { step: 4, key: "step4Title" },
  { step: 5, key: "step5Title" }
]

interface StepIndicatorProps {
  currentStep: number
  onGoToStep: (step: number) => void
}

export function StepIndicator({ currentStep, onGoToStep }: StepIndicatorProps) {
  const { t } = useLanguage()

  return (
    <div className="mb-6">
      {/* Desktop: horizontal tabs */}
      <div className="hidden md:flex items-center border-b border-border">
        {stepNames.map(({ step, key }) => (
          <button
            key={step}
            type="button"
            onClick={() => onGoToStep(step)}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${
              step === currentStep
                ? "text-foreground border-b-2 border-primary -mb-px"
                : "text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            <span>{t(`quotes.form.${key}`)}</span>
          </button>
        ))}
      </div>

      {/* Mobile: compact progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            {t(`quotes.form.${stepNames[currentStep - 1].key}`)}
          </span>
          <span className="text-sm text-foreground/50">
            {currentStep} / {TOTAL_STEPS}
          </span>
        </div>
        <div className="flex gap-1">
          {stepNames.map(({ step }) => (
            <button
              key={step}
              type="button"
              onClick={() => onGoToStep(step)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                step === currentStep
                  ? "bg-primary"
                  : step < currentStep
                  ? "bg-muted-foreground"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
