package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/attempt"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
	"github.com/selftest/backend/pkg/pagination"
)

type ExamHandler struct {
	examService    *service.ExamService
	attemptService *service.AttemptService
}

func NewExamHandler(examService *service.ExamService, attemptService *service.AttemptService) *ExamHandler {
	return &ExamHandler{
		examService:    examService,
		attemptService: attemptService,
	}
}

func (h *ExamHandler) HandleExams(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	if path == "/api/exams" || path == "/api/exams/" {
		switch r.Method {
		case http.MethodGet:
			h.ListExams(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	trimmed := strings.TrimPrefix(path, "/api/exams/")
	if trimmed == "" {
		switch r.Method {
		case http.MethodGet:
			h.ListExams(w, r)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}
	parts := strings.Split(trimmed, "/")

	if len(parts) == 3 && parts[1] == "questions" {
		examID := parts[0]
		questionID, err := strconv.Atoi(parts[2])
		if err != nil {
			http.Error(w, `{"error": "Invalid question ID"}`, http.StatusBadRequest)
			return
		}
		switch r.Method {
		case http.MethodPut:
			h.UpdateQuestion(w, r, examID, questionID)
		case http.MethodDelete:
			h.DeleteQuestion(w, r, examID, questionID)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) == 2 && parts[1] == "questions" {
		examID := parts[0]
		switch r.Method {
		case http.MethodGet:
			h.GetQuestions(w, r, examID)
		case http.MethodPost:
			h.CreateQuestion(w, r, examID)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) == 2 && parts[1] == "submit" {
		examID := parts[0]
		if r.Method == http.MethodPost {
			h.SubmitExam(w, r, examID)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) == 2 && parts[1] == "verify-passcode" {
		examID := parts[0]
		if r.Method == http.MethodPost {
			h.VerifyPasscode(w, r, examID)
		} else {
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	if len(parts) == 1 && parts[0] != "" {
		id := parts[0]
		switch r.Method {
		case http.MethodGet:
			h.GetExam(w, r, id)
		case http.MethodPut:
			h.UpdateExam(w, r, id)
		case http.MethodDelete:
			h.DeleteExam(w, r, id)
		default:
			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		}
		return
	}

	http.Error(w, `{"error": "Page not found"}`, http.StatusNotFound)
}

func (h *ExamHandler) ListExams(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())

	params := pagination.Parse(r)
	q := r.URL.Query()

	var packID *int
	if pidStr := q.Get("pack_id"); pidStr != "" {
		if pid, err := strconv.Atoi(pidStr); err == nil {
			packID = &pid
		}
	} else if pidStr := q.Get("exam_pack_id"); pidStr != "" {
		if pid, err := strconv.Atoi(pidStr); err == nil {
			packID = &pid
		}
	}

	userRole := middleware.GetUserRoleFromContext(r.Context())
	if userRole == "" && userID > 0 {
		userRole = h.examService.RoleOf(userID)
	}
	userRole = strings.ToLower(userRole)

	isManage := q.Get("manage") == "true" || strings.Contains(r.Header.Get("Referer"), "manage-exam-pack")
	if isManage && userRole == "student" {
		resp := pagination.Response[exam.Exam]{
			Data: []exam.Exam{},
			Meta: pagination.Meta{
				TotalItems:  0,
				TotalPages:  1,
				CurrentPage: params.Page,
				PerPage:     params.PerPage,
			},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
		return
	}

	var teacherID *int
	if isManage {
		if userRole == "teacher" {
			teacherID = &userID
		}
		// If admin, teacherID remains nil to manage all exams across the platform
	} else if q.Get("mine") == "true" {
		teacherID = &userID
	} else if tidStr := q.Get("teacher_id"); tidStr != "" {
		if tid, err := strconv.Atoi(tidStr); err == nil {
			teacherID = &tid
		}
	}

	filter := exam.ExamFilter{
		Search:    params.Search,
		PackID:    packID,
		TeacherID: teacherID,
		Level:     strings.TrimSpace(q.Get("level")),
		Batch:     strings.TrimSpace(q.Get("batch")),
		Page:      params.Page,
		PerPage:   params.PerPage,
	}

	exams, meta, err := h.examService.ListExams(userID, filter)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	resp := pagination.Response[exam.Exam]{
		Data: exams,
		Meta: pagination.Meta{
			TotalItems:  meta.TotalItems,
			TotalPages:  meta.TotalPages,
			CurrentPage: meta.CurrentPage,
			PerPage:     meta.PerPage,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func (h *ExamHandler) GetExam(w http.ResponseWriter, r *http.Request, id string) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	e, err := h.examService.GetExam(userID, id)
	if err != nil {
		switch err {
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this exam"}`, http.StatusForbidden)
			return
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(e)
}

func (h *ExamHandler) UpdateExam(w http.ResponseWriter, r *http.Request, id string) {
	var input service.UpdateExamInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, _ := middleware.GetUserIDFromContext(r.Context())
	e, err := h.examService.UpdateExam(userID, id, input)
	if err != nil {
		switch err {
		case service.ErrExamNameRequired, service.ErrInvalidStartDate, service.ErrInvalidEndDate, service.ErrEndDateBeforeStart, service.ErrPasscodeRequired, service.ErrInvalidDuration, service.ErrInvalidPassMark, service.ErrInvalidPerQMark, service.ErrInvalidNegativeMark:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
			return
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update exam: %v"}`, err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(e)
}

func (h *ExamHandler) DeleteExam(w http.ResponseWriter, r *http.Request, id string) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	if err := h.examService.DeleteExam(userID, id); err != nil {
		switch err {
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
			return
		}
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamHandler) GetQuestions(w http.ResponseWriter, r *http.Request, examID string) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	questions, err := h.examService.GetQuestions(userID, examID, r.URL.Query().Get("passcode"))
	if err != nil {
		switch err {
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		case service.ErrForbidden:
			http.Error(w, `{"error": "You do not have access to this exam"}`, http.StatusForbidden)
			return
		case service.ErrInvalidPasscode:
			http.Error(w, `{"error": "Incorrect exam passcode"}`, http.StatusForbidden)
			return
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to load questions: %v"}`, err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func (h *ExamHandler) VerifyPasscode(w http.ResponseWriter, r *http.Request, examID string) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var body struct {
		Passcode string `json:"passcode"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if err := h.examService.VerifyPasscode(userID, examID, body.Passcode); err != nil {
		switch err {
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		case service.ErrInvalidPasscode:
			http.Error(w, `{"error": "Incorrect passcode"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

func (h *ExamHandler) CreateQuestion(w http.ResponseWriter, r *http.Request, examID string) {
	var input service.QuestionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, _ := middleware.GetUserIDFromContext(r.Context())
	q, err := h.examService.CreateQuestion(userID, examID, input)
	if err != nil {
		switch err {
		case service.ErrQuestionTextReq, service.ErrMinOptionsReq, service.ErrCorrectAnswerRequired, service.ErrPassageTextReq, service.ErrPictureURLReq:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to save question: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(q)
}

func (h *ExamHandler) UpdateQuestion(w http.ResponseWriter, r *http.Request, examID string, questionID int) {
	var input service.QuestionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	userID, _ := middleware.GetUserIDFromContext(r.Context())
	q, err := h.examService.UpdateQuestion(userID, examID, questionID, input)
	if err != nil {
		if err == service.ErrQuestionNotFound {
			http.Error(w, `{"error": "Question not found"}`, http.StatusNotFound)
			return
		}
		switch err {
		case service.ErrQuestionTextReq, service.ErrMinOptionsReq, service.ErrCorrectAnswerRequired, service.ErrPassageTextReq, service.ErrPictureURLReq:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to update question: %v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(q)
}

func (h *ExamHandler) DeleteQuestion(w http.ResponseWriter, r *http.Request, examID string, questionID int) {
	userID, _ := middleware.GetUserIDFromContext(r.Context())
	if err := h.examService.DeleteQuestion(userID, examID, questionID); err != nil {
		switch err {
		case service.ErrQuestionNotFound:
			http.Error(w, `{"error": "Question not found"}`, http.StatusNotFound)
			return
		case service.ErrForbidden:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusForbidden)
			return
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		default:
			http.Error(w, fmt.Sprintf(`{"error": "Failed to delete question: %v"}`, err), http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

func (h *ExamHandler) SubmitExam(w http.ResponseWriter, r *http.Request, examID string) {
	userID, err := middleware.GetUserIDFromContext(r.Context())
	if err != nil {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req attempt.SubmitExamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	res, err := h.attemptService.SubmitExam(userID, examID, req)
	if err != nil {
		switch err {
		case service.ErrExamNotFound:
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
		case service.ErrInvalidPasscode:
			http.Error(w, `{"error": "Incorrect exam passcode"}`, http.StatusForbidden)
		case service.ErrExamNotStarted:
			http.Error(w, `{"error": "This exam has not started yet"}`, http.StatusForbidden)
		case service.ErrExamEnded:
			http.Error(w, `{"error": "This exam has already ended"}`, http.StatusForbidden)
		default:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}
