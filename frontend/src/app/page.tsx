import type { Metadata } from "next";
import HomePage from "../components/home/HomePage";
import { constructMetadata } from "../lib/seo/metadata";
import { getFAQPageSchema } from "../lib/seo/structured-data";
import { JsonLd } from "../lib/seo/JsonLd";

export const metadata: Metadata = constructMetadata({
  title: "Online Exam & Mock Test Assessment Platform",
  description:
    "Prepare, practice, and excel in competitive exams with Self Test. Take real-time timed mock tests, receive instant scorecards, and unlock topic-wise performance analytics.",
  canonicalPath: "/",
});

const homeFaqs = [
  {
    question: "Is Self Test free to use for students?",
    answer:
      "Yes! Students can sign up and access our public mock exams, automated instant scorecards, and interactive practice question sets completely free.",
  },
  {
    question: "How does the instant evaluation and scoring engine work?",
    answer:
      "When you submit a mock test, our assessment engine instantly evaluates your choices against validated answer keys, calculating weighted scores, negative markings (if enabled), percentage accuracy, and time spent per question in seconds.",
  },
  {
    question: "Can I take exams on mobile phones or tablets?",
    answer:
      "Absolutely! Self Test is built with a responsive interface designed for smartphones, tablets, laptops, and desktop workstations. Your test progress auto-syncs continuously.",
  },
  {
    question: "How do performance analytics help me study better?",
    answer:
      "Instead of just giving a final percentage, Self Test breaks down your performance by subject sub-topic, pacing per question, and accuracy history over time. You get instant recommendations on exactly which topics to review.",
  },
  {
    question: "Are solution explanations provided after completing a test?",
    answer:
      "Yes! Every assessment includes detailed step-by-step solutions, key formulas, and pedagogical explanations for every single question so you learn while practicing.",
  },
];

export default function Home() {
  const faqSchema = getFAQPageSchema(homeFaqs);

  return (
    <>
      <JsonLd data={faqSchema} id="home-faq-schema" />
      <HomePage />
    </>
  );
}
