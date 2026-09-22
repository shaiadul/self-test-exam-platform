package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrExamNotFound          = errors.New("exam not found")
	ErrExamNameRequired      = errors.New("exam name is required (min 3 characters)")
	ErrInvalidStartDate      = errors.New("valid start date is required")
	ErrInvalidEndDate        = errors.New("valid end date is required")
	ErrEndDateBeforeStart    = errors.New("end date must be after start date")
	ErrPasscodeRequired      = errors.New("passcode is required for private exams (min 4 characters)")
	ErrInvalidDuration       = errors.New("duration must be at least 1 minute")
	ErrInvalidPassMark       = errors.New("pass mark percentage must be between 1 and 100")
	ErrInvalidPerQMark       = errors.New("per question marks must be at least 1")
	ErrInvalidNegativeMark   = errors.New("negative marking value must be greater than 0")
	ErrQuestionTextReq       = errors.New("question text is required (min 3 characters)")
	ErrMinOptionsReq         = errors.New("at least 2 non-empty options are required")
	ErrCorrectAnswerRequired = errors.New("a valid correct answer matching one of the options is required")
	ErrPassageTextReq        = errors.New("passage text is required for comprehension/passage questions")
	ErrPictureURLReq         = errors.New("picture URL is required for image-based questions")
	ErrExamLimitReached      = errors.New("exam creation limit reached")
	ErrQuestionNotFound      = errors.New("question not found")
	ErrInvalidPasscode       = errors.New("invalid exam passcode")
	ErrExamNotStarted        = errors.New("exam has not started yet")
	ErrExamEnded             = errors.New("exam has already ended")
)

type CreateExamInput struct {
	ID               string      `json:"id"`
	Name             string      `json:"name"`
	StartDate        interface{} `json:"startDate"`
	EndDate          interface{} `json:"endDate"`
	Level            string      `json:"level"`
	Batch            string      `json:"batch"`
	TotalMarks       *int        `json:"totalMarks"`
	PassingMarks     *int        `json:"passingMarks"`
	PassMark         *int        `json:"passMark"`
	PerQuestionMarks *int        `json:"perQuestionMarks"`
	PerQuestionMark  *int        `json:"perQuestionMark"`
	NegativeMarks    *float64    `json:"negativeMarks"`
	NegativeMarking  *bool       `json:"negativeMarking"`
	NegativeValue    *float64    `json:"negativeValue"`
	IsPrivate        *bool       `json:"isPrivate"`
	PrivateExam      *bool       `json:"privateExam"`
	Passcode         *string     `json:"passcode"`
	PrivatePassword  *string     `json:"privatePassword"`
	DurationMinutes  *int        `json:"durationMinutes"`
	Duration         *int        `json:"duration"`
	Randomization    *bool       `json:"randomization"`
	Feedback         *bool       `json:"feedback"`
}

type UpdateExamInput struct {
	Name             string      `json:"name"`
	StartDate        interface{} `json:"startDate"`
	EndDate          interface{} `json:"endDate"`
	Level            string      `json:"level"`
	Batch            string      `json:"batch"`
	TotalMarks       *int        `json:"totalMarks"`
	PassingMarks     *int        `json:"passingMarks"`
	PassMark         *int        `json:"passMark"`
	PerQuestionMarks *int        `json:"perQuestionMarks"`
	PerQuestionMark  *int        `json:"perQuestionMark"`
	NegativeMarks    *float64    `json:"negativeMarks"`
	NegativeMarking  *bool       `json:"negativeMarking"`
	NegativeValue    *float64    `json:"negativeValue"`
	IsPrivate        *bool       `json:"isPrivate"`
	PrivateExam      *bool       `json:"privateExam"`
	Passcode         *string     `json:"passcode"`
	PrivatePassword  *string     `json:"privatePassword"`
	DurationMinutes  *int        `json:"durationMinutes"`
	Duration         *int        `json:"duration"`
	Randomization    *bool       `json:"randomization"`
	Feedback         *bool       `json:"feedback"`
}

type QuestionInput struct {
	Type          string   `json:"type"`
	QuestionText  string   `json:"questionText"`
	Text          string   `json:"text"`
	Options       []string `json:"options"`
	CorrectAnswer string   `json:"correctAnswer"`
	CorrectIndex  *int     `json:"correctIndex"`
	Passage       *string  `json:"passage"`
	Explanation   *string  `json:"explanation"`
	PictureURL    *string  `json:"pictureUrl"`
}

type ExamService struct {
	repo     exam.ExamRepository
	userRepo user.UserRepository
	packRepo exampack.ExamPackRepository
}

func NewExamService(repo exam.ExamRepository, userRepo user.UserRepository, packRepo exampack.ExamPackRepository) *ExamService {
	return &ExamService{repo: repo, userRepo: userRepo, packRepo: packRepo}
}

// clampPassPercent keeps the pass threshold within a valid percentage range.
func clampPassPercent(p int) int {
	if p <= 0 {
		return 33
	}
	if p > 100 {
		return 100
	}
	return p
}

func (s *ExamService) roleOf(userID int) string {
	if s.userRepo == nil || userID <= 0 {
		return ""
	}
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil {
		return ""
	}
	return strings.ToLower(role)
}

// assertPackAccess ensures the pack exists. Viewing pack contents is open to all authenticated users.
func (s *ExamService) assertPackAccess(userID, packID int) error {
	pack, err := s.packRepo.GetExamPackByID(packID)
	if err != nil {
		return err
	}
	if pack == nil {
		return ErrExamPackNotFound
	}
	return nil
}

// assertExamView allows viewing exams for all authenticated users.
func (s *ExamService) assertExamView(userID int, e *exam.Exam) error {
	return nil
}

// assertExamEdit allows editing exams the teacher created, or any exam inside a
// pack the teacher owns (admins may edit everything).
func (s *ExamService) assertExamEdit(userID int, e *exam.Exam) error {
	role := s.roleOf(userID)
	if role != "teacher" {
		return nil
	}
	if e.CreatedBy != nil && *e.CreatedBy == userID {
		return nil
	}

	// Fall back to pack ownership: a teacher manages every exam (and question)
	// inside their own packs, even if the exam row itself has no creator set.
	if s.packRepo != nil {
		pack, err := s.packRepo.GetExamPackByID(e.ExamPackID)
		if err != nil {
			return err
		}
		if pack != nil && pack.CreatedBy != nil && *pack.CreatedBy == userID {
			return nil
		}
	}

	return ErrForbidden
}

func (s *ExamService) assertExamEditByID(userID int, examID string) error {
	e, err := s.repo.GetExamByID(examID)
	if err != nil {
		return err
	}
	if e == nil {
		return ErrExamNotFound
	}
	return s.assertExamEdit(userID, e)
}

// assertQuestionEdit allows a teacher to manage a question when they own the
// exam/pack, or when the question itself was authored by them.
func (s *ExamService) assertQuestionEdit(userID int, examID string, q *exam.Question) error {
	e, err := s.repo.GetExamByID(examID)
	if err != nil {
		return err
	}
	if e == nil {
		return ErrExamNotFound
	}
	if err := s.assertExamEdit(userID, e); err == nil {
		return nil
	} else if err != ErrForbidden {
		return err
	}
	if s.roleOf(userID) == "teacher" && q.CreatedBy != nil && *q.CreatedBy == userID {
		return nil
	}
	return ErrForbidden
}

func (s *ExamService) ListExams(userID int, filter exam.ExamFilter) ([]exam.Exam, exam.PaginationMeta, error) {
	exams, meta, err := s.repo.ListExams(filter)
	if err != nil {
		return nil, exam.PaginationMeta{}, err
	}

	role := s.roleOf(userID)
	if role == "student" {
		for i := range exams {
			exams[i].Passcode = ""
		}
	}

	return exams, meta, nil
}

func (s *ExamService) ListExamsByPack(userID, packID int) ([]exam.Exam, error) {
	if err := s.assertPackAccess(userID, packID); err != nil {
		return nil, err
	}
	exams, err := s.repo.GetExamsByPackID(packID)
	if err != nil {
		return nil, err
	}

	role := s.roleOf(userID)
	if role == "student" {
		for i := range exams {
			exams[i].Passcode = ""
		}
	}
	return exams, nil
}

func (s *ExamService) GetExam(userID int, id string) (*exam.Exam, error) {
	e, err := s.repo.GetExamByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrExamNotFound
	}
	if err := s.assertExamView(userID, e); err != nil {
		return nil, err
	}
	// Never expose the private exam passcode to students; it is verified
	// server-side when they unlock or submit the exam.
	if s.roleOf(userID) == "student" {
		e.Passcode = ""
	}
	return e, nil
}

func (s *ExamService) CreateExam(packID int, input CreateExamInput, creatorID int) (*exam.Exam, error) {
	name := strings.TrimSpace(input.Name)
	if len(name) < 3 {
		return nil, ErrExamNameRequired
	}

	pack, err := s.packRepo.GetExamPackByID(packID)
	if err != nil {
		return nil, err
	}
	if pack == nil {
		return nil, ErrExamPackNotFound
	}

	role := s.roleOf(creatorID)
	if role == "teacher" && (pack.CreatedBy == nil || *pack.CreatedBy != creatorID) {
		return nil, ErrForbidden
	}

	packLimit := pack.ExamLimit
	if packLimit == 0 {
		packLimit = exampack.DefaultExamLimit
	}
	if packLimit < 0 {
		packLimit = -1
	}

	startDate, err := ParseFlexibleTime(input.StartDate)
	if err != nil || startDate.IsZero() {
		return nil, ErrInvalidStartDate
	}

	endDate, err := ParseFlexibleTime(input.EndDate)
	if err != nil || endDate.IsZero() {
		return nil, ErrInvalidEndDate
	}

	if endDate.Before(startDate) {
		return nil, ErrEndDateBeforeStart
	}

	examID := strings.TrimSpace(input.ID)
	if examID == "" {
		examID = uuid.New().String()
	}

	e := exam.Exam{
		ID:         examID,
		ExamPackID: packID,
		Name:       name,
		StartDate:  startDate,
		EndDate:    endDate,
		Level:      strings.TrimSpace(input.Level),
		Batch:      strings.TrimSpace(input.Batch),
	}

	if e.Level == "" {
		e.Level = "HSC"
	}
	if e.Batch == "" {
		e.Batch = "2024"
	}

	// Marks
	if input.TotalMarks != nil && *input.TotalMarks > 0 {
		e.TotalMarks = *input.TotalMarks
	} else {
		e.TotalMarks = 10
	}

	if input.PassingMarks != nil && *input.PassingMarks > 0 {
		e.PassingMarks = *input.PassingMarks
	} else if input.PassMark != nil && *input.PassMark > 0 {
		e.PassingMarks = *input.PassMark
	} else {
		e.PassingMarks = 33
	}
	e.PassingMarks = clampPassPercent(e.PassingMarks)

	if input.PerQuestionMarks != nil && *input.PerQuestionMarks > 0 {
		e.PerQuestionMarks = *input.PerQuestionMarks
	} else if input.PerQuestionMark != nil && *input.PerQuestionMark > 0 {
		e.PerQuestionMarks = *input.PerQuestionMark
	} else {
		e.PerQuestionMarks = 2
	}

	// Calculate total marks based on question length and per-question marks
	if existingQuestions, qerr := s.repo.GetQuestionsByExamID(examID); qerr == nil && len(existingQuestions) > 0 {
		e.TotalMarks = len(existingQuestions) * e.PerQuestionMarks
	} else if input.TotalMarks != nil && *input.TotalMarks > 0 {
		e.TotalMarks = *input.TotalMarks
	} else {
		e.TotalMarks = e.PerQuestionMarks
	}

	// Negative marks logic:
	if input.NegativeMarking != nil && !*input.NegativeMarking {
		e.NegativeMarks = 0.0
	} else if input.NegativeMarks != nil {
		val := *input.NegativeMarks
		if val > 0 {
			e.NegativeMarks = -val
		} else {
			e.NegativeMarks = val
		}
	} else if input.NegativeValue != nil {
		val := *input.NegativeValue
		if val > 0 {
			e.NegativeMarks = -val
		} else {
			e.NegativeMarks = 0.0
		}
	} else if input.NegativeMarking != nil && *input.NegativeMarking {
		e.NegativeMarks = -0.5
	} else {
		e.NegativeMarks = 0.0
	}

	// Private Exam and Passcode validation
	if input.IsPrivate != nil {
		e.IsPrivate = *input.IsPrivate
	} else if input.PrivateExam != nil {
		e.IsPrivate = *input.PrivateExam
	}
	if input.Passcode != nil {
		e.Passcode = strings.TrimSpace(*input.Passcode)
	} else if input.PrivatePassword != nil {
		e.Passcode = strings.TrimSpace(*input.PrivatePassword)
	}
	if e.IsPrivate {
		if e.Passcode == "" || len(e.Passcode) < 4 {
			return nil, ErrPasscodeRequired
		}
	} else {
		e.Passcode = ""
	}

	// Duration
	if input.DurationMinutes != nil {
		if *input.DurationMinutes < 1 {
			return nil, ErrInvalidDuration
		}
		e.DurationMinutes = *input.DurationMinutes
	} else if input.Duration != nil {
		if *input.Duration < 1 {
			return nil, ErrInvalidDuration
		}
		e.DurationMinutes = *input.Duration
	} else {
		e.DurationMinutes = 30
	}

	// Policy settings (Randomization & Feedback)
	if input.Randomization != nil {
		e.Randomization = *input.Randomization
	} else {
		e.Randomization = false
	}
	if input.Feedback != nil {
		e.Feedback = *input.Feedback
	} else {
		e.Feedback = true
	}

	if creatorID > 0 {
		e.CreatedBy = &creatorID
	}

	if packLimit >= 0 {
		inserted, err := s.repo.CreateExamWithinPackLimit(&e, packID, packLimit)
		if err != nil {
			return nil, err
		}
		if !inserted {
			count := 0
			if exams, cerr := s.repo.GetExamsByPackID(packID); cerr == nil {
				count = len(exams)
			}
			return nil, examPackLimitError(count, packLimit)
		}
		return &e, nil
	}

	if err := s.repo.CreateExam(&e); err != nil {
		return nil, err
	}

	return &e, nil
}

func examPackLimitError(count, limit int) error {
	return fmt.Errorf("exam creation limit reached: this exam pack already has %d of %d allowed exams; please request an increase from an admin", count, limit)
}

func (s *ExamService) UpdateExam(userID int, id string, input UpdateExamInput) (*exam.Exam, error) {
	e, err := s.repo.GetExamByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrExamNotFound
	}
	if err := s.assertExamEdit(userID, e); err != nil {
		return nil, err
	}

	if strings.TrimSpace(input.Name) != "" {
		if len(strings.TrimSpace(input.Name)) < 3 {
			return nil, ErrExamNameRequired
		}
		e.Name = strings.TrimSpace(input.Name)
	}
	if input.StartDate != nil {
		if st, err := ParseFlexibleTime(input.StartDate); err == nil && !st.IsZero() {
			e.StartDate = st
		}
	}
	if input.EndDate != nil {
		if et, err := ParseFlexibleTime(input.EndDate); err == nil && !et.IsZero() {
			e.EndDate = et
		}
	}
	if e.EndDate.Before(e.StartDate) {
		return nil, ErrEndDateBeforeStart
	}
	if strings.TrimSpace(input.Level) != "" {
		e.Level = strings.TrimSpace(input.Level)
	}
	if strings.TrimSpace(input.Batch) != "" {
		e.Batch = strings.TrimSpace(input.Batch)
	}
	if input.TotalMarks != nil && *input.TotalMarks > 0 {
		e.TotalMarks = *input.TotalMarks
	}
	if input.PassingMarks != nil && *input.PassingMarks > 0 {
		e.PassingMarks = clampPassPercent(*input.PassingMarks)
	} else if input.PassMark != nil && *input.PassMark > 0 {
		e.PassingMarks = clampPassPercent(*input.PassMark)
	}
	if input.PerQuestionMarks != nil && *input.PerQuestionMarks > 0 {
		e.PerQuestionMarks = *input.PerQuestionMarks
	} else if input.PerQuestionMark != nil && *input.PerQuestionMark > 0 {
		e.PerQuestionMarks = *input.PerQuestionMark
	}

	// Always calculate total marks dynamically based on question length and per-question marks
	if existingQuestions, qerr := s.repo.GetQuestionsByExamID(id); qerr == nil && len(existingQuestions) > 0 {
		e.TotalMarks = len(existingQuestions) * e.PerQuestionMarks
	} else if input.TotalMarks != nil && *input.TotalMarks > 0 {
		e.TotalMarks = *input.TotalMarks
	}

	// Negative marks
	if input.NegativeMarking != nil && !*input.NegativeMarking {
		e.NegativeMarks = 0.0
	} else if input.NegativeMarks != nil {
		val := *input.NegativeMarks
		if val > 0 {
			e.NegativeMarks = -val
		} else {
			e.NegativeMarks = val
		}
	} else if input.NegativeValue != nil {
		val := *input.NegativeValue
		if val > 0 {
			e.NegativeMarks = -val
		} else {
			e.NegativeMarks = 0.0
		}
	}

	// Private Exam and Passcode
	if input.IsPrivate != nil {
		e.IsPrivate = *input.IsPrivate
	} else if input.PrivateExam != nil {
		e.IsPrivate = *input.PrivateExam
	}
	if input.Passcode != nil {
		e.Passcode = strings.TrimSpace(*input.Passcode)
	} else if input.PrivatePassword != nil {
		e.Passcode = strings.TrimSpace(*input.PrivatePassword)
	}
	if e.IsPrivate {
		if e.Passcode == "" || len(e.Passcode) < 4 {
			return nil, ErrPasscodeRequired
		}
	} else {
		e.Passcode = ""
	}

	// Duration
	if input.DurationMinutes != nil {
		if *input.DurationMinutes < 1 {
			return nil, ErrInvalidDuration
		}
		e.DurationMinutes = *input.DurationMinutes
	} else if input.Duration != nil {
		if *input.Duration < 1 {
			return nil, ErrInvalidDuration
		}
		e.DurationMinutes = *input.Duration
	}

	// Policy settings (Randomization & Feedback)
	if input.Randomization != nil {
		e.Randomization = *input.Randomization
	}
	if input.Feedback != nil {
		e.Feedback = *input.Feedback
	}

	if err := s.repo.UpdateExam(e); err != nil {
		return nil, err
	}

	return e, nil
}

func (s *ExamService) DeleteExam(userID int, id string) error {
	e, err := s.repo.GetExamByID(id)
	if err != nil {
		return err
	}
	if e == nil {
		return ErrExamNotFound
	}
	if err := s.assertExamEdit(userID, e); err != nil {
		return err
	}
	return s.repo.DeleteExam(id)
}

// GetQuestions returns the questions of an exam. Correct answers are only
// included for teachers who own the exam (and administrators); students receive
// sanitized questions so the answer key cannot be read from the API.
func (s *ExamService) GetQuestions(userID int, examID, passcode string) ([]exam.Question, error) {
	e, err := s.repo.GetExamByID(examID)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrExamNotFound
	}
	if err := s.assertExamView(userID, e); err != nil {
		return nil, err
	}

	// Private exams stay locked until the correct passcode is supplied.
	if e.IsPrivate && !s.canSeeAnswers(userID, e) {
		if strings.TrimSpace(e.Passcode) != "" && strings.TrimSpace(passcode) != strings.TrimSpace(e.Passcode) {
			return nil, ErrInvalidPasscode
		}
	}

	questions, err := s.repo.GetQuestionsByExamID(examID)
	if err != nil {
		return nil, err
	}

	if !s.canSeeAnswers(userID, e) {
		for i := range questions {
			questions[i].CorrectAnswer = ""
		}
	}
	return questions, nil
}

func (s *ExamService) canSeeAnswers(userID int, e *exam.Exam) bool {
	role := s.roleOf(userID)
	if role == "admin" {
		return true
	}
	if role != "teacher" {
		return false
	}
	return s.assertExamEdit(userID, e) == nil
}

// VerifyPasscode validates a private exam passcode server-side.
func (s *ExamService) VerifyPasscode(userID int, examID, passcode string) error {
	e, err := s.repo.GetExamByID(examID)
	if err != nil {
		return err
	}
	if e == nil {
		return ErrExamNotFound
	}
	if !e.IsPrivate || strings.TrimSpace(e.Passcode) == "" {
		return nil
	}
	if strings.TrimSpace(e.Passcode) != strings.TrimSpace(passcode) {
		return ErrInvalidPasscode
	}
	return nil
}

func (s *ExamService) CreateQuestion(userID int, examID string, input QuestionInput) (*exam.Question, error) {
	if err := s.assertExamEditByID(userID, examID); err != nil {
		return nil, err
	}

	qText := strings.TrimSpace(input.QuestionText)
	if qText == "" {
		qText = strings.TrimSpace(input.Text)
	}
	if len(qText) < 3 {
		return nil, ErrQuestionTextReq
	}

	var cleanOptions []string
	seenOpt := make(map[string]bool)
	for _, opt := range input.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" && !seenOpt[trimmed] {
			seenOpt[trimmed] = true
			cleanOptions = append(cleanOptions, trimmed)
		}
	}
	if len(cleanOptions) < 2 {
		return nil, ErrMinOptionsReq
	}

	correct := strings.TrimSpace(input.CorrectAnswer)
	if correct == "" && input.CorrectIndex != nil && *input.CorrectIndex >= 0 && *input.CorrectIndex < len(cleanOptions) {
		correct = cleanOptions[*input.CorrectIndex]
	}
	matched := false
	for _, opt := range cleanOptions {
		if opt == correct {
			matched = true
			break
		}
	}
	if !matched {
		return nil, ErrCorrectAnswerRequired
	}

	qType := strings.TrimSpace(input.Type)
	if qType == "" {
		qType = "mcq"
	}

	var passage *string
	if input.Passage != nil && strings.TrimSpace(*input.Passage) != "" {
		p := strings.TrimSpace(*input.Passage)
		passage = &p
	} else if input.Explanation != nil && strings.TrimSpace(*input.Explanation) != "" {
		p := strings.TrimSpace(*input.Explanation)
		passage = &p
	}
	if qType == "passage" && (passage == nil || strings.TrimSpace(*passage) == "") {
		return nil, ErrPassageTextReq
	}

	var pictureURL *string
	if input.PictureURL != nil && strings.TrimSpace(*input.PictureURL) != "" {
		pic := strings.TrimSpace(*input.PictureURL)
		pictureURL = &pic
	}
	if qType == "picture" && (pictureURL == nil || strings.TrimSpace(*pictureURL) == "") {
		return nil, ErrPictureURLReq
	}

	q := exam.Question{
		ExamID:        examID,
		Type:          qType,
		QuestionText:  qText,
		Options:       cleanOptions,
		CorrectAnswer: correct,
		Passage:       passage,
		PictureURL:    pictureURL,
	}
	if userID > 0 {
		q.CreatedBy = &userID
	}

	if err := s.repo.CreateQuestion(&q); err != nil {
		return nil, err
	}

	s.syncExamTotalMarks(examID)

	return &q, nil
}

func (s *ExamService) UpdateQuestion(userID int, examID string, questionID int, input QuestionInput) (*exam.Question, error) {
	existing, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return nil, err
	}
	if existing == nil || existing.ExamID != examID {
		return nil, ErrQuestionNotFound
	}
	if err := s.assertQuestionEdit(userID, examID, existing); err != nil {
		return nil, err
	}

	qText := strings.TrimSpace(input.QuestionText)
	if qText == "" {
		qText = strings.TrimSpace(input.Text)
	}
	if len(qText) < 3 {
		return nil, ErrQuestionTextReq
	}

	var cleanOptions []string
	seenOpt := make(map[string]bool)
	for _, opt := range input.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" && !seenOpt[trimmed] {
			seenOpt[trimmed] = true
			cleanOptions = append(cleanOptions, trimmed)
		}
	}
	if len(cleanOptions) < 2 {
		return nil, ErrMinOptionsReq
	}

	correct := strings.TrimSpace(input.CorrectAnswer)
	if correct == "" && input.CorrectIndex != nil && *input.CorrectIndex >= 0 && *input.CorrectIndex < len(cleanOptions) {
		correct = cleanOptions[*input.CorrectIndex]
	}
	matched := false
	for _, opt := range cleanOptions {
		if opt == correct {
			matched = true
			break
		}
	}
	if !matched {
		return nil, ErrCorrectAnswerRequired
	}

	qType := strings.TrimSpace(input.Type)
	if qType == "" {
		qType = existing.Type
	}

	var passage *string
	if input.Passage != nil && strings.TrimSpace(*input.Passage) != "" {
		p := strings.TrimSpace(*input.Passage)
		passage = &p
	} else if input.Explanation != nil && strings.TrimSpace(*input.Explanation) != "" {
		p := strings.TrimSpace(*input.Explanation)
		passage = &p
	}
	if qType == "passage" && (passage == nil || strings.TrimSpace(*passage) == "") {
		return nil, ErrPassageTextReq
	}

	var pictureURL *string
	if input.PictureURL != nil && strings.TrimSpace(*input.PictureURL) != "" {
		pic := strings.TrimSpace(*input.PictureURL)
		pictureURL = &pic
	}
	if qType == "picture" && (pictureURL == nil || strings.TrimSpace(*pictureURL) == "") {
		return nil, ErrPictureURLReq
	}

	existing.Type = qType
	existing.QuestionText = qText
	existing.Options = cleanOptions
	existing.CorrectAnswer = correct
	existing.Passage = passage
	existing.PictureURL = pictureURL

	if err := s.repo.UpdateQuestion(existing); err != nil {
		return nil, err
	}

	return existing, nil
}

func (s *ExamService) DeleteQuestion(userID int, examID string, questionID int) error {
	existing, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return err
	}
	if existing == nil || existing.ExamID != examID {
		return ErrQuestionNotFound
	}
	if err := s.assertQuestionEdit(userID, examID, existing); err != nil {
		return err
	}
	if err := s.repo.DeleteQuestion(questionID); err != nil {
		return err
	}
	s.syncExamTotalMarks(examID)
	return nil
}

func (s *ExamService) syncExamTotalMarks(examID string) {
	e, err := s.repo.GetExamByID(examID)
	if err != nil || e == nil {
		return
	}
	qs, err := s.repo.GetQuestionsByExamID(examID)
	if err != nil {
		return
	}
	perQ := e.PerQuestionMarks
	if perQ <= 0 {
		perQ = 1
	}
	e.TotalMarks = len(qs) * perQ
	_ = s.repo.UpdateExam(e)
}

func ParseFlexibleTime(val interface{}) (time.Time, error) {
	if val == nil {
		return time.Time{}, errors.New("date is nil")
	}
	switch v := val.(type) {
	case string:
		str := strings.TrimSpace(v)
		if str == "" {
			return time.Time{}, errors.New("date is empty")
		}
		formats := []string{
			time.RFC3339Nano,
			time.RFC3339,
			"2006-01-02T15:04:05.000Z",
			"2006-01-02T15:04:05Z07:00",
			"2006-01-02T15:04:05",
			"2006-01-02T15:04",
			"2006-01-02 15:04:05",
			"2006-01-02 15:04",
			"2006-01-02",
		}
		for _, f := range formats {
			if t, err := time.Parse(f, str); err == nil {
				return t, nil
			}
		}
		return time.Time{}, fmt.Errorf("unable to parse date string: %s", str)
	case float64:
		sec := int64(v)
		if sec > 1e11 {
			return time.UnixMilli(sec), nil
		}
		return time.Unix(sec, 0), nil
	default:
		return time.Time{}, fmt.Errorf("unsupported date format: %v", val)
	}
}
