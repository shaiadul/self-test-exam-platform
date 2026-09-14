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
	u, err := s.userRepo.GetSummaryByID(userID)
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

		// Resolve every referenced exam name in a single round trip instead of
		// one query per attempt.
		examIDs := make([]string, 0, completed)
		seenExam := map[string]bool{}
		for _, a := range attempts {
			if !seenExam[a.ExamID] {
				seenExam[a.ExamID] = true
				examIDs = append(examIDs, a.ExamID)
			}
		}
		examNames := s.examNameMap(examIDs)

		for i := 0; i < limit; i++ {
			a := attempts[limit-1-i]
			accuracyData = append(accuracyData, report.ChartDataPoint{
				Name:  examNameOrFallback(examNames, a.ExamID),
				Value: a.FinalScore * 10,
			})
		}

		for i := 0; i < limit; i++ {
			a := attempts[i]
			recentExams = append(recentExams, report.RecentExamAttempt{
				ID:          fmt.Sprintf("#%d", a.ID),
				ExamID:      a.ExamID,
				AttemptID:   a.ID,
				Name:        examNameOrFallback(examNames, a.ExamID),
				Score:       fmt.Sprintf("%.1f/%d", a.FinalScore, a.Total*2),
				Negative:    fmt.Sprintf("%.1f", a.Negative),
				AnswerSheet: fmt.Sprintf("/dashboard/reporting/%d", a.ID),
				Passed:      a.Passed,
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

		examLimit := 5
		if u.ExamLimit != nil {
			examLimit = *u.ExamLimit
		}
		if examLimit < 0 {
			examLimit = -1 // unlimited
		}
		createdExamsCount, err := s.examRepo.CountExamsByCreator(u.ID)
		if err != nil {
			createdExamsCount = 0
		}

		packLimit := 3
		if u.ExamPackLimit != nil {
			packLimit = *u.ExamPackLimit
		}
		if packLimit < 0 {
			packLimit = -1 // unlimited
		}
		createdPacksCount, err := s.examPackRepo.CountExamPacksByCreator(u.ID)
		if err != nil {
			createdPacksCount = 0
		}

		packs, _ := s.examPackRepo.GetExamPacks()
		totalQuestions, err := s.examRepo.CountAllQuestions()
		if err != nil {
			totalQuestions = 0
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
		examsByPack := map[int][]exam.Exam{}
		allExamIDs := []string{}
		for _, p := range packs {
			exams, _ := s.examRepo.GetExamsByPackID(p.ID)
			examsByPack[p.ID] = exams
			for _, e := range exams {
				allExamIDs = append(allExamIDs, e.ID)
			}
		}
		attemptStats := s.attemptStatsMap(allExamIDs)

		for _, p := range packs {
			submitCount := 0
			hasNeg := false
			for _, e := range examsByPack[p.ID] {
				submitCount += attemptStats[e.ID].Total
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
		pendingExamIDs := []string{}
		for i := 0; i < recentLimit; i++ {
			pendingExamIDs = append(pendingExamIDs, allAttempts[i].ExamID)
		}
		pendingExams := s.examMap(pendingExamIDs)
		for i := 0; i < recentLimit; i++ {
			a := allAttempts[i]
			examName := "Exam"
			if e, ok := pendingExams[a.ExamID]; ok && e.Name != "" {
				examName = e.Name
			}
			pendingTasks = append(pendingTasks, report.PendingTask{
				Type:  "time",
				Title: fmt.Sprintf("Review: %s", examName),
				Desc:  fmt.Sprintf("Student #%d submitted on %s", a.UserID, a.CreatedAt.Format("Jan 02, 2006")),
			})
		}

		return report.TeacherStats{
			ClassAverage:      avgStr,
			ActivePacks:       len(packs),
			QuestionsCount:    totalQuestions,
			GradedScripts:     len(allAttempts),
			Rating:            rating,
			ExamLimit:         examLimit,
			CreatedExamsCount: createdExamsCount,
			ExamPackLimit:     packLimit,
			CreatedPacksCount: createdPacksCount,
			ActivityData:      activityData,
			AssignedPacks:     assignedPacks,
			PendingTasks:      pendingTasks,
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
		auditExamIDs := []string{}
		for i := 0; i < auditLimit; i++ {
			auditExamIDs = append(auditExamIDs, allAttempts[i].ExamID)
		}
		auditExams := s.examMap(auditExamIDs)
		for i := 0; i < auditLimit; i++ {
			a := allAttempts[i]
			examName := "Exam"
			if e, ok := auditExams[a.ExamID]; ok && e.Name != "" {
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
		incompleteCount, _ := s.userRepo.CountIncompleteTeachers()
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

func (s *ReportService) GetTeacherReports(userID int) ([]report.TeacherReport, error) {
	var packs []exampack.ExamPack
	var err error
	if s.isTeacher(userID) {
		packs, err = s.examPackRepo.GetExamPacksByCreator(userID)
	} else {
		packs, err = s.examPackRepo.GetExamPacks()
	}
	if err != nil {
		return nil, err
	}

	examsByPack := map[int][]exam.Exam{}
	allExamIDs := []string{}
	for _, p := range packs {
		exams, err := s.examRepo.GetExamsByPackID(p.ID)
		if err != nil {
			continue
		}
		examsByPack[p.ID] = exams
		for _, e := range exams {
			allExamIDs = append(allExamIDs, e.ID)
		}
	}
	stats := s.attemptStatsMap(allExamIDs)

	var reports []report.TeacherReport
	for _, p := range packs {
		for _, e := range examsByPack[p.ID] {
			st := stats[e.ID]
			reports = append(reports, report.TeacherReport{
				ID:            e.ID,
				ExamName:      e.Name,
				PackName:      p.Title,
				StartDate:     e.StartDate,
				Highest:       st.Highest,
				Lowest:        st.Lowest,
				Average:       st.Average(),
				TotalStudents: st.Total,
			})
		}
	}

	return reports, nil
}

func (s *ReportService) GetTeacherReportDetails(userID int, examID string) (*report.TeacherReportDetail, error) {
	targetExam, err := s.examRepo.GetExamByID(examID)
	if err != nil || targetExam == nil {
		return nil, ErrExamNotFound
	}

	if s.isTeacher(userID) && !s.teacherOwnsExam(userID, targetExam) {
		return nil, ErrForbidden
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
		userIDs := make([]int, 0, total)
		seenUser := map[int]bool{}
		for _, a := range attempts {
			if !seenUser[a.UserID] {
				seenUser[a.UserID] = true
				userIDs = append(userIDs, a.UserID)
			}
		}
		userSummaries, _ := s.userRepo.GetSummariesByIDs(userIDs)

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
			if u, ok := userSummaries[a.UserID]; ok {
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

func (s *ReportService) isTeacher(userID int) bool {
	if s.userRepo == nil || userID <= 0 {
		return false
	}
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil {
		return false
	}
	return strings.ToLower(role) == "teacher"
}

func (s *ReportService) teacherOwnsExam(userID int, e *exam.Exam) bool {
	if e.CreatedBy != nil && *e.CreatedBy == userID {
		return true
	}
	pack, err := s.examPackRepo.GetExamPackByID(e.ExamPackID)
	if err != nil || pack == nil {
		return false
	}
	return pack.CreatedBy != nil && *pack.CreatedBy == userID
}

func (s *ReportService) examMap(ids []string) map[string]exam.Exam {
	result := map[string]exam.Exam{}
	if len(ids) == 0 {
		return result
	}
	exams, err := s.examRepo.GetExamsByIDs(ids)
	if err != nil {
		return result
	}
	for _, e := range exams {
		result[e.ID] = e
	}
	return result
}

func (s *ReportService) examNameMap(ids []string) map[string]string {
	names := map[string]string{}
	for id, e := range s.examMap(ids) {
		names[id] = e.Name
	}
	return names
}

func examNameOrFallback(names map[string]string, id string) string {
	if n, ok := names[id]; ok && n != "" {
		return n
	}
	return "Exam " + id
}

func (s *ReportService) attemptStatsMap(examIDs []string) map[string]attempt.ExamAttemptStats {
	stats := map[string]attempt.ExamAttemptStats{}
	if len(examIDs) == 0 {
		return stats
	}
	result, err := s.attemptRepo.GetExamAttemptStatsByExamIDs(examIDs)
	if err != nil {
		return stats
	}
	return result
}

func valOrDefault(ptr *string, fallback string) string {
	if ptr == nil || *ptr == "" {
		return fallback
	}
	return *ptr
}
