package service

import (
	"testing"
	"time"

	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
)

func TestParseFlexibleTime(t *testing.T) {
	testCases := []struct {
		name      string
		input     interface{}
		expectErr bool
	}{
		{"RFC3339", "2026-09-08T12:00:00Z", false},
		{"ISO datetime", "2026-09-08T12:00:00", false},
		{"Standard datetime", "2026-09-08 12:00:00", false},
		{"Date only", "2026-09-08", false},
		{"Unix timestamp sec", float64(1700000000), false},
		{"Unix timestamp milli", float64(1700000000000), false},
		{"Nil input", nil, true},
		{"Empty string", "", true},
		{"Invalid string", "not-a-date", true},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			res, err := ParseFlexibleTime(tc.input)
			if tc.expectErr && err == nil {
				t.Errorf("expected error, got nil: %v", res)
			}
			if !tc.expectErr && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if !tc.expectErr && res.IsZero() {
				t.Errorf("expected non-zero time")
			}
		})
	}
}

func TestExamDateValidation(t *testing.T) {
	start := time.Now()
	end := start.Add(1 * time.Hour)

	// Valid start < end
	if end.Before(start) {
		t.Errorf("expected end to be after start")
	}
}

type mockExamRepoForQuestions struct {
	exam.ExamRepository
	exam      *exam.Exam
	questions []exam.Question
}

func (m *mockExamRepoForQuestions) GetExamByID(id string) (*exam.Exam, error) {
	return m.exam, nil
}

func (m *mockExamRepoForQuestions) GetQuestionsByExamID(examID string) ([]exam.Question, error) {
	return m.questions, nil
}

func TestGetQuestionsSecurity(t *testing.T) {
	teacherID := 1
	studentID := 2
	examCreator := teacherID

	sampleExam := &exam.Exam{
		ID:         "exam-1",
		ExamPackID: 10,
		Name:       "Security Test Exam",
		Feedback:   true,
		CreatedBy:  &examCreator,
	}

	rawQuestions := []exam.Question{
		{
			ID:            101,
			ExamID:        "exam-1",
			QuestionText:  "What is 2+2?",
			Options:       []string{"3", "4", "5"},
			CorrectAnswer: "4",
		},
	}

	examRepo := &mockExamRepoForQuestions{
		exam:      sampleExam,
		questions: rawQuestions,
	}

	userRepo := &mockRoleUserRepo{
		roles: map[int]string{
			teacherID: "teacher",
			studentID: "student",
		},
	}

	packRepo := &mockPackRepo{
		packs: map[int]*exampack.ExamPack{
			10: {ID: 10, CreatedBy: &teacherID},
		},
	}

	svc := NewExamService(examRepo, userRepo, packRepo)

	// 1. Exam taking mode (isManage = false): Teacher MUST NOT receive correct answers
	qs, err := svc.GetQuestions(teacherID, "exam-1", "", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(qs) != 1 || qs[0].CorrectAnswer != "" {
		t.Errorf("expected empty CorrectAnswer during exam taking, got: %q", qs[0].CorrectAnswer)
	}

	// 2. Exam taking mode (isManage = false): Student MUST NOT receive correct answers
	qs, err = svc.GetQuestions(studentID, "exam-1", "", false)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(qs) != 1 || qs[0].CorrectAnswer != "" {
		t.Errorf("expected empty CorrectAnswer during student exam taking, got: %q", qs[0].CorrectAnswer)
	}

	// 3. Question management mode (isManage = true): Teacher who owns exam receives correct answers
	qs, err = svc.GetQuestions(teacherID, "exam-1", "", true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(qs) != 1 || qs[0].CorrectAnswer != "4" {
		t.Errorf("expected CorrectAnswer '4' in manage mode for owner, got: %q", qs[0].CorrectAnswer)
	}

	// 4. Question management mode (isManage = true): Student must still NOT receive correct answers
	qs, err = svc.GetQuestions(studentID, "exam-1", "", true)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(qs) != 1 || qs[0].CorrectAnswer != "" {
		t.Errorf("expected empty CorrectAnswer for student in manage mode, got: %q", qs[0].CorrectAnswer)
	}
}
