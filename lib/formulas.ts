import type { Subject } from "@/lib/types";

/**
 * The Master Formula & Shortcut sheet from
 * `Competitive_Exam_Training_Tracker_Day3_Enhanced.xlsx`, transcribed verbatim.
 *
 * Each section names the Topic Master topics it supports, so the page can show
 * live accuracy beside the shortcuts and push whatever is under target to the
 * top — the sheet stops being a print-out and starts pointing at what to revise.
 */
export interface FormulaEntry {
  concept: string;
  formula: string;
}

export interface FormulaSection {
  id: string;
  title: string;
  subject: Subject;
  /** Topic Master topics this section covers, matched by name. */
  topics: string[];
  entries: FormulaEntry[];
}

export const FORMULA_SECTIONS: FormulaSection[] = [
  {
    id: "percentage-shortcuts",
    title: "Percentage shortcuts",
    subject: "Quantitative Aptitude",
    topics: ["Percentages", "Percentage Shortcuts", "Mixed Percentages"],
    entries: [
      { concept: "10%", formula: "÷ 10" },
      { concept: "5%", formula: "÷ 20" },
      { concept: "12.5%", formula: "÷ 8" },
      { concept: "16⅔%", formula: "÷ 6" },
      { concept: "20%", formula: "÷ 5" },
      { concept: "25%", formula: "÷ 4" },
      { concept: "33⅓%", formula: "÷ 3" },
      { concept: "50%", formula: "÷ 2" },
      { concept: "66⅔%", formula: "× 2 ÷ 3" },
      { concept: "75%", formula: "× 3 ÷ 4" },
    ],
  },
  {
    id: "ratio-proportion",
    title: "Ratio & proportion",
    subject: "Quantitative Aptitude",
    topics: ["Ratio & Proportion"],
    entries: [
      { concept: "Divide in ratio a : b", formula: "Total × a/(a+b)" },
      { concept: "Proportion", formula: "a : b = c : d ⇒ ad = bc" },
      { concept: "40% boys", formula: "2 : 3" },
    ],
  },
  {
    id: "profit-loss",
    title: "Profit & loss",
    subject: "Quantitative Aptitude",
    topics: ["Profit & Loss"],
    entries: [
      { concept: "Profit", formula: "SP − CP" },
      { concept: "Loss", formula: "CP − SP" },
      { concept: "Profit %", formula: "Profit / CP × 100" },
      { concept: "Loss %", formula: "Loss / CP × 100" },
      { concept: "SP with profit", formula: "CP × (100 + p) / 100" },
      { concept: "SP with loss", formula: "CP × (100 − l) / 100" },
    ],
  },
  {
    id: "discount",
    title: "Discount",
    subject: "Quantitative Aptitude",
    topics: ["Discount", "Discount & Percentages Drill"],
    entries: [
      { concept: "Discount", formula: "MP − SP" },
      { concept: "Discount %", formula: "Discount / MP × 100" },
      { concept: "SP after discount", formula: "MP × (100 − d) / 100" },
    ],
  },
  {
    id: "simplification",
    title: "Simplification",
    subject: "Quantitative Aptitude",
    topics: ["Simplification", "Approximation", "Difference of Squares"],
    entries: [
      { concept: "BODMAS", formula: "( ), powers, ÷, ×, +, −" },
      { concept: "a² − b²", formula: "(a − b)(a + b)" },
      { concept: "(a + b)²", formula: "a² + 2ab + b²" },
    ],
  },
  {
    id: "squares",
    title: "Square shortcuts",
    subject: "Quantitative Aptitude",
    topics: ["Squares & Cubes", "Squares Ending in 5"],
    entries: [
      { concept: "25²", formula: "625" },
      { concept: "35²", formula: "1225" },
      { concept: "45²", formula: "2025" },
      { concept: "55²", formula: "3025" },
      { concept: "75²", formula: "5625" },
      { concept: "95²", formula: "9025" },
    ],
  },
  {
    id: "roots-cubes",
    title: "Roots & cubes",
    subject: "Quantitative Aptitude",
    topics: ["Square Roots & Percentages", "Squares & Cubes"],
    entries: [
      { concept: "√576", formula: "24" },
      { concept: "√625", formula: "25" },
      { concept: "√784", formula: "28" },
      { concept: "5³", formula: "125" },
      { concept: "6³", formula: "216" },
      { concept: "7³", formula: "343" },
    ],
  },
  // The Day 4 workbook appends these under one "DAY 4 ADDITIONS" heading. They
  // cover three distinct topics, so they are split three ways here — that is
  // what lets each score against its own topic like every other section.
  {
    id: "time-and-work",
    title: "Time & work",
    subject: "Quantitative Aptitude",
    topics: ["Time & Work"],
    entries: [
      { concept: "Together (two people)", formula: "1/T = 1/a + 1/b" },
      { concept: "Together (three people)", formula: "1/T = 1/a + 1/b + 1/c" },
    ],
  },
  {
    id: "time-speed-distance",
    title: "Time, speed & distance",
    subject: "Quantitative Aptitude",
    topics: ["Time, Speed & Distance"],
    entries: [
      { concept: "Speed", formula: "Distance ÷ Time" },
      { concept: "Distance", formula: "Speed × Time" },
      { concept: "Time", formula: "Distance ÷ Speed" },
      { concept: "km/h → m/s", formula: "× 5/18" },
      { concept: "m/s → km/h", formula: "× 18/5" },
    ],
  },
  {
    id: "simple-interest",
    title: "Simple interest",
    subject: "Quantitative Aptitude",
    topics: ["Simple Interest"],
    entries: [
      { concept: "Simple Interest", formula: "P × R × T / 100" },
      { concept: "Amount", formula: "P + SI" },
    ],
  },
  // Day 5 appends ten more under one heading, again spanning several topics.
  {
    id: "compound-interest",
    title: "Compound interest",
    subject: "Quantitative Aptitude",
    topics: ["Compound Interest"],
    entries: [
      { concept: "Compound Interest", formula: "P[(1 + R/100)^T − 1]" },
      { concept: "CI − SI over 2 years", formula: "P(R/100)²" },
      { concept: "Half-yearly", formula: "Rate ÷ 2, periods × 2" },
    ],
  },
  {
    id: "averages",
    title: "Averages",
    subject: "Quantitative Aptitude",
    topics: ["Average"],
    entries: [
      { concept: "Average", formula: "Sum ÷ Number" },
      { concept: "Sum from average", formula: "Average × Number" },
      { concept: "Combined average", formula: "(n₁A₁ + n₂A₂) / (n₁ + n₂)" },
      { concept: "Replacement", formula: "New total = Old total − old + new" },
    ],
  },
  {
    id: "successive-percentage",
    title: "Successive percentages",
    subject: "Quantitative Aptitude",
    topics: ["Successive Percentage"],
    entries: [
      { concept: "Successive changes", formula: "a + b + ab/100 (signed)" },
      { concept: "Same % up then down", formula: "Net decrease = x²/100" },
    ],
  },
  {
    id: "partnership",
    title: "Partnership",
    subject: "Quantitative Aptitude",
    topics: ["Partnership"],
    entries: [
      { concept: "Profit ratio", formula: "Capital × Time" },
    ],
  },
  {
    id: "time-savers",
    title: "Time savers",
    subject: "Quantitative Aptitude",
    topics: ["Fast Multiplication", "Mixed Arithmetic", "Speed Mock"],
    entries: [
      { concept: "999 × n", formula: "1000n − n" },
      { concept: "15%", formula: "10% + 5%" },
      { concept: "35%", formula: "10% + 10% + 10% + 5%" },
    ],
  },
];

export const FORMULA_COUNT = FORMULA_SECTIONS.reduce(
  (n, s) => n + s.entries.length,
  0,
);
