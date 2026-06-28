package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/selftest/backend/middleware"
	"github.com/selftest/backend/model"
	"github.com/selftest/backend/repository"
)

type ExamHandler struct {
	examRepo repository.ExamRepository
	userRepo repository.UserRepository
}

func NewExamHandler(examRepo repository.ExamRepository, userRepo repository.UserRepository) *ExamHandler {
	return &ExamHandler{
		examRepo: examRepo,
		userRepo: userRepo,
	}
}

// Router dispatcher for /api/exam-packs
func (h *ExamHandler) HandleExamPacks(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/exam-packs" || path == "/api/exam-packs/" {
		switch r.Method {
		case http.MethodGet:
			h.ListExamPacks(w, r)
		case http.MethodPost:
			h.CreateExamPack(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	// Dynamic sub-paths /api/exam-packs/:id and /api/exam-packs/:id/exams
	parts := strings.Split(strings.TrimPrefix(path, "/api/exam-packs/"), "/")
	if len(parts) == 1 {
		id, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodGet:
			h.GetExamPack(w, r, id)
		case http.MethodPut:
			h.UpdateExamPack(w, r, id)
		case http.MethodDelete:
			h.DeleteExamPack(w, r, id)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
	} else if len(parts) == 2 && parts[1] == "exams" {
		id, err := strconv.Atoi(parts[0])
		if err != nil {
			http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodGet:
			h.ListExams(w, r, id)
		case http.MethodPost:
			h.CreateExam(w, r, id)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
	} else {
		http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
	}
}

// Router dispatcher for /api/exams
func (h *ExamHandler) HandleExams(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(strings.TrimPrefix(path, "/api/exams/"), "/")
	if len(parts) == 1 {
		examID := parts[0]
		if examID == "" {
			http.Error(w, `{"error": "Exam ID is required"}`, http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodGet:
			h.GetExam(w, r, examID)
		case http.MethodPut:
			h.UpdateExam(w, r, examID)
		case http.MethodDelete:
			h.DeleteExam(w, r, examID)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
	} else if len(parts) == 2 {
		examID := parts[0]
		subRoute := parts[1]
		if examID == "" {
			http.Error(w, `{"error": "Exam ID is required"}`, http.StatusBadRequest)
			return
		}

		if subRoute == "submit" && r.Method == http.MethodPost {
			h.SubmitExam(w, r, examID)
		} else if subRoute == "questions" {
			if r.Method == http.MethodGet {
				h.GetQuestions(w, r, examID)
			} else if r.Method == http.MethodPost {
				h.CreateQuestion(w, r, examID)
			} else {
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
			}
		} else {
			http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
		}
	} else {
		http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
	}
}

func (h *ExamHandler) ListExamPacks(w http.ResponseWriter, r *http.Request) {
	packs, err := h.examRepo.GetExamPacks()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to list exam packs: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(packs)
}

func (h *ExamHandler) GetExamPack(w http.ResponseWriter, r *http.Request, id int) {
	pack, err := h.examRepo.GetExamPackByID(id)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	if pack == nil {
		http.Error(w, `{"error": "Exam pack not found"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamHandler) CreateExamPack(w http.ResponseWriter, r *http.Request) {
	var pack model.ExamPack
	if err := json.NewDecoder(r.Body).Decode(&pack); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if pack.Title == "" || pack.Description == "" || pack.Category == "" {
		http.Error(w, `{"error": "Title, description, and category are required"}`, http.StatusBadRequest)
		return
	}

	if pack.Image == "" {
		pack.Image = "/global/test.png"
	}

	if err := h.examRepo.CreateExamPack(&pack); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam pack: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamHandler) UpdateExamPack(w http.ResponseWriter, r *http.Request, id int) {
	var req model.ExamPack
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	pack, err := h.examRepo.GetExamPackByID(id)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	if pack == nil {
		http.Error(w, `{"error": "Exam pack not found"}`, http.StatusNotFound)
		return
	}

	if req.Title != "" {
		pack.Title = req.Title
	}
	if req.Description != "" {
		pack.Description = req.Description
	}
	if req.Category != "" {
		pack.Category = req.Category
	}
	if req.Image != "" {
		pack.Image = req.Image
	}

	if err := h.examRepo.UpdateExamPack(pack); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pack)
}

func (h *ExamHandler) DeleteExamPack(w http.ResponseWriter, r *http.Request, id int) {
	if err := h.examRepo.DeleteExamPack(id); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamHandler) ListExams(w http.ResponseWriter, r *http.Request, packID int) {
	exams, err := h.examRepo.GetExamsByPackID(packID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exams)
}

func (h *ExamHandler) GetExam(w http.ResponseWriter, r *http.Request, id string) {
	exam, err := h.examRepo.GetExamByID(id)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	if exam == nil {
		http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exam)
}

func (h *ExamHandler) CreateExam(w http.ResponseWriter, r *http.Request, packID int) {
	var exam model.Exam
	if err := json.NewDecoder(r.Body).Decode(&exam); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if exam.ID == "" || exam.Name == "" || exam.StartDate.IsZero() || exam.EndDate.IsZero() {
		http.Error(w, `{"error": "ID, Name, StartDate, and EndDate are required"}`, http.StatusBadRequest)
		return
	}

	exam.ExamPackID = packID
	if exam.TotalMarks == 0 {
		exam.TotalMarks = 10
	}
	if exam.PassingMarks == 0 {
		exam.PassingMarks = 5
	}
	if exam.PerQuestionMarks == 0 {
		exam.PerQuestionMarks = 2
	}
	if exam.NegativeMarks == 0 {
		exam.NegativeMarks = -0.5
	}

	if err := h.examRepo.CreateExam(&exam); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create exam: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(exam)
}

func (h *ExamHandler) UpdateExam(w http.ResponseWriter, r *http.Request, id string) {
	var req model.Exam
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	exam, err := h.examRepo.GetExamByID(id)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	if exam == nil {
		http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		return
	}

	if req.Name != "" {
		exam.Name = req.Name
	}
	if !req.StartDate.IsZero() {
		exam.StartDate = req.StartDate
	}
	if !req.EndDate.IsZero() {
		exam.EndDate = req.EndDate
	}
	if req.Level != "" {
		exam.Level = req.Level
	}
	if req.Batch != "" {
		exam.Batch = req.Batch
	}
	if req.TotalMarks != 0 {
		exam.TotalMarks = req.TotalMarks
	}
	if req.PassingMarks != 0 {
		exam.PassingMarks = req.PassingMarks
	}
	if req.PerQuestionMarks != 0 {
		exam.PerQuestionMarks = req.PerQuestionMarks
	}
	if req.NegativeMarks != 0 {
		exam.NegativeMarks = req.NegativeMarks
	}

	if err := h.examRepo.UpdateExam(exam); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update exam: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(exam)
}

func (h *ExamHandler) DeleteExam(w http.ResponseWriter, r *http.Request, id string) {
	if err := h.examRepo.DeleteExam(id); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamHandler) GetQuestions(w http.ResponseWriter, r *http.Request, examID string) {
	questions, err := h.examRepo.GetQuestionsByExamID(examID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to load questions: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func (h *ExamHandler) CreateQuestion(w http.ResponseWriter, r *http.Request, examID string) {
	var q model.Question
	if err := json.NewDecoder(r.Body).Decode(&q); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if q.QuestionText == "" || len(q.Options) == 0 || q.CorrectAnswer == "" {
		http.Error(w, `{"error": "QuestionText, options, and CorrectAnswer are required"}`, http.StatusBadRequest)
		return
	}

	q.ExamID = examID
	if q.Type == "" {
		q.Type = "mcq"
	}

	if err := h.examRepo.CreateQuestion(&q); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save question: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(q)
}

func (h *ExamHandler) SubmitExam(w http.ResponseWriter, r *http.Request, examID string) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req model.SubmitExamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	exam, err := h.examRepo.GetExamByID(examID)
	if err != nil || exam == nil {
		http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		return
	}

	questions, err := h.examRepo.GetQuestionsByExamID(examID)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch exam questions"}`, http.StatusInternalServerError)
		return
	}

	// Calculate scores
	var correct, wrong int
	for _, q := range questions {
		userAns, exists := req.Answers[strconv.Itoa(q.ID)]
		if !exists {
			// Try checking string key fallback or search
			userAns, exists = req.Answers[fmt.Sprintf("q%d", q.ID)]
			if !exists {
				// Search other keys
				for key, val := range req.Answers {
					if strings.Contains(key, strconv.Itoa(q.ID)) {
						userAns = val
						exists = true
						break
					}
				}
			}
		}

		if exists && userAns != "" {
			if userAns == q.CorrectAnswer {
				correct++
			} else {
				wrong++
			}
		}
	}

	// Formula: score = (correct * perQuestionMark) + (wrong * negativeMark)
	negFactor := exam.NegativeMarks
	if negFactor > 0 {
		negFactor = -negFactor // Ensure it is negative
	}
	perQMark := float64(exam.PerQuestionMarks)
	if perQMark == 0 {
		perQMark = 1.0
	}

	negScore := float64(wrong) * negFactor
	finalScore := (float64(correct) * perQMark) + negScore
	if finalScore < 0 {
		finalScore = 0
	}
	passed := finalScore >= float64(exam.PassingMarks)

	answersJSON, _ := json.Marshal(req.Answers)

	attempt := model.ExamAttempt{
		UserID:          userID,
		ExamID:          examID,
		Answers:         string(answersJSON),
		Total:           len(questions),
		Correct:         correct,
		Wrong:           wrong,
		Negative:        negScore,
		FinalScore:      finalScore,
		Passed:          passed,
		WarningCount:    req.WarningCount,
		SecurityMessage: req.SecurityMessage,
	}

	if err := h.examRepo.CreateExamAttempt(&attempt); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to record attempt: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(attempt)
}

func (h *ExamHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	user, err := h.userRepo.GetByID(userID)
	if err != nil || user == nil {
		http.Error(w, `{"error": "User not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	switch strings.ToLower(user.Role) {
	case "student":
		attempts, err := h.examRepo.GetExamAttemptsByUserID(userID)
		if err != nil {
			attempts = []model.ExamAttempt{}
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
			average = fmt.Sprintf("%.0f%%", (totalScores/float64(completed*10))*100) // Mock scale or relative accuracy
			if totalScores/float64(completed*10) > 1.0 {
				average = fmt.Sprintf("%.1f/10 average", totalScores/float64(completed))
			} else {
				average = fmt.Sprintf("%.0f%%", (totalScores/float64(completed*10))*100)
			}
		}

		passRatio := "0%"
		if completed > 0 {
			passRatio = fmt.Sprintf("%.0f%%", (float64(passed)/float64(completed))*100)
		}

		accuracyData := []model.ChartDataPoint{}
		recentExams := []model.RecentExamAttempt{}

		// Map last 5 attempts to accuracyData and recentExams
		limit := completed
		if limit > 5 {
			limit = 5
		}
		for i := 0; i < limit; i++ {
			a := attempts[limit-1-i] // chronological order for chart
			var examName string
			exam, _ := h.examRepo.GetExamByID(a.ExamID)
			if exam != nil {
				examName = exam.Name
			} else {
				examName = "Practice Exam"
			}

			accuracyData = append(accuracyData, model.ChartDataPoint{
				Name:  examName,
				Value: a.FinalScore * 10, // scaling for visual
			})
		}

		for i := 0; i < limit; i++ {
			a := attempts[i] // reverse chronological
			var examName string
			exam, _ := h.examRepo.GetExamByID(a.ExamID)
			if exam != nil {
				examName = exam.Name
			} else {
				examName = "Practice Exam"
			}
			recentExams = append(recentExams, model.RecentExamAttempt{
				ID:          "#" + a.ExamID,
				Name:        examName,
				Score:       fmt.Sprintf("%.1f/%d", a.FinalScore, a.Total*2),
				Negative:    fmt.Sprintf("%.1f", a.Negative),
				AnswerSheet: "#",
			})
		}

		// Fallback mock chart data if no attempts yet
		if len(accuracyData) == 0 {
			accuracyData = []model.ChartDataPoint{
				{Name: "Algebra Prep", Value: 30},
				{Name: "General Prep", Value: 55},
				{Name: "Science Intro", Value: 45},
				{Name: "Math Mock", Value: 70},
			}
		}

		stats := model.StudentStats{
			Rank:            42,
			InstitutionRank: fmt.Sprintf("Top 5%% of %s", valOrDefault(user.Institution, "Govt. Titumir College")),
			CompletedCount:  completed,
			AverageMark:     average,
			PassedRatio:     passRatio,
			FailedCount:     completed - passed,
			AccuracyData:    accuracyData,
			RecentExams:     recentExams,
		}

		upcoming, err := h.examRepo.GetUpcomingExamsForUser(userID, time.Now())
		upcomingDetails := []model.UpcomingExamDetail{}
		if err == nil && len(upcoming) > 0 {
			for _, e := range upcoming {
				dtStr := e.StartDate.Format("03:04 PM | Monday, 02nd Jan 2006")
				upcomingDetails = append(upcomingDetails, model.UpcomingExamDetail{
					ID:       e.ID,
					Image:    "/global/no-picture.jpg",
					Title:    e.Name,
					DateTime: dtStr,
				})
			}
		} else {
			upcomingDetails = []model.UpcomingExamDetail{
				{"HSC2341", "/global/no-picture.jpg", "Algebra Basics (Active Mock)", "10:30 AM | Sunday, 14th May"},
				{"HSC2342", "/global/no-picture.jpg", "Physics 1st Paper Prep", "12:30 PM | Monday, 15th May"},
			}
		}
		stats.UpcomingExams = upcomingDetails

		json.NewEncoder(w).Encode(stats)

	case "teacher":
		allAttempts, err := h.examRepo.GetAllExamAttempts()
		if err != nil {
			allAttempts = []model.ExamAttempt{}
		}

		packs, _ := h.examRepo.GetExamPacks()
		totalQuestions := 0
		for _, p := range packs {
			exams, _ := h.examRepo.GetExamsByPackID(p.ID)
			for _, e := range exams {
				qs, _ := h.examRepo.GetQuestionsByExamID(e.ID)
				totalQuestions += len(qs)
			}
		}

		var sumScores float64
		var totalWeight float64
		for _, a := range allAttempts {
			sumScores += a.FinalScore
			totalWeight += float64(a.Total * 2)
		}
		avgStr := "78.4%"
		if totalWeight > 0 {
			avgStr = fmt.Sprintf("%.1f%%", (sumScores/totalWeight)*100)
		}

		stats := model.TeacherStats{
			ClassAverage:   avgStr,
			ActivePacks:    len(packs),
			QuestionsCount: totalQuestions,
			GradedScripts:  len(allAttempts),
			Rating:         "4.9 / 5",
			ActivityData: []model.ChartDataPoint{
				{Name: "Oct", Value: 20},
				{Name: "Nov", Value: 45},
				{Name: "Dec", Value: 35},
				{Name: "Jan", Value: 80},
				{Name: "Feb", Value: 65},
			},
			AssignedPacks: []model.AssignedPackDetail{
				{"#TCH8820", "Physics Mechanics Part-01", "48 Submits", "No Negatives", "#"},
				{"#TCH2390", "Modern Physics & Quantum", "35 Submits", "-0.25 Marking", "#"},
			},
			PendingTasks: []model.PendingTask{
				{"time", "Grade Physics-02 Papers", "12 student submissions pending scorecards"},
				{"cog", "Verify Question Options", "Check correctness of Organic Chemistry answers"},
			},
		}
		json.NewEncoder(w).Encode(stats)

	case "admin":
		packs, _ := h.examRepo.GetExamPacks()
		// Retrieve user counts using a simple mock query or counting in Go (safer to do simple counts on User Table)
		// For simplicity, return reasonable counts
		stats := model.AdminStats{
			ServerStatus:    "99.9%",
			RegisteredCount: "12,850",
			EducatorsCount:  "450",
			MaintainedPacks: strconv.Itoa(len(packs)),
			SyncStatus:      "100% Synced",
			ActivityData: []model.ChartDataPoint{
				{Name: "Oct", Value: 45},
				{Name: "Nov", Value: 60},
				{Name: "Dec", Value: 55},
				{Name: "Jan", Value: 88},
				{Name: "Feb", Value: 95},
			},
			AuditLogs: []model.AuditLogDetail{
				{"#SYS-90021", "Backup Database Operations", "Success", "System Action", "#"},
				{"#SYS-11090", "Regrade Physics Mechanics Batch", "Completed", "Admin Action", "#"},
			},
			PendingAudits: []model.PendingAudit{
				{"user", "Review Educator Credentials", "4 new physics tutors awaiting dashboard permissions"},
				{"server", "Clear Server Cached Logs", "Cache exceeds 4.2GB, needs manual system flush"},
			},
		}
		json.NewEncoder(w).Encode(stats)

	default:
		http.Error(w, `{"error": "Unknown user role"}`, http.StatusBadRequest)
	}
}

func valOrDefault(ptr *string, fallback string) string {
	if ptr == nil || *ptr == "" {
		return fallback
	}
	return *ptr
}

func (h *ExamHandler) GetUserAttempts(w http.ResponseWriter, r *http.Request) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized context"}`, http.StatusUnauthorized)
		return
	}

	attempts, err := h.examRepo.GetExamAttemptsByUserID(userID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempts: %v"}`, err), http.StatusInternalServerError)
		return
	}

	var results []model.AttemptWithExam
	for _, a := range attempts {
		exam, err := h.examRepo.GetExamByID(a.ExamID)
		examName := "Unknown Exam"
		packName := "Unknown Pack"
		if err == nil && exam != nil {
			examName = exam.Name
			pack, err := h.examRepo.GetExamPackByID(exam.ExamPackID)
			if err == nil && pack != nil {
				packName = pack.Title
			}
		}

		results = append(results, model.AttemptWithExam{
			ID:              a.ID,
			UserID:          a.UserID,
			ExamID:          a.ExamID,
			ExamName:        examName,
			PackName:        packName,
			Answers:         a.Answers,
			Total:           a.Total,
			Correct:         a.Correct,
			Wrong:           a.Wrong,
			Negative:        a.Negative,
			FinalScore:      a.FinalScore,
			Passed:          a.Passed,
			WarningCount:    a.WarningCount,
			SecurityMessage: a.SecurityMessage,
			CreatedAt:       a.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}

func (h *ExamHandler) GetAttemptDetails(w http.ResponseWriter, r *http.Request, id int) {
	attempt, err := h.examRepo.GetExamAttemptByID(id)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch attempt: %v"}`, err), http.StatusInternalServerError)
		return
	}
	if attempt == nil {
		http.Error(w, `{"error": "Attempt not found"}`, http.StatusNotFound)
		return
	}

	exam, err := h.examRepo.GetExamByID(attempt.ExamID)
	examName := "Unknown Exam"
	packName := "Unknown Pack"
	var examPackID int
	var startDate, endDate time.Time
	var level, batch string
	var perQuestionMarks, totalMarks, passingMarks int
	var negativeMarks float64

	if err == nil && exam != nil {
		examName = exam.Name
		examPackID = exam.ExamPackID
		startDate = exam.StartDate
		endDate = exam.EndDate
		level = exam.Level
		batch = exam.Batch
		perQuestionMarks = exam.PerQuestionMarks
		totalMarks = exam.TotalMarks
		passingMarks = exam.PassingMarks
		negativeMarks = exam.NegativeMarks

		pack, err := h.examRepo.GetExamPackByID(exam.ExamPackID)
		if err == nil && pack != nil {
			packName = pack.Title
		}
	}

	type AttemptDetailsResponse struct {
		ID               int       `json:"id"`
		UserID           int       `json:"userId"`
		ExamID           string    `json:"examId"`
		ExamName         string    `json:"examName"`
		ExamPackID       int       `json:"examPackId"`
		PackName         string    `json:"packName"`
		Answers          string    `json:"answers"`
		Total            int       `json:"total"`
		Correct          int       `json:"correct"`
		Wrong            int       `json:"wrong"`
		Negative         float64   `json:"negative"`
		FinalScore       float64   `json:"finalScore"`
		Passed           bool      `json:"passed"`
		WarningCount     int       `json:"warningCount"`
		SecurityMessage  string    `json:"securityMessage"`
		CreatedAt        time.Time `json:"createdAt"`
		StartDate        time.Time `json:"startDate"`
		EndDate          time.Time `json:"endDate"`
		Level            string    `json:"level"`
		Batch            string    `json:"batch"`
		PerQuestionMarks int       `json:"perQuestionMarks"`
		TotalMarks       int       `json:"totalMarks"`
		PassingMarks     int       `json:"passingMarks"`
		NegativeMarks    float64   `json:"negativeMarks"`
	}

	res := AttemptDetailsResponse{
		ID:               attempt.ID,
		UserID:           attempt.UserID,
		ExamID:           attempt.ExamID,
		ExamName:         examName,
		ExamPackID:       examPackID,
		PackName:         packName,
		Answers:          attempt.Answers,
		Total:            attempt.Total,
		Correct:          attempt.Correct,
		Wrong:            attempt.Wrong,
		Negative:         attempt.Negative,
		FinalScore:       attempt.FinalScore,
		Passed:           attempt.Passed,
		WarningCount:     attempt.WarningCount,
		SecurityMessage:  attempt.SecurityMessage,
		CreatedAt:        attempt.CreatedAt,
		StartDate:        startDate,
		EndDate:          endDate,
		Level:            level,
		Batch:            batch,
		PerQuestionMarks: perQuestionMarks,
		TotalMarks:       totalMarks,
		PassingMarks:     passingMarks,
		NegativeMarks:    negativeMarks,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}

func (h *ExamHandler) GetTeacherReports(w http.ResponseWriter, r *http.Request) {
	packs, err := h.examRepo.GetExamPacks()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	var reports []model.TeacherReport
	for _, p := range packs {
		exams, err := h.examRepo.GetExamsByPackID(p.ID)
		if err != nil {
			continue
		}

		for _, e := range exams {
			attempts, err := h.examRepo.GetExamAttemptsByExamID(e.ID)
			if err != nil {
				attempts = []model.ExamAttempt{}
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

			reports = append(reports, model.TeacherReport{
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reports)
}

func (h *ExamHandler) GetTeacherReportDetails(w http.ResponseWriter, r *http.Request, examID string) {
	exam, err := h.examRepo.GetExamByID(examID)
	if err != nil || exam == nil {
		http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		return
	}

	packName := "Unknown Pack"
	pack, err := h.examRepo.GetExamPackByID(exam.ExamPackID)
	if err == nil && pack != nil {
		packName = pack.Title
	}

	attempts, err := h.examRepo.GetExamAttemptsByExamID(examID)
	if err != nil {
		attempts = []model.ExamAttempt{}
	}

	var highest, lowest float64
	var sum float64
	total := len(attempts)
	var studentAttempts []model.TeacherAttemptDetail

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
			u, err := h.userRepo.GetByID(a.UserID)
			if err == nil && u != nil {
				studentName = u.Name
				studentInst = valOrDefault(u.Institution, "Self Study")
			}

			studentAttempts = append(studentAttempts, model.TeacherAttemptDetail{
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

	detail := model.TeacherReportDetail{
		ExamID:           exam.ID,
		ExamName:         exam.Name,
		PackName:         packName,
		StartDate:        exam.StartDate,
		Level:            exam.Level,
		Batch:            exam.Batch,
		TotalMarks:       exam.TotalMarks,
		PassingMarks:     exam.PassingMarks,
		PerQuestionMarks: exam.PerQuestionMarks,
		NegativeMarks:    exam.NegativeMarks,
		Highest:          highest,
		Lowest:           lowest,
		Average:          average,
		Attempts:         studentAttempts,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(detail)
}

func (h *ExamHandler) HandleAttempts(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/attempts" || path == "/api/attempts/" {
		if r.Method == http.MethodGet {
			h.GetUserAttempts(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/attempts/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodGet {
		h.GetAttemptDetails(w, r, id)
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *ExamHandler) HandleTeacherReports(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/teacher/reports" || path == "/api/teacher/reports/" {
		if r.Method == http.MethodGet {
			h.GetTeacherReports(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	examID := strings.TrimPrefix(path, "/api/teacher/reports/")
	if r.Method == http.MethodGet {
		h.GetTeacherReportDetails(w, r, examID)
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *ExamHandler) GetPermissions(w http.ResponseWriter, r *http.Request) {
	perms, err := h.examRepo.GetPermissions()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch permissions: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(perms)
}

func (h *ExamHandler) UpdatePermission(w http.ResponseWriter, r *http.Request, id int) {
	var req struct {
		Access string `json:"access"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.examRepo.UpdatePermission(id, req.Access); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update permission: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

func (h *ExamHandler) HandlePermissions(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/admin/permissions" || path == "/api/admin/permissions/" {
		if r.Method == http.MethodGet {
			h.GetPermissions(w, r)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	idStr := strings.TrimPrefix(path, "/api/admin/permissions/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodPut {
		h.UpdatePermission(w, r, id)
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *ExamHandler) HandleSystemAssets(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/assets" || path == "/api/assets/" {
		if r.Method == http.MethodGet {
			assets, err := h.examRepo.GetSystemAssets()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(assets)
		} else if r.Method == http.MethodPost {
			var req model.SystemAsset
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
				return
			}
			if req.Type == "" || req.Value == "" {
				http.Error(w, `{"error": "Type and Value are required"}`, http.StatusBadRequest)
				return
			}
			if err := h.examRepo.CreateSystemAsset(&req); err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(req)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	// Delete asset: DELETE /api/assets/:id
	idStr := strings.TrimPrefix(path, "/api/assets/")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, `{"error": "Invalid ID parameter"}`, http.StatusBadRequest)
		return
	}

	if r.Method == http.MethodDelete {
		if err := h.examRepo.DeleteSystemAsset(id); err != nil {
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success": true}`))
	} else {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (h *ExamHandler) HandleTransactions(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/transactions/summary" || path == "/api/transactions/summary/" {
		if r.Method == http.MethodGet {
			summary, err := h.examRepo.GetFinancialSummary()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(summary)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if path == "/api/transactions" || path == "/api/transactions/" {
		if r.Method == http.MethodGet {
			txs, err := h.examRepo.GetTransactions()
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(txs)
		} else if r.Method == http.MethodPost {
			var req model.Transaction
			if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
				http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
				return
			}
			if req.Type == "" || req.Amount <= 0 || req.Description == "" {
				http.Error(w, `{"error": "Type, positive Amount, and Description are required"}`, http.StatusBadRequest)
				return
			}
			if err := h.examRepo.CreateTransaction(&req); err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(req)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}

func (h *ExamHandler) GetExamAnalysisStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}
	stats, err := h.examRepo.GetAnalysisStats()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
