import { Exam } from "@/lib/types";
import { FaFileAlt, FaEye } from "react-icons/fa";

interface ExamsTableProps {
  exams: Exam[];
}

export default function ExamsTable({ exams }: ExamsTableProps) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
        <table className="w-full text-left border-collapse bg-white">
          <thead className="bg-gray-50/80 backdrop-blur-sm border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Id</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Exam Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Negative</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {exams.map((exam, idx) => (
              <tr key={idx} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">{exam.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <FaFileAlt className="text-xs" />
                    </div>
                    <span className="font-bold text-gray-800">{exam.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-green-600">{exam.score}</td>
                <td className="px-6 py-4 font-medium text-red-500">{exam.negative}</td>
                <td className="px-6 py-4">
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-primary hover:text-white transition-all font-bold text-xs">
                    <FaEye />
                    View Result
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
