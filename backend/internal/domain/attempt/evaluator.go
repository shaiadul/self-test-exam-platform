package attempt

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/selftest/backend/internal/domain/exam"
)

// EvaluateSubmission calculates score, correct, wrong, negative marks, and pass/fail status
func EvaluateSubmission(targetExam *exam.Exam, questions []exam.Question, answers map[string]interface{}) EvaluationResult {
	var correct, wrong int

	for _, q := range questions {
		var rawVal interface{}
		var exists bool

		rawVal, exists = answers[strconv.Itoa(q.ID)]
		if !exists {
			rawVal, exists = answers[fmt.Sprintf("q%d", q.ID)]
			if !exists {
				for key, val := range answers {
					if strings.Contains(key, strconv.Itoa(q.ID)) {
						rawVal = val
						exists = true
						break
					}
				}
			}
		}

		var userAns string
		if exists && rawVal != nil {
			switch v := rawVal.(type) {
			case string:
				userAns = strings.TrimSpace(v)
			case float64:
				userAns = strconv.Itoa(int(v))
			case int:
				userAns = strconv.Itoa(v)
			default:
				userAns = fmt.Sprintf("%v", v)
			}
		}

		if exists && userAns != "" {
			isCorrect := false
			if userAns == q.CorrectAnswer {
				isCorrect = true
			} else if idx, err := strconv.Atoi(userAns); err == nil && idx >= 0 && idx < len(q.Options) {
				if q.Options[idx] == q.CorrectAnswer {
					isCorrect = true
				}
			}

			if isCorrect {
				correct++
			} else {
				wrong++
			}
		}
	}

	// Formula: score = (correct * perQuestionMark) + (wrong * negativeMark)
	negFactor := targetExam.NegativeMarks
	if negFactor > 0 {
		negFactor = -negFactor // Ensure it is negative
	}
	perQMark := float64(targetExam.PerQuestionMarks)
	if perQMark == 0 {
		perQMark = 1.0
	}

	negScore := float64(wrong) * negFactor
	finalScore := (float64(correct) * perQMark) + negScore
	if finalScore < 0 {
		finalScore = 0
	}

	// PassingMarks is stored as a percentage of the total marks. Fall back to the
	// maximum achievable score when total marks are not configured.
	passPercent := float64(targetExam.PassingMarks)
	if passPercent <= 0 {
		passPercent = 33
	}
	maxScore := float64(targetExam.TotalMarks)
	if maxScore <= 0 {
		maxScore = float64(len(questions)) * perQMark
	}
	passingScore := maxScore * passPercent / 100
	passed := finalScore >= passingScore

	return EvaluationResult{
		Total:      len(questions),
		Correct:    correct,
		Wrong:      wrong,
		NegScore:   negScore,
		FinalScore: finalScore,
		Passed:     passed,
	}
}
