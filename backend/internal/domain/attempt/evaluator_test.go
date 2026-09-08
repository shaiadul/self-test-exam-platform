package attempt

import (
	"testing"

	"github.com/selftest/backend/internal/domain/exam"
)

func TestEvaluateSubmission(t *testing.T) {
	testExam := &exam.Exam{
		TotalMarks:       10,
		PassingMarks:     5,
		PerQuestionMarks: 2,
		NegativeMarks:    -0.5,
	}

	questions := []exam.Question{
		{
			ID:            1,
			Type:          "mcq",
			QuestionText:  "What is 2+2?",
			Options:       []string{"2", "3", "4", "5"},
			CorrectAnswer: "4",
		},
		{
			ID:            2,
			Type:          "mcq",
			QuestionText:  "Capital of France?",
			Options:       []string{"Paris", "London", "Berlin"},
			CorrectAnswer: "Paris",
		},
		{
			ID:            3,
			Type:          "mcq",
			QuestionText:  "Sun rises in?",
			Options:       []string{"North", "East", "South", "West"},
			CorrectAnswer: "East",
		},
	}

	t.Run("All correct answers by direct string", func(t *testing.T) {
		answers := map[string]interface{}{
			"1": "4",
			"2": "Paris",
			"3": "East",
		}

		result := EvaluateSubmission(testExam, questions, answers)

		if result.Correct != 3 {
			t.Errorf("expected 3 correct, got %d", result.Correct)
		}
		if result.Wrong != 0 {
			t.Errorf("expected 0 wrong, got %d", result.Wrong)
		}
		if result.FinalScore != 6.0 {
			t.Errorf("expected score 6.0, got %f", result.FinalScore)
		}
		if !result.Passed {
			t.Errorf("expected passed=true")
		}
	})

	t.Run("Answers by option index", func(t *testing.T) {
		// Q1 index 2 is "4"
		// Q2 index 0 is "Paris"
		// Q3 index 1 is "East"
		answers := map[string]interface{}{
			"1": 2,
			"2": 0,
			"3": 1,
		}

		result := EvaluateSubmission(testExam, questions, answers)

		if result.Correct != 3 {
			t.Errorf("expected 3 correct, got %d", result.Correct)
		}
		if result.FinalScore != 6.0 {
			t.Errorf("expected 6.0, got %f", result.FinalScore)
		}
	})

	t.Run("Some wrong with negative marks", func(t *testing.T) {
		// Q1 correct ("4"), Q2 wrong ("London"), Q3 unanswered
		answers := map[string]interface{}{
			"1": "4",
			"2": "London",
		}

		result := EvaluateSubmission(testExam, questions, answers)

		if result.Correct != 1 {
			t.Errorf("expected 1 correct, got %d", result.Correct)
		}
		if result.Wrong != 1 {
			t.Errorf("expected 1 wrong, got %d", result.Wrong)
		}
		// 1 correct * 2 = 2.0. 1 wrong * -0.5 = -0.5. FinalScore = 1.5
		if result.FinalScore != 1.5 {
			t.Errorf("expected final score 1.5, got %f", result.FinalScore)
		}
		// Passing is 5, so should fail
		if result.Passed {
			t.Errorf("expected passed=false")
		}
	})

	t.Run("Floor at 0 score", func(t *testing.T) {
		// All wrong
		answers := map[string]interface{}{
			"1": "wrong1",
			"2": "wrong2",
			"3": "wrong3",
		}

		result := EvaluateSubmission(testExam, questions, answers)

		if result.Correct != 0 {
			t.Errorf("expected 0 correct, got %d", result.Correct)
		}
		if result.Wrong != 3 {
			t.Errorf("expected 3 wrong, got %d", result.Wrong)
		}
		if result.FinalScore != 0 {
			t.Errorf("expected floor of 0, got %f", result.FinalScore)
		}
	})
}
