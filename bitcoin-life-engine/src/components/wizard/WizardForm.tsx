"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  formSchema,
  FormData,
  INCOME_RANGES,
  DEBT_RANGES,
  CUSTODY_METHODS,
  MAJOR_EXPENSES,
  BITCOIN_FEARS,
} from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";

interface WizardFormProps {
  onComplete: (data: FormData) => void;
}

const TOTAL_STEPS = 10;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function WizardForm({ onComplete }: WizardFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 30,
      income: "50k-100k",
      monthlySavings: 0,
      bitcoinHoldings: 0,
      holdingsUnit: "usd",
      debt: "none",
      riskTolerance: 5,
      targetRetirementAge: 65,
      majorExpenses: ["none"],
      custodyMethod: "none",
      biggestFears: [],
    },
  });

  const fieldsByStep: Record<number, (keyof FormData)[]> = {
    1: ["age"],
    2: ["income"],
    3: ["monthlySavings"],
    4: ["bitcoinHoldings"],
    5: ["debt"],
    6: ["riskTolerance"],
    7: ["targetRetirementAge"],
    8: ["majorExpenses"],
    9: ["custodyMethod"],
    10: ["biggestFears"],
  };

  async function goNext() {
    const valid = await trigger(fieldsByStep[step]);
    if (!valid) return;
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleSubmit(onComplete)();
    }
  }

  function goBack() {
    if (step > 1) {
      setDirection(-1);
      setStep(step - 1);
    }
  }

  const watchAge = watch("age");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <ProgressBar current={step} total={TOTAL_STEPS} />

      <div className="relative min-h-[320px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {/* Step 1: Age */}
            {step === 1 && (
              <StepWrapper
                title="How old are you?"
                help="Your age helps us calibrate time horizon and risk parameters."
              >
                <Controller
                  name="age"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <div className="text-center text-5xl font-bold text-[#F7931A] mb-4">
                        {field.value}
                      </div>
                      <input
                        type="range"
                        min={18}
                        max={70}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full accent-[#F7931A] h-2 bg-zinc-700 rounded-full cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>18</span>
                        <span>70</span>
                      </div>
                    </div>
                  )}
                />
                {errors.age && (
                  <p className="text-red-400 text-sm mt-2">{errors.age.message}</p>
                )}
              </StepWrapper>
            )}

            {/* Step 2: Income */}
            {step === 2 && (
              <StepWrapper
                title="What is your annual income?"
                help="Used to calculate savings rate and appropriate allocation levels."
              >
                <Controller
                  name="income"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {INCOME_RANGES.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                            field.value === opt.value
                              ? "border-[#F7931A] bg-[#F7931A]/10 text-white"
                              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 3: Monthly Savings */}
            {step === 3 && (
              <StepWrapper
                title="How much can you save per month?"
                help="Total monthly amount you can set aside. We'll calculate the optimal Bitcoin allocation from this."
              >
                <Controller
                  name="monthlySavings"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
                        $
                      </span>
                      <input
                        type="number"
                        min={0}
                        max={100000}
                        placeholder="0"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 0)
                        }
                        className="w-full pl-10 pr-4 py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xl focus:outline-none focus:border-[#F7931A] transition-colors"
                      />
                    </div>
                  )}
                />
                {errors.monthlySavings && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.monthlySavings.message}
                  </p>
                )}
              </StepWrapper>
            )}

            {/* Step 4: Bitcoin Holdings */}
            {step === 4 && (
              <StepWrapper
                title="Current Bitcoin holdings?"
                help="Enter the amount you currently hold. Toggle between BTC or USD value."
              >
                <Controller
                  name="holdingsUnit"
                  control={control}
                  render={({ field: unitField }) => (
                    <Controller
                      name="bitcoinHoldings"
                      control={control}
                      render={({ field }) => (
                        <div>
                          <div className="flex gap-2 mb-4">
                            <button
                              type="button"
                              onClick={() => unitField.onChange("usd")}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                unitField.value === "usd"
                                  ? "bg-[#F7931A] text-black"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              USD
                            </button>
                            <button
                              type="button"
                              onClick={() => unitField.onChange("btc")}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                unitField.value === "btc"
                                  ? "bg-[#F7931A] text-black"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                              }`}
                            >
                              BTC
                            </button>
                          </div>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
                              {unitField.value === "usd" ? "$" : "₿"}
                            </span>
                            <input
                              type="number"
                              min={0}
                              step={unitField.value === "btc" ? 0.0001 : 1}
                              placeholder="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value) || 0)
                              }
                              className="w-full pl-10 pr-4 py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xl focus:outline-none focus:border-[#F7931A] transition-colors"
                            />
                          </div>
                        </div>
                      )}
                    />
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 5: Debt */}
            {step === 5 && (
              <StepWrapper
                title="What is your total debt?"
                help="Include all outstanding debts: student loans, credit cards, mortgage, auto loans, etc."
              >
                <Controller
                  name="debt"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {DEBT_RANGES.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                            field.value === opt.value
                              ? "border-[#F7931A] bg-[#F7931A]/10 text-white"
                              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 6: Risk Tolerance */}
            {step === 6 && (
              <StepWrapper
                title="What is your risk tolerance?"
                help="1 = very conservative, 10 = very aggressive. This significantly impacts your allocation."
              >
                <Controller
                  name="riskTolerance"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <div className="text-center mb-4">
                        <span className="text-5xl font-bold text-[#F7931A]">
                          {field.value}
                        </span>
                        <span className="text-zinc-500 text-lg ml-2">/ 10</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="w-full accent-[#F7931A] h-2 bg-zinc-700 rounded-full cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>Conservative</span>
                        <span>Aggressive</span>
                      </div>
                      <p className="text-center text-sm text-zinc-400 mt-3">
                        {field.value <= 3
                          ? "Capital preservation is your priority."
                          : field.value <= 6
                          ? "Balanced approach — willing to accept moderate swings."
                          : "Growth-focused — comfortable with significant volatility."}
                      </p>
                    </div>
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 7: Retirement Age */}
            {step === 7 && (
              <StepWrapper
                title="What is your target retirement age?"
                help={`You're currently ${watchAge}. This determines your investment time horizon.`}
              >
                <Controller
                  name="targetRetirementAge"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <div className="text-center mb-2">
                        <span className="text-5xl font-bold text-[#F7931A]">
                          {field.value}
                        </span>
                      </div>
                      <p className="text-center text-sm text-zinc-400 mb-4">
                        {field.value - watchAge > 0
                          ? `${field.value - watchAge} years until retirement`
                          : "You're at or past your target!"}
                      </p>
                      <input
                        type="number"
                        min={25}
                        max={90}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value) || 65)
                        }
                        className="w-full px-4 py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xl text-center focus:outline-none focus:border-[#F7931A] transition-colors"
                      />
                    </div>
                  )}
                />
                {errors.targetRetirementAge && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.targetRetirementAge.message}
                  </p>
                )}
              </StepWrapper>
            )}

            {/* Step 8: Major Expenses */}
            {step === 8 && (
              <StepWrapper
                title="Major expenses in the next 2 years?"
                help="Select all that apply. This affects how much cash reserve we recommend."
              >
                <Controller
                  name="majorExpenses"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {MAJOR_EXPENSES.map((opt) => {
                        const isSelected = field.value.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (opt.value === "none") {
                                field.onChange(["none"]);
                              } else {
                                const filtered = field.value.filter(
                                  (v) => v !== "none"
                                );
                                if (isSelected) {
                                  const next = filtered.filter(
                                    (v) => v !== opt.value
                                  );
                                  field.onChange(
                                    next.length === 0 ? ["none"] : next
                                  );
                                } else {
                                  field.onChange([...filtered, opt.value]);
                                }
                              }
                            }}
                            className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                              isSelected
                                ? "border-[#F7931A] bg-[#F7931A]/10 text-white"
                                : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-[#F7931A] bg-[#F7931A]"
                                    : "border-zinc-600"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 9: Custody Method */}
            {step === 9 && (
              <StepWrapper
                title="How do you currently store Bitcoin?"
                help="Your current custody method helps us build a security roadmap for you."
              >
                <Controller
                  name="custodyMethod"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {CUSTODY_METHODS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => field.onChange(opt.value)}
                          className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                            field.value === opt.value
                              ? "border-[#F7931A] bg-[#F7931A]/10 text-white"
                              : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </StepWrapper>
            )}

            {/* Step 10: Biggest Fears */}
            {step === 10 && (
              <StepWrapper
                title="What are your biggest Bitcoin fears?"
                help="Select all that apply. We'll tailor risk management strategies to address these."
              >
                <Controller
                  name="biggestFears"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {BITCOIN_FEARS.map((opt) => {
                        const isSelected = field.value.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(
                                  field.value.filter((v) => v !== opt.value)
                                );
                              } else {
                                field.onChange([...field.value, opt.value]);
                              }
                            }}
                            className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                              isSelected
                                ? "border-[#F7931A] bg-[#F7931A]/10 text-white"
                                : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <span
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-[#F7931A] bg-[#F7931A]"
                                    : "border-zinc-600"
                                }`}
                              >
                                {isSelected && (
                                  <svg
                                    className="w-3 h-3 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </span>
                              {opt.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.biggestFears && (
                  <p className="text-red-400 text-sm mt-2">
                    Please select at least one fear.
                  </p>
                )}
              </StepWrapper>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 1}
          className="px-6 py-3 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          className="px-8 py-3 rounded-lg bg-[#F7931A] hover:bg-[#E8851A] text-black font-bold transition-colors"
        >
          {step === TOTAL_STEPS ? "Generate My Report" : "Continue"}
        </button>
      </div>
    </div>
  );
}

// ─── Step Wrapper ─────────────────────────────────────────────────────────────

function StepWrapper({
  title,
  help,
  children,
}: {
  title: string;
  help: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-zinc-400 mb-6">{help}</p>
      {children}
    </div>
  );
}
