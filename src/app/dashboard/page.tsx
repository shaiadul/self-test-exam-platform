import ChartCard from "@/components/dashboard/ChartCard";
import ExamsTable from "@/components/dashboard/ExamsTable";
import StatsGrid from "@/components/dashboard/StatsGrid";
import UpcomingExamCard from "@/components/dashboard/UpcomingExamCard";
import UserCard from "@/components/dashboard/UserCard";

export default function DashboardPage() {
  return (
    <section className="flex-1 p-6 md:p-10">
      {/* User info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <UserCard
          name="Md Saidul Basar"
          board="Dhaka"
          level="BSS"
          batch="2019-2020"
          institution="Govt. Titumir College Dhaka"
          image="/user/md-saidul.jpeg"
        />

        <div className="flex justify-end gap-5">
          <div>
            <p className="text-lg md:text-2xl font-semibold text-[#dd6b01]">
              Upcoming Exams
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Chart + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        <ChartCard />
        <StatsGrid
          stats={[
            { label: "Completed Exams", value: "25" },
            { label: "Average Mark", value: "66.67%" },
            { label: "Passed", value: "75%" },
            { label: "Failed", value: "25%" },
          ]}
        />
      </div>

      {/* Table */}
      <div className="mt-10">
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
    </section>
  );
}
