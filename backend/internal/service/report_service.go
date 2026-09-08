package service

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/selftest/backend/internal/domain/attempt"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/report"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrUnknownRole = errors.New("unknown user role")
)

type ReportService struct {
	userRepo     user.UserRepository
	examRepo     exam.ExamRepository
	examPackRepo exampack.ExamPackRepository
	attemptRepo  attempt.AttemptRepository
	reportRepo   report.ReportRepository
}

func NewReportService(
	userRepo user.UserRepository,
	examRepo exam.ExamRepository,
	examPackRepo exampack.ExamPackRepository,
	attemptRepo attempt.AttemptRepository,
	reportRepo report.ReportRepository,
) *ReportService {
	return &ReportService{
		userRepo:     userRepo,
		examRepo:     examRepo,
		examPackRepo: examPackRepo,
		attemptRepo:  attemptRepo,
		reportRepo:   reportRepo,
	}
}

func (s *ReportService) GetDashboardStats(userID int) (interface{}, error) {
	u, err := s.userRepo.GetByID(userID)
	if err != nil || u == nil {
		return nil, ErrUserNotFound
	}

	switch strings.ToLower(u.Role) {
	case "student":
		attempts, err := s.attemptRepo.GetExamAttemptsByUserID(userID)
		if err != nil {
			attempts = []attempt.ExamAttempt{}
		}

		completed := len(attempts)
		passed := 0
		var totalScores float64
		for _, a := range attempts {
			if a.Passed {
				passed++
			}
			totalScores += a.FinalScore
		}

		average := "0%"
		if completed > 0 {
			avgVal := totalScores / float64(completed*10)
			if avgVal > 1.0 {
				average = fmt.Sprintf("%.1f/10 average", totalScores/float64(completed))
			} else {
				average = fmt.Sprintf("%.0f%%", avgVal*100)
			}
		}

		passRatio := "0%"
		if completed > 0 {
			passRatio = fmt.Sprintf("%.0f%%", (float64(passed)/float64(completed))*100)
		}

		accuracyData := []report.ChartDataPoint{}
		recentExams := []report.RecentExamAttempt{}

		limit := completed
		if limit > 5 {
			limit = 5
		}
		for i := 0; i < limit; i++ {
			a := attempts[limit-1-i]
			var examName string
			e, _ := s.examRepo.GetExamByID(a.ExamID)
			if e != nil {
				examName = e.Name
			} else {
				examName = "Exam " + a.ExamID
			}

			accuracyData = append(accuracyData, report.ChartDataPoint{
				Name:  examName,
				Value: a.FinalScore * 10,
			})
		}

		for i := 0; i < limit; i++ {
			a := attempts[i]
			var examName string
			e, _ := s.examRepo.GetExamByID(a.ExamID)
			if e != nil {
				examName = e.Name
			} else {
				examName = "Exam " + a.ExamID
			}
			recentExams = append(recentExams, report.RecentExamAttempt{
				ID:          fmt.Sprintf("#%d", a.ID),
				ExamID:      a.ExamID,
				AttemptID:   a.ID,
				Name:        examName,
				Score:       fmt.Sprintf("%.1f/%d", a.FinalScore, a.Total*2),
				Negative:    fmt.Sprintf("%.1f", a.Negative),
				AnswerSheet: fmt.Sprintf("/dashboard/reporting/%d", a.ID),
			})
		}

		rank, err := s.userRepo.GetStudentRank(userID)
		if err != nil || rank == 0 {
			rank = 0
		}

		institutionName := valOrDefault(u.Institution, "your institution")
		institutionRank := ""
		if rank > 0 {
			institutionRank = fmt.Sprintf("Rank #%d at %s", rank, institutionName)
		} else {
			institutionRank = fmt.Sprintf("Complete exams to get ranked at %s", institutionName)
		}

		stats := report.StudentStats{
			Rank:            rank,
			InstitutionRank: institutionRank,
			CompletedCount:  completed,
			AverageMark:     average,
			PassedRatio:     passRatio,
			FailedCount:     completed - passed,
			AccuracyData:    accuracyData,
			RecentExams:     recentExams,
		}

		upcoming, err := s.examRepo.GetUpcomingExamsForUser(userID, time.Now())
		upcomingDetails := []report.UpcomingExamDetail{}
		if err == nil && len(upcoming) > 0 {
			for _, e := range upcoming {
				dtStr := e.StartDate.Format("03:04 PM | Monday, 02nd Jan 2006")
				upcomingDetails = append(upcomingDetails, report.UpcomingExamDetail{
					ID:       e.ID,
					Image:    "/global/no-picture.jpg",
					Title:    e.Name,
					DateTime: dtStr,
				})
			}
		}
		stats.UpcomingExams = upcomingDetails

		return stats, nil

	case "teacher":
		allAttempts, err := s.attemptRepo.GetAllExamAttempts()
		if err != nil {
			allAttempts = []attempt.ExamAttempt{}
		}

		packs, _ := s.examPackRepo.GetExamPacks()
		totalQuestions := 0
		for _, p := range packs {
			exams, _ := s.examRepo.GetExamsByPackID(p.ID)
			for _, e := range exams {
				qs, _ := s.examRepo.GetQuestionsByExamID(e.ID)
				totalQuestions += len(qs)
			}
		}

		var sumScores float64
		var totalWeight float64
		for _, a := range allAttempts {
			sumScores += a.FinalScore
			totalWeight += float64(a.Total * 2)
		}
		avgStr := "0%"
		if totalWeight > 0 {
			avgStr = fmt.Sprintf("%.1f%%", (sumScores/totalWeight)*100)
		}

		totalAttempts := len(allAttempts)
		passedCount := 0
		for _, a := range allAttempts {
			if a.Passed {
				passedCount++
			}
		}
		rating := "N/A"
		if totalAttempts > 0 {
			passRate := (float64(passedCount) / float64(totalAttempts)) * 5.0
			rating = fmt.Sprintf("%.1f / 5", passRate)
		}

		activityData := []report.ChartDataPoint{}
		now := time.Now()
		for i := 4; i >= 0; i-- {
			monthTime := now.AddDate(0, -i, 0)
			monthName := monthTime.Format("Jan")
			monthStart := time.Date(monthTime.Year(), monthTime.Month(), 1, 0, 0, 0, 0, time.UTC)
			monthEnd := monthStart.AddDate(0, 1, 0)
			count := 0
			for _, a := range allAttempts {
				if !a.CreatedAt.Before(monthStart) && a.CreatedAt.Before(monthEnd) {
					count++
				}
			}
			activityData = append(activityData, report.ChartDataPoint{
				Name:  monthName,
				Value: float64(count),
			})
		}

		assignedPacks := []report.AssignedPackDetail{}
		for _, p := range packs {
			exams, _ := s.examRepo.GetExamsByPackID(p.ID)
			submitCount := 0
			hasNeg := false
			for _, e := range exams {
				ea, _ := s.attemptRepo.GetExamAttemptsByExamID(e.ID)
				submitCount += len(ea)
				if e.NegativeMarks > 0 {
					hasNeg = true
				}
			}
			negLabel := "No Negatives"
			if hasNeg {
				negLabel = "Negative Marking"
			}
			assignedPacks = append(assignedPacks, report.AssignedPackDetail{
				ID:          fmt.Sprintf("#TCH%d", p.ID),
				Name:        p.Title,
				Score:       fmt.Sprintf("%d Submits", submitCount),
				Negative:    negLabel,
				AnswerSheet: "#",
			})
		}

		pendingTasks := []report.PendingTask{}
		recentLimit := 5
		if len(allAttempts) < recentLimit {
			recentLimit = len(allAttempts)
		}
		for i := 0; i < recentLimit; i++ {
			a := allAttempts[i]
			e, _ := s.examRepo.GetExamByID(a.ExamID)
			examName := "Exam"
			if e != nil {
				examName = e.Name
			}
			pendingTasks = append(pendingTasks, report.PendingTask{
				Type:  "time",
				Title: fmt.Sprintf("Review: %s", examName),
				Desc:  fmt.Sprintf("Student #%d submitted on %s", a.UserID, a.CreatedAt.Format("Jan 02, 2006")),
			})
		}

		return report.TeacherStats{
			ClassAverage:   avgStr,
			ActivePacks:    len(packs),
			QuestionsCount: totalQuestions,
			GradedScripts:  len(allAttempts),
			Rating:         rating,
			ActivityData:   activityData,
			AssignedPacks:  assignedPacks,
			PendingTasks:   pendingTasks,
		}, nil

	case "admin":
		packs, _ := s.examPackRepo.GetExamPacks()
		studentCount, _ := s.userRepo.GetUserCountByRole("student")
		teacherCount, _ := s.userRepo.GetUserCountByRole("teacher")

		allAttempts, _ := s.attemptRepo.GetAllExamAttempts()
		activityData := []report.ChartDataPoint{}
		now := time.Now()
		for i := 4; i >= 0; i-- {
			monthTime := now.AddDate(0, -i, 0)
			monthName := monthTime.Format("Jan")
			monthStart := time.Date(monthTime.Year(), monthTime.Month(), 1, 0, 0, 0, 0, time.UTC)
			monthEnd := monthStart.AddDate(0, 1, 0)
			count := 0
			for _, a := range allAttempts {
				if !a.CreatedAt.Before(monthStart) && a.CreatedAt.Before(monthEnd) {
					count++
				}
			}
			activityData = append(activityData, report.ChartDataPoint{
				Name:  monthName,
				Value: float64(count),
			})
		}

		auditLogs := []report.AuditLogDetail{}
		auditLimit := 5
		if len(allAttempts) < auditLimit {
			auditLimit = len(allAttempts)
		}
		for i := 0; i < auditLimit; i++ {
			a := allAttempts[i]
			e, _ := s.examRepo.GetExamByID(a.ExamID)
			examName := "Exam"
			if e != nil {
				examName = e.Name
			}
			status := "Failed"
			if a.Passed {
				status = "Passed"
			}
			auditLogs = append(auditLogs, report.AuditLogDetail{
				ID:          fmt.Sprintf("#ATT-%d", a.ID),
				Name:        examName,
				Score:       fmt.Sprintf("%.1f/%d", a.FinalScore, a.Total*2),
				Negative:    status,
				AnswerSheet: "#",
			})
		}

		pendingAudits := []report.PendingAudit{}
		allUsers, _ := s.userRepo.GetAll()
		incompleteCount := 0
		for _, userObj := range allUsers {
			if userObj.Role == "teacher" && (userObj.Subject == nil || *userObj.Subject == "") {
				incompleteCount++
			}
		}
		if incompleteCount > 0 {
			pendingAudits = append(pendingAudits, report.PendingAudit{
				Type:  "user",
				Title: "Review Educator Profiles",
				Desc:  fmt.Sprintf("%d educators have incomplete profiles", incompleteCount),
			})
		}
		if len(allAttempts) > 100 {
			pendingAudits = append(pendingAudits, report.PendingAudit{
				Type:  "server",
				Title: "Database Optimization",
				Desc:  fmt.Sprintf("%d total attempts — consider archiving old records", len(allAttempts)),
			})
		}

		return report.AdminStats{
			ServerStatus:    "Online",
			RegisteredCount: strconv.Itoa(studentCount),
			EducatorsCount:  strconv.Itoa(teacherCount),
			MaintainedPacks: strconv.Itoa(len(packs)),
			SyncStatus:      "Synced",
			ActivityData:    activityData,
			AuditLogs:       auditLogs,
			PendingAudits:   pendingAudits,
		}, nil

	default:
		return nil, ErrUnknownRole
	}
}

func (s *ReportService) GetTeacherReports() ([]report.TeacherReport, error) {
	packs, err := s.examPackRepo.GetExamPacks()
	if err != nil {
		return nil, err
	}

	var reports []report.TeacherReport
	for _, p := range packs {
		exams, err := s.examRepo.GetExamsByPackID(p.ID)
		if err != nil {
			continue
		}

		for _, e := range exams {
			attempts, err := s.attemptRepo.GetExamAttemptsByExamID(e.ID)
			if err != nil {
				attempts = []attempt.ExamAttempt{}
			}

			var highest, lowest float64
			var sum float64
			total := len(attempts)

			if total > 0 {
				highest = attempts[0].FinalScore
				lowest = attempts[0].FinalScore
				for _, a := range attempts {
					if a.FinalScore > highest {
						highest = a.FinalScore
					}
					if a.FinalScore < lowest {
						lowest = a.FinalScore
					}
					sum += a.FinalScore
				}
			}

			average := 0.0
			if total > 0 {
				average = sum / float64(total)
			}

			reports = append(reports, report.TeacherReport{
				ID:            e.ID,
				ExamName:      e.Name,
				PackName:      p.Title,
				StartDate:     e.StartDate,
				Highest:       highest,
				Lowest:        lowest,
				Average:       average,
				TotalStudents: total,
			})
		}
	}

	return reports, nil
}

func (s *ReportService) GetTeacherReportDetails(examID string) (*report.TeacherReportDetail, error) {
	targetExam, err := s.examRepo.GetExamByID(examID)
	if err != nil || targetExam == nil {
		return nil, ErrExamNotFound
	}

	packName := "Unknown Pack"
	pack, err := s.examPackRepo.GetExamPackByID(targetExam.ExamPackID)
	if err == nil && pack != nil {
		packName = pack.Title
	}

	attempts, err := s.attemptRepo.GetExamAttemptsByExamID(examID)
	if err != nil {
		attempts = []attempt.ExamAttempt{}
	}

	var highest, lowest float64
	var sum float64
	total := len(attempts)
	var studentAttempts []report.TeacherAttemptDetail

	if total > 0 {
		highest = attempts[0].FinalScore
		lowest = attempts[0].FinalScore
		for _, a := range attempts {
			if a.FinalScore > highest {
				highest = a.FinalScore
			}
			if a.FinalScore < lowest {
				lowest = a.FinalScore
			}
			sum += a.FinalScore

			studentName := "Unknown Candidate"
			studentInst := "Default Institution"
			u, err := s.userRepo.GetByID(a.UserID)
			if err == nil && u != nil {
				studentName = u.Name
				studentInst = valOrDefault(u.Institution, "Self Study")
			}

			studentAttempts = append(studentAttempts, report.TeacherAttemptDetail{
				ID:          a.ID,
				Name:        studentName,
				Institution: studentInst,
				Time:        a.CreatedAt,
				Score:       a.FinalScore,
				Negative:    a.Negative,
				Passed:      a.Passed,
			})
		}
	}

	average := 0.0
	if total > 0 {
		average = sum / float64(total)
	}

	return &report.TeacherReportDetail{
		ExamID:           targetExam.ID,
		ExamName:         targetExam.Name,
		PackName:         packName,
		StartDate:        targetExam.StartDate,
		Level:            targetExam.Level,
		Batch:            targetExam.Batch,
		TotalMarks:       targetExam.TotalMarks,
		PassingMarks:     targetExam.PassingMarks,
		PerQuestionMarks: targetExam.PerQuestionMarks,
		NegativeMarks:    targetExam.NegativeMarks,
		Highest:          highest,
		Lowest:           lowest,
		Average:          average,
		Attempts:         studentAttempts,
	}, nil
}

func (s *ReportService) GetExamAnalysisStats() (*report.ExamAnalysisStats, error) {
	return s.reportRepo.GetAnalysisStats()
}

func valOrDefault(ptr *string, fallback string) string {
	if ptr == nil || *ptr == "" {
		return fallback
	}
	return *ptr
}
