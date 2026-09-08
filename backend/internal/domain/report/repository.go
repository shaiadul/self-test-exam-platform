package report

type ReportRepository interface {
	GetAnalysisStats() (*ExamAnalysisStats, error)
}
