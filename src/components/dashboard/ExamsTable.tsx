interface Exam {
  id: string;
  name: string;
  score: string;
  negative: string;
  answerSheet: string;
}

interface ExamsTableProps {
  exams: Exam[];
}

export default function ExamsTable({ exams }: ExamsTableProps) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg">
      <h1 className="text-2xl font-bold text-[#dd6b01] p-3">Previous Exams</h1>
      <table className="w-full border-collapse shadow">
        <thead className="bg-gray-100 text-left text-[#dd6b01]">
          <tr>
            <th className="p-3 text-sm font-semibold">Exam Id</th>
            <th className="p-3 text-sm font-semibold">Exam Name</th>
            <th className="p-3 text-sm font-semibold">Score</th>
            <th className="p-3 text-sm font-semibold">Negative Marking</th>
            <th className="p-3 text-sm font-semibold">Answer Sheet</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, idx) => (
            <tr key={idx} className="hover:bg-gray-100 duration-500">
              <td className="p-3">{exam.id}</td>
              <td className="p-3">{exam.name}</td>
              <td className="p-3">{exam.score}</td>
              <td className="p-3">{exam.negative}</td>
              <td className="p-3 text-[#dd6b01] font-semibold cursor-pointer hover:underline">
                View/Download
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
