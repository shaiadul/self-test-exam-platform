package service

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/selftest/backend/internal/domain/attempt"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrAttemptNotFound = errors.New("attempt not found")
)

type AttemptService struct {
	attemptRepo  attempt.AttemptRepository
	examRepo     exam.ExamRepository
	examPackRepo exampack.ExamPackRepository
	userRepo     user.UserRepository
}

func NewAttemptService(
	attemptRepo attempt.AttemptRepository,
	examRepo exam.ExamRepository,
	examPackRepo exampack.ExamPackRepository,
	userRepo user.UserRepository,
) *AttemptService {
	return &AttemptService{
		attemptRepo:  attemptRepo,
		examRepo:     examRepo,
		examPackRepo: examPackRepo,
		userRepo:     userRepo,
	}
}

func (s *AttemptService) SubmitExam(userID int, examID string, req attempt.SubmitExamRequest) (*attempt.SubmitExamResponse, error) {
	targetExam, err := s.examRepo.GetExamByID(examID)
	if err != nil || targetExam == nil {
		return nil, ErrExamNotFound
	}

	questions, err := s.examRepo.GetQuestionsByExamID(examID)
	if err != nil {
		return nil, err
	}

	// Domain evaluation
	evalResult := attempt.EvaluateSubmission(targetExam, questions, req.Answers)

	answersJSON, _ := json.Marshal(req.Answers)

	newAttempt := attempt.ExamAttempt{
		UserID:          userID,
		ExamID:          examID,
		Answers:         string(answersJSON),
		Total:           evalResult.Total,
		Correct:         evalResult.Correct,
		Wrong:           evalResult.Wrong,
		Negative:        evalResult.NegScore,
		FinalScore:      evalResult.FinalScore,
		Passed:          evalResult.Passed,
		WarningCount:    req.WarningCount,
		SecurityMessage: req.SecurityMessage,
	}

	if err := s.attemptRepo.CreateExamAttempt(&newAttempt); err != nil {
		return nil, err
	}

	userName := "Candidate"
	if u, err := s.userRepo.GetByID(userID); err == nil && u != nil {
		userName = u.Name
	}

	return &attempt.SubmitExamResponse{
		ExamAttempt: newAttempt,
		UserName:    userName,
	}, nil
}

func (s *AttemptService) GetUserAttempts(userID int) ([]attempt.AttemptWithExam, error) {
	attempts, err := s.attemptRepo.GetExamAttemptsByUserID(userID)
	if err != nil {
		return nil, err
	}

	var results []attempt.AttemptWithExam
	for _, a := range attempts {
		examName := "Unknown Exam"
		packName := "Unknown Pack"

		targetExam, err := s.examRepo.GetExamByID(a.ExamID)
		if err == nil && targetExam != nil {
			examName = targetExam.Name
			pack, err := s.examPackRepo.GetExamPackByID(targetExam.ExamPackID)
			if err == nil && pack != nil {
				packName = pack.Title
			}
		}

		results = append(results, attempt.AttemptWithExam{
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

	return results, nil
}

func (s *AttemptService) GetAttemptDetails(id int) (*attempt.AttemptDetailsResponse, error) {
	a, err := s.attemptRepo.GetExamAttemptByID(id)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, ErrAttemptNotFound
	}

	examName := "Unknown Exam"
	packName := "Unknown Pack"
	var examPackID int
	var startDate, endDate time.Time
	var level, batch string
	var perQuestionMarks, totalMarks, passingMarks int
	var negativeMarks float64

	targetExam, err := s.examRepo.GetExamByID(a.ExamID)
	if err == nil && targetExam != nil {
		examName = targetExam.Name
		examPackID = targetExam.ExamPackID
		startDate = targetExam.StartDate
		endDate = targetExam.EndDate
		level = targetExam.Level
		batch = targetExam.Batch
		perQuestionMarks = targetExam.PerQuestionMarks
		totalMarks = targetExam.TotalMarks
		passingMarks = targetExam.PassingMarks
		negativeMarks = targetExam.NegativeMarks

		pack, err := s.examPackRepo.GetExamPackByID(targetExam.ExamPackID)
		if err == nil && pack != nil {
			packName = pack.Title
		}
	}

	userName := "Candidate"
	u, err := s.userRepo.GetByID(a.UserID)
	if err == nil && u != nil {
		userName = u.Name
	}

	return &attempt.AttemptDetailsResponse{
		ID:               a.ID,
		UserID:           a.UserID,
		UserName:         userName,
		ExamID:           a.ExamID,
		ExamName:         examName,
		ExamPackID:       examPackID,
		PackName:         packName,
		Answers:          a.Answers,
		Total:            a.Total,
		Correct:          a.Correct,
		Wrong:            a.Wrong,
		Negative:         a.Negative,
		FinalScore:       a.FinalScore,
		Passed:           a.Passed,
		WarningCount:     a.WarningCount,
		SecurityMessage:  a.SecurityMessage,
		CreatedAt:        a.CreatedAt,
		StartDate:        startDate,
		EndDate:          endDate,
		Level:            level,
		Batch:            batch,
		PerQuestionMarks: perQuestionMarks,
		TotalMarks:       totalMarks,
		PassingMarks:     passingMarks,
		NegativeMarks:    negativeMarks,
	}, nil
}
