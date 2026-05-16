import ChartCard from "@/components/dashboard/ChartCard";
import ExamsTable from "@/components/dashboard/ExamsTable";
import StatsGrid from "@/components/dashboard/StatsGrid";
import UpcomingExamCard from "@/components/dashboard/UpcomingExamCard";
import UserCard from "@/components/dashboard/UserCard";
import { FaGraduationCap } from "react-icons/fa";

export default function DashboardPage() {
  return (
    <div className="space-y-10 pb-10">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        <div className="flex-1">
          <UserCard
            name="Md Saidul Basar"
            board="Dhaka"
            level="BSS"
            batch="2019-2020"
            institution="Govt. Titumir College Dhaka"
            image="/user/md-saidul.jpeg"
          />
        </div>

        <div className="lg:w-1/3 flex flex-col justify-between p-6 bg-gradient-to-br from-primary to-primary-dark rounded-2xl text-white shadow-lg shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <FaGraduationCap className="text-9xl" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Overall Rank</h3>
            <p className="text-5xl font-black mb-4">#42</p>
            <p className="text-primary-light text-sm font-medium">Top 5% of your batch</p>
          </div>
          <button className="relative z-10 mt-6 w-full py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl font-bold hover:bg-white/30 transition-all text-sm">
            View Leaderboard
          </button>
        </div>
      </div>

      {/* Main Stats & Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h3>
            <ChartCard />
          </div>
        </div>
        <div>
          <StatsGrid
            stats={[
              { label: "Completed Exams", value: "25" },
              { label: "Average Mark", value: "66.67%" },
              { label: "Passed", value: "75%" },
              { label: "Failed", value: "25%" },
            ]}
          />
        </div>
      </div>

      {/* Tables and Upcoming Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Recent Exams</h3>
              <button className="text-primary text-sm font-bold hover:underline">View All</button>
            </div>
            <ExamsTable
              exams={[
                {
                  id: "#HSC34930",
                  name: "Physics-02",
                  score: "25/30",
                  negative: "-5",
                  answerSheet: "#",
                },
                {
                  id: "#HSC9800",
                  name: "Chemistry-03",
                  score: "28/30",
                  negative: "-2",
                  answerSheet: "#",
                },
              ]}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">Upcoming Exams</h3>
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">2 New</span>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <UpcomingExamCard
              image="/global/no-picture.jpg"
              title="Islamic Economics"
              dateTime="10:30 AM | Sunday, 14th May 2025"
            />
            <UpcomingExamCard
              image="/global/no-picture.jpg"
              title="Physics 1st Paper"
              dateTime="12:30 PM | Monday, 15th May 2025"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
