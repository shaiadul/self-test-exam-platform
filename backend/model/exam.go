package model

import "time"

type ExamPack struct {
	ID          int       `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Image       string    `json:"image" db:"image"`
	Category    string    `json:"category" db:"category"`
	TotalExams  int       `json:"totalExams" db:"total_exams"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

type Exam struct {
	ID               string    `json:"id" db:"id"`
	ExamPackID       int       `json:"examPackId" db:"exam_pack_id"`
	Name             string    `json:"name" db:"name"`
	StartDate        time.Time `json:"startDate" db:"start_date"`
	EndDate          time.Time `json:"endDate" db:"end_date"`
	Level            string    `json:"level" db:"level"`
	Batch            string    `json:"batch" db:"batch"`
	TotalMarks       int       `json:"totalMarks" db:"total_marks"`
	PassingMarks     int       `json:"passingMarks" db:"passing_marks"`
	PerQuestionMarks int       `json:"perQuestionMarks" db:"per_question_marks"`
	NegativeMarks    float64   `json:"negativeMarks" db:"negative_marks"`
	CreatedAt        time.Time `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time `json:"updated_at" db:"updated_at"`
}

type Question struct {
	ID             int      `json:"id" db:"id"`
	ExamID         string   `json:"examId" db:"exam_id"`
	Type           string   `json:"type" db:"type"` // mcq, passage, picture
	QuestionText   string   `json:"questionText" db:"question_text"`
	Options        []string `json:"options" db:"options"`
	CorrectAnswer  string   `json:"correctAnswer" db:"correct_answer"`
	Passage        *string  `json:"passage,omitempty" db:"passage"`
	PictureURL     *string  `json:"pictureUrl,omitempty" db:"picture_url"`
	CreatedAt      time.Time `json:"created_at" db:"created_at"`
}

type ExamAttempt struct {
	ID              int       `json:"id" db:"id"`
	UserID          int       `json:"userId" db:"user_id"`
	ExamID          string    `json:"examId" db:"exam_id"`
	Answers         string    `json:"answers" db:"answers"` // JSON string map of question ID to chosen option
	Total           int       `json:"total" db:"total"`
	Correct         int       `json:"correct" db:"correct"`
	Wrong           int       `json:"wrong" db:"wrong"`
	Negative        float64   `json:"negative" db:"negative"`
	FinalScore      float64   `json:"finalScore" db:"final_score"`
	Passed          bool      `json:"passed" db:"passed"`
	WarningCount    int       `json:"warningCount" db:"warning_count"`
	SecurityMessage string    `json:"securityMessage" db:"security_message"`
	CreatedAt       time.Time `json:"createdAt" db:"created_at"`
}

type SubmitExamRequest struct {
	Answers         map[string]string `json:"answers"`
	WarningCount    int               `json:"warningCount"`
	SecurityMessage string            `json:"securityMessage"`
}

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
	ClassAverage    string               `json:"classAverage"`
	ActivePacks     int                  `json:"activePacks"`
	QuestionsCount  int                  `json:"questionsCount"`
	GradedScripts   int                  `json:"gradedScripts"`
	Rating          string               `json:"rating"`
	ActivityData    []ChartDataPoint     `json:"activityData"`
	AssignedPacks   []AssignedPackDetail `json:"assignedPacks"`
	PendingTasks    []PendingTask        `json:"pendingTasks"`
}

type AdminStats struct {
	ServerStatus    string               `json:"serverStatus"`
	RegisteredCount string               `json:"registeredCount"`
	EducatorsCount  string               `json:"educatorsCount"`
	MaintainedPacks string               `json:"maintainedPacks"`
	SyncStatus      string               `json:"syncStatus"`
	ActivityData    []ChartDataPoint     `json:"activityData"`
	AuditLogs       []AuditLogDetail     `json:"auditLogs"`
	PendingAudits   []PendingAudit       `json:"pendingAudits"`
}

type ChartDataPoint struct {
	Name  string  `json:"name"`
	Value float64 `json:"value"`
}

type RecentExamAttempt struct {
	ID          string `json:"id"`
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

type Permission struct {
	ID     int    `json:"id" db:"id"`
	Role   string `json:"role" db:"role"`
	Module string `json:"module" db:"module"`
	Access string `json:"access" db:"access"`
}

type AttemptWithExam struct {
	ID              int       `json:"id"`
	UserID          int       `json:"userId"`
	ExamID          string    `json:"examId"`
	ExamName        string    `json:"examName"`
	PackName        string    `json:"packName"`
	Answers         string    `json:"answers"`
	Total           int       `json:"total"`
	Correct         int       `json:"correct"`
	Wrong           int       `json:"wrong"`
	Negative        float64   `json:"negative"`
	FinalScore      float64   `json:"finalScore"`
	Passed          bool      `json:"passed"`
	WarningCount    int       `json:"warningCount"`
	SecurityMessage string    `json:"securityMessage"`
	CreatedAt       time.Time `json:"createdAt"`
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
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Institution  string    `json:"institution"`
	Time         time.Time `json:"time"`
	Score        float64   `json:"score"`
	Negative     float64   `json:"negative"`
	Passed       bool      `json:"passed"`
}

type SystemAsset struct {
	ID    int    `json:"id" db:"id"`
	Type  string `json:"type" db:"type"`
	Value string `json:"value" db:"value"`
}

type Transaction struct {
	ID          int       `json:"id" db:"id"`
	Type        string    `json:"type" db:"type"`
	Amount      float64   `json:"amount" db:"amount"`
	Description string    `json:"description" db:"description"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

type FinancialSummary struct {
	TotalIncome      float64 `json:"totalIncome"`
	TotalExpenditure float64 `json:"totalExpenditure"`
	NetIncome        float64 `json:"netIncome"`
}

type ExamAnalysisStats struct {
	TotalExams    int `json:"totalExams"`
	TotalStudents int `json:"totalStudents"`
	TotalPacks    int `json:"totalPacks"`
	TotalTeachers int `json:"totalTeachers"`
}
