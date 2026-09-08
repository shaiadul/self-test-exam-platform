package report

import "time"

type StudentStats struct {
	Rank            int                  `json:"rank"`
	InstitutionRank string               `json:"institutionRank"`
	AccuracyData    []ChartDataPoint     `json:"accuracyData"`
	RecentExams     []RecentExamAttempt  `json:"recentExams"`
	UpcomingExams   []UpcomingExamDetail `json:"upcomingExams"`
	CompletedCount  int                  `json:"completedCount"`
	AverageMark     string               `json:"averageMark"`
	PassedRatio     string               `json:"passedRatio"`
	FailedCount     int                  `json:"failedCount"`
}

type TeacherStats struct {
	ClassAverage   string               `json:"classAverage"`
	ActivePacks    int                  `json:"activePacks"`
	QuestionsCount int                  `json:"questionsCount"`
	GradedScripts  int                  `json:"gradedScripts"`
	Rating         string               `json:"rating"`
	ActivityData   []ChartDataPoint     `json:"activityData"`
	AssignedPacks  []AssignedPackDetail `json:"assignedPacks"`
	PendingTasks   []PendingTask        `json:"pendingTasks"`
}

type AdminStats struct {
	ServerStatus    string           `json:"serverStatus"`
	RegisteredCount string           `json:"registeredCount"`
	EducatorsCount  string           `json:"educatorsCount"`
	MaintainedPacks string           `json:"maintainedPacks"`
	SyncStatus      string           `json:"syncStatus"`
	ActivityData    []ChartDataPoint `json:"activityData"`
	AuditLogs       []AuditLogDetail `json:"auditLogs"`
	PendingAudits   []PendingAudit   `json:"pendingAudits"`
}

type ChartDataPoint struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type RecentExamAttempt struct {
	ID          string `json:"id"`
	ExamID      string `json:"examId"`
	AttemptID   int    `json:"attemptId"`
	Name        string `json:"name"`
	Score       string `json:"score"`
	Negative    string `json:"negative"`
	AnswerSheet string `json:"answerSheet"`
}

type UpcomingExamDetail struct {
	ID       string `json:"id"`
	Image    string `json:"image"`
	Title    string `json:"title"`
	DateTime string `json:"dateTime"`
}

type AssignedPackDetail struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Score       string `json:"score"`
	Negative    string `json:"negative"`
	AnswerSheet string `json:"answerSheet"`
}

type PendingTask struct {
	Type  string `json:"type"` // time, cog
	Title string `json:"title"`
	Desc  string `json:"desc"`
}

type AuditLogDetail struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Score       string `json:"score"`
	Negative    string `json:"negative"`
	AnswerSheet string `json:"answerSheet"`
}

type PendingAudit struct {
	Type  string `json:"type"` // user, server
	Title string `json:"title"`
	Desc  string `json:"desc"`
}

type TeacherReport struct {
	ID            string    `json:"id"`
	ExamName      string    `json:"examName"`
	PackName      string    `json:"packName"`
	StartDate     time.Time `json:"startDate"`
	Highest       float64   `json:"highest"`
	Lowest        float64   `json:"lowest"`
	Average       float64   `json:"average"`
	TotalStudents int       `json:"totalStudents"`
}

type TeacherReportDetail struct {
	ExamID           string                 `json:"examId"`
	ExamName         string                 `json:"examName"`
	PackName         string                 `json:"packName"`
	StartDate        time.Time              `json:"startDate"`
	Level            string                 `json:"level"`
	Batch            string                 `json:"batch"`
	TotalMarks       int                    `json:"totalMarks"`
	PassingMarks     int                    `json:"passingMarks"`
	PerQuestionMarks int                    `json:"perQuestionMarks"`
	NegativeMarks    float64                `json:"negativeMarks"`
	Highest          float64                `json:"highest"`
	Lowest           float64                `json:"lowest"`
	Average          float64                `json:"average"`
	Attempts         []TeacherAttemptDetail `json:"attempts"`
}

type TeacherAttemptDetail struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Institution string    `json:"institution"`
	Time        time.Time `json:"time"`
	Score       float64   `json:"score"`
	Negative    float64   `json:"negative"`
	Passed      bool      `json:"passed"`
}

type ExamAnalysisStats struct {
	TotalExams    int `json:"totalExams"`
	TotalStudents int `json:"totalStudents"`
	TotalPacks    int `json:"totalPacks"`
	TotalTeachers int `json:"totalTeachers"`
}
