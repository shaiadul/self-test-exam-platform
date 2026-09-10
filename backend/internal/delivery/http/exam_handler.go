package http

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/attempt"
	"github.com/selftest/backend/internal/service"
	"github.com/selftest/backend/middleware"
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
	trimmed := strings.TrimPrefix(path, "/api/exams/")
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

func (h *ExamHandler) GetExam(w http.ResponseWriter, r *http.Request, id string) {
	e, err := h.examService.GetExam(id)
	if err != nil {
		if err == service.ErrExamNotFound {
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
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

	e, err := h.examService.UpdateExam(id, input)
	if err != nil {
		if err == service.ErrExamNotFound {
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update exam: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(e)
}

func (h *ExamHandler) DeleteExam(w http.ResponseWriter, r *http.Request, id string) {
	if err := h.examService.DeleteExam(id); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete: %v"}`, err), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ExamHandler) GetQuestions(w http.ResponseWriter, r *http.Request, examID string) {
	questions, err := h.examService.GetQuestions(examID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to load questions: %v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(questions)
}

func (h *ExamHandler) CreateQuestion(w http.ResponseWriter, r *http.Request, examID string) {
	var input service.QuestionInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	q, err := h.examService.CreateQuestion(examID, input)
	if err != nil {
		switch err {
		case service.ErrQuestionTextReq, service.ErrMinOptionsReq:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
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

	q, err := h.examService.UpdateQuestion(examID, questionID, input)
	if err != nil {
		if err == service.ErrQuestionNotFound {
			http.Error(w, `{"error": "Question not found"}`, http.StatusNotFound)
			return
		}
		switch err {
		case service.ErrQuestionTextReq, service.ErrMinOptionsReq:
			http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
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
	if err := h.examService.DeleteQuestion(examID, questionID); err != nil {
		if err == service.ErrQuestionNotFound {
			http.Error(w, `{"error": "Question not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete question: %v"}`, err), http.StatusInternalServerError)
		return
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
		if err == service.ErrExamNotFound {
			http.Error(w, `{"error": "Exam not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(res)
}
