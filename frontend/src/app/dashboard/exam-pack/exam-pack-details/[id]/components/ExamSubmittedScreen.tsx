import React from "react";
import { FaCheckCircle, FaEye } from "react-icons/fa";
import { PageContainer } from "../../../../../../components/common/PageContainer";
import Scorecard from "../../../../../../components/dashboard/Scorecard";
import CertificatePrintLayout from "../../../../../../components/dashboard/CertificatePrintLayout";
import { PrimaryBtn } from "../../../../../../components/ui/PrimaryBtn";
import { OutlineBtn } from "../../../../../../components/ui/OutlineBtn";
import { formatDate, DATE_FORMATS } from "@/lib/date";
import { ExamMeta } from "../types";

interface ExamSubmittedScreenProps {
  examMeta: ExamMeta;
  examResult: any;
}

export const ExamSubmittedScreen: React.FC<ExamSubmittedScreenProps> = ({
  examMeta,
  examResult,
}) => {
  return (
    <PageContainer className="max-w-4xl mx-auto py-10 px-4">
      <div className="hidden print:block">
        <CertificatePrintLayout
          candidateName={examResult.userName || "Student"}
          examName={examMeta.title}
          examDate={formatDate(new Date(), DATE_FORMATS.DATETIME_FULL)}
          result={{
            total: (examResult.correct || 0) + (examResult.wrong || 0),
            correct: examResult.correct || 0,
            wrong: examResult.wrong || 0,
            negative: examResult.negative || 0,
            finalScore: examResult.finalScore || 0,
            passed: examResult.passed || false,
          }}
          totalMarks={examMeta.totalMarks}
        />
      </div>

      <div className="print:hidden space-y-6">
        <div className="bg-white rounded p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-5">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded flex items-center justify-center text-3xl mx-auto border-2 border-emerald-200">
            <FaCheckCircle />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Exam Successfully Submitted!
            </h1>
            {examResult.securityMessage && (
              <p className="text-xs font-semibold text-slate-500">
                Security Log: <span className="text-primary font-bold">{examResult.securityMessage}</span>
              </p>
            )}
          </div>

          <Scorecard
            result={{
              total: (examResult.correct || 0) + (examResult.wrong || 0),
              correct: examResult.correct || 0,
              wrong: examResult.wrong || 0,
              negative: examResult.negative || 0,
              finalScore: examResult.finalScore || 0,
              passed: examResult.passed || false,
            }}
            totalMarks={examMeta.totalMarks}
            passingPercent={examMeta.passMarks}
          />

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {examResult.id && (
              <PrimaryBtn
                link={`/dashboard/reporting/${examResult.id}`}
                className="flex-1 !text-xs !py-2.5 !rounded shadow-xs gap-2"
              >
                <FaEye className="text-xs" />
                <span>Review Solutions & Report</span>
              </PrimaryBtn>
            )}
            <PrimaryBtn
              onClick={() => window.print()}
              className="flex-1 !text-xs !py-2.5 !rounded !bg-purple-600 hover:!bg-purple-500 !text-white shadow-xs"
            >
              Print Official Certificate
            </PrimaryBtn>
            <OutlineBtn link="/dashboard" className="flex-1 !text-xs !py-2.5 !rounded">
              Back to Dashboard
            </OutlineBtn>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
