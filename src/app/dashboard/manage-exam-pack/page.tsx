import ExamPackCard from "@/components/dashboard/ExamPackCard";
import AddButton from "@/components/ui/AddButton";

export default function ManageExamPackPage() {
  return (
    <main>
      <AddButton href="/dashboard/manage-exam-pack/add" label="Add Exam Pack" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
        <ExamPackCard
          image="/global/test.png"
          title="Math Beginner Pack"
          description="Covers algebra, geometry, and basic arithmetic concepts for beginners."
          totalExams={12}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Science Explorer Pack"
          description="Includes physics, chemistry, and biology practice exams for learners."
          totalExams={15}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/test.png"
          title="English Grammar Pack"
          description="Grammar, vocabulary, and comprehension practice questions in English."
          totalExams={10}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/test.png"
          title="History Master Pack"
          description="Learn world history through multiple exams covering ancient to modern era."
          totalExams={8}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/test.png"
          title="Programming Basics Pack"
          description="Practice coding and logic questions in Python, C++, and JavaScript."
          totalExams={20}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/test.png"
          title="Geography Explorer Pack"
          description="Covers maps, continents, countries, and geographical features."
          totalExams={9}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/no-picture.jpg"
          title="Business Studies Pack"
          description="Learn economics, management, and entrepreneurship with practice exams."
          totalExams={14}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
        <ExamPackCard
          image="/global/test.png"
          title="General Knowledge Pack"
          description="Enhance your GK skills covering current affairs, history, and science."
          totalExams={18}
          link="/dashboard/manage-exam-pack/mathbcs2025"
        />
      </div>
    </main>
  );
}
