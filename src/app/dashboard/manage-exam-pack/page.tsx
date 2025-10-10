import ExamPackCard from "@/components/dashboard/ExamPackCard";
import AddButton from "@/components/ui/AddButton";

export default function ManageExamPackPage() {
  return (
    <main className="p-6 md:p-10">
      <AddButton href="/dashboard/manage-exam-pack/add" label="Add Exam Pack" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Math Beginner Pack"
          description="Covers algebra, geometry, and basic arithmetic concepts for beginners."
          totalExams={12}
          link="/exam-pack/math-beginner"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Science Explorer Pack"
          description="Includes physics, chemistry, and biology practice exams for learners."
          totalExams={15}
          link="/exam-pack/science-explorer"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="English Grammar Pack"
          description="Grammar, vocabulary, and comprehension practice questions in English."
          totalExams={10}
          link="/exam-pack/english-grammar"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="History Master Pack"
          description="Learn world history through multiple exams covering ancient to modern era."
          totalExams={8}
          link="/exam-pack/history-master"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Programming Basics Pack"
          description="Practice coding and logic questions in Python, C++, and JavaScript."
          totalExams={20}
          link="/exam-pack/programming-basics"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Geography Explorer Pack"
          description="Covers maps, continents, countries, and geographical features."
          totalExams={9}
          link="/exam-pack/geography-explorer"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Business Studies Pack"
          description="Learn economics, management, and entrepreneurship with practice exams."
          totalExams={14}
          link="/exam-pack/business-studies"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="General Knowledge Pack"
          description="Enhance your GK skills covering current affairs, history, and science."
          totalExams={18}
          link="/exam-pack/general-knowledge"
        />
      </div>
    </main>
  );
}
