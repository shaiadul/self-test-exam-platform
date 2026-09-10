package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrExamNotFound       = errors.New("exam not found")
	ErrExamNameRequired   = errors.New("exam name is required")
	ErrInvalidStartDate   = errors.New("valid start date is required")
	ErrInvalidEndDate     = errors.New("valid end date is required")
	ErrEndDateBeforeStart = errors.New("end date must be after start date")
	ErrQuestionTextReq    = errors.New("question text is required")
	ErrMinOptionsReq      = errors.New("at least 2 options are required")
	ErrExamLimitReached   = errors.New("exam creation limit reached")
	ErrQuestionNotFound   = errors.New("question not found")
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
}

func NewExamService(repo exam.ExamRepository, userRepo user.UserRepository) *ExamService {
	return &ExamService{repo: repo, userRepo: userRepo}
}

func (s *ExamService) ListExamsByPack(packID int) ([]exam.Exam, error) {
	return s.repo.GetExamsByPackID(packID)
}

func (s *ExamService) GetExam(id string) (*exam.Exam, error) {
	e, err := s.repo.GetExamByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrExamNotFound
	}
	return e, nil
}

func (s *ExamService) CreateExam(packID int, input CreateExamInput, creatorID int) (*exam.Exam, error) {
	name := strings.TrimSpace(input.Name)
	if name == "" {
		return nil, ErrExamNameRequired
	}

	if creatorID > 0 && s.userRepo != nil {
		u, err := s.userRepo.GetByID(creatorID)
		if err == nil && u != nil && strings.ToLower(u.Role) == "teacher" {
			limit := 5
			if u.ExamLimit != nil {
				limit = *u.ExamLimit
			}
			if limit >= 0 {
				count, err := s.repo.CountExamsByCreator(creatorID)
				if err == nil && count >= limit {
					return nil, fmt.Errorf("exam creation limit reached: you have already created %d of %d allowed exams; please contact an admin to increase your limit", count, limit)
				}
			}
		}
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
		e.PassingMarks = 5
	}

	if input.PerQuestionMarks != nil && *input.PerQuestionMarks > 0 {
		e.PerQuestionMarks = *input.PerQuestionMarks
	} else if input.PerQuestionMark != nil && *input.PerQuestionMark > 0 {
		e.PerQuestionMarks = *input.PerQuestionMark
	} else {
		e.PerQuestionMarks = 2
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

	// Duration
	if input.DurationMinutes != nil && *input.DurationMinutes > 0 {
		e.DurationMinutes = *input.DurationMinutes
	} else if input.Duration != nil && *input.Duration > 0 {
		e.DurationMinutes = *input.Duration
	} else {
		e.DurationMinutes = 30
	}

	if creatorID > 0 {
		e.CreatedBy = &creatorID
	}

	if err := s.repo.CreateExam(&e); err != nil {
		return nil, err
	}

	return &e, nil
}

func (s *ExamService) UpdateExam(id string, input UpdateExamInput) (*exam.Exam, error) {
	e, err := s.repo.GetExamByID(id)
	if err != nil {
		return nil, err
	}
	if e == nil {
		return nil, ErrExamNotFound
	}

	if strings.TrimSpace(input.Name) != "" {
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
		e.PassingMarks = *input.PassingMarks
	} else if input.PassMark != nil && *input.PassMark > 0 {
		e.PassingMarks = *input.PassMark
	}
	if input.PerQuestionMarks != nil && *input.PerQuestionMarks > 0 {
		e.PerQuestionMarks = *input.PerQuestionMarks
	} else if input.PerQuestionMark != nil && *input.PerQuestionMark > 0 {
		e.PerQuestionMarks = *input.PerQuestionMark
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

	// Duration
	if input.DurationMinutes != nil && *input.DurationMinutes > 0 {
		e.DurationMinutes = *input.DurationMinutes
	} else if input.Duration != nil && *input.Duration > 0 {
		e.DurationMinutes = *input.Duration
	}

	if err := s.repo.UpdateExam(e); err != nil {
		return nil, err
	}

	return e, nil
}

func (s *ExamService) DeleteExam(id string) error {
	return s.repo.DeleteExam(id)
}

func (s *ExamService) GetQuestions(examID string) ([]exam.Question, error) {
	return s.repo.GetQuestionsByExamID(examID)
}

func (s *ExamService) CreateQuestion(examID string, input QuestionInput) (*exam.Question, error) {
	qText := strings.TrimSpace(input.QuestionText)
	if qText == "" {
		qText = strings.TrimSpace(input.Text)
	}
	if qText == "" {
		return nil, ErrQuestionTextReq
	}

	var cleanOptions []string
	for _, opt := range input.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" {
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
	if correct == "" {
		correct = cleanOptions[0]
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

	var pictureURL *string
	if input.PictureURL != nil && strings.TrimSpace(*input.PictureURL) != "" {
		pic := strings.TrimSpace(*input.PictureURL)
		pictureURL = &pic
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

	if err := s.repo.CreateQuestion(&q); err != nil {
		return nil, err
	}

	return &q, nil
}

func (s *ExamService) UpdateQuestion(examID string, questionID int, input QuestionInput) (*exam.Question, error) {
	existing, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return nil, err
	}
	if existing == nil || existing.ExamID != examID {
		return nil, ErrQuestionNotFound
	}

	qText := strings.TrimSpace(input.QuestionText)
	if qText == "" {
		qText = strings.TrimSpace(input.Text)
	}
	if qText == "" {
		return nil, ErrQuestionTextReq
	}

	var cleanOptions []string
	for _, opt := range input.Options {
		trimmed := strings.TrimSpace(opt)
		if trimmed != "" {
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
	if correct == "" {
		correct = cleanOptions[0]
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

	var pictureURL *string
	if input.PictureURL != nil && strings.TrimSpace(*input.PictureURL) != "" {
		pic := strings.TrimSpace(*input.PictureURL)
		pictureURL = &pic
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

func (s *ExamService) DeleteQuestion(examID string, questionID int) error {
	existing, err := s.repo.GetQuestionByID(questionID)
	if err != nil {
		return err
	}
	if existing == nil || existing.ExamID != examID {
		return ErrQuestionNotFound
	}
	return s.repo.DeleteQuestion(questionID)
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
