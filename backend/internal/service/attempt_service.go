package service

import (
	"encoding/json"
	"errors"
	"strings"
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

	// Enforce the exam window server-side; the client timer is not trusted.
	now := time.Now()
	if now.Before(targetExam.StartDate) {
		return nil, ErrExamNotStarted
	}
	if now.After(targetExam.EndDate) {
		return nil, ErrExamEnded
	}

	// A private exam must be unlocked with the correct passcode before grading.
	if targetExam.IsPrivate && strings.TrimSpace(targetExam.Passcode) != "" {
		if strings.TrimSpace(req.Passcode) != strings.TrimSpace(targetExam.Passcode) {
			return nil, ErrInvalidPasscode
		}
	}

	questions, err := s.examRepo.GetQuestionsByExamID(examID)
	if err != nil {
		return nil, err
	}

	// Domain evaluation
	evalResult := attempt.EvaluateSubmission(targetExam, questions, req.Answers)

	answersJSON, _ := json.Marshal(req.Answers)

	// The client-reported proctoring data is advisory only; normalize it so it
	// cannot be persisted as an absurd or negative audit value.
	warningCount := req.WarningCount
	if warningCount < 0 {
		warningCount = 0
	}
	if warningCount > 1000 {
		warningCount = 1000
	}
	securityMessage := strings.TrimSpace(req.SecurityMessage)
	if len(securityMessage) > 500 {
		securityMessage = securityMessage[:500]
	}

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
		WarningCount:    warningCount,
		SecurityMessage: securityMessage,
	}

	if err := s.attemptRepo.CreateExamAttempt(&newAttempt); err != nil {
		return nil, err
	}

	userName := "Candidate"
	if u, err := s.userRepo.GetSummaryByID(userID); err == nil && u != nil {
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

	// Resolve every referenced exam and pack in two batched queries rather than
	// two lookups per attempt.
	examIDs := make([]string, 0, len(attempts))
	seenExam := map[string]bool{}
	for _, a := range attempts {
		if !seenExam[a.ExamID] {
			seenExam[a.ExamID] = true
			examIDs = append(examIDs, a.ExamID)
		}
	}

	exams := map[string]exam.Exam{}
	packIDs := []int{}
	seenPack := map[int]bool{}
	if len(examIDs) > 0 {
		if examList, err := s.examRepo.GetExamsByIDs(examIDs); err == nil {
			for _, e := range examList {
				exams[e.ID] = e
				if !seenPack[e.ExamPackID] {
					seenPack[e.ExamPackID] = true
					packIDs = append(packIDs, e.ExamPackID)
				}
			}
		}
	}

	packs := map[int]exampack.ExamPack{}
	if len(packIDs) > 0 {
		if packMap, err := s.examPackRepo.GetExamPacksByIDs(packIDs); err == nil {
			packs = packMap
		}
	}

	results := make([]attempt.AttemptWithExam, 0, len(attempts))
	for _, a := range attempts {
		examName := "Unknown Exam"
		packName := "Unknown Pack"

		if targetExam, ok := exams[a.ExamID]; ok {
			examName = targetExam.Name
			if pack, ok := packs[targetExam.ExamPackID]; ok {
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

// isStaff reports whether the user is a teacher or administrator.
func (s *AttemptService) isStaff(userID int) bool {
	if s.userRepo == nil || userID <= 0 {
		return false
	}
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil {
		return false
	}
	role = strings.ToLower(role)
	return role == "teacher" || role == "admin"
}

// GetAttemptQuestions returns the full question bank (including correct
// answers) for an attempt, but only to its owner or staff members. This is the
// authorized path used to render post-submission solutions.
func (s *AttemptService) GetAttemptQuestions(userID, attemptID int) ([]exam.Question, error) {
	a, err := s.attemptRepo.GetExamAttemptByID(attemptID)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, ErrAttemptNotFound
	}
	if a.UserID != userID && !s.isStaff(userID) {
		return nil, ErrForbidden
	}
	return s.examRepo.GetQuestionsByExamID(a.ExamID)
}

func (s *AttemptService) GetAttemptDetails(userID, id int) (*attempt.AttemptDetailsResponse, error) {
	a, err := s.attemptRepo.GetExamAttemptByID(id)
	if err != nil {
		return nil, err
	}
	if a == nil {
		return nil, ErrAttemptNotFound
	}
	// Prevent horizontal privilege escalation: only the owner (or staff) may
	// read an attempt's answers, score and audit trail.
	if a.UserID != userID && !s.isStaff(userID) {
		return nil, ErrForbidden
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
	u, err := s.userRepo.GetSummaryByID(a.UserID)
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
