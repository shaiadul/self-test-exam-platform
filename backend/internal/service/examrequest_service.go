package service

import (
	"errors"
	"strings"

	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrRequestNotFound = errors.New("request not found")
	ErrRequestHandled  = errors.New("request has already been reviewed")
	ErrInvalidRequest  = errors.New("invalid request")
)

type ExamRequestService struct {
	repo     examrequest.ExamRequestRepository
	userRepo user.UserRepository
	packRepo exampack.ExamPackRepository
}

func NewExamRequestService(repo examrequest.ExamRequestRepository, userRepo user.UserRepository, packRepo exampack.ExamPackRepository) *ExamRequestService {
	return &ExamRequestService{repo: repo, userRepo: userRepo, packRepo: packRepo}
}

func (s *ExamRequestService) roleOf(userID int) string {
	if s.userRepo == nil || userID <= 0 {
		return ""
	}
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil {
		return ""
	}
	return strings.ToLower(role)
}

func (s *ExamRequestService) Create(teacherID int, req examrequest.ExamRequest) (*examrequest.ExamRequest, error) {
	req.Type = strings.ToLower(strings.TrimSpace(req.Type))
	if req.Type != examrequest.TypePack && req.Type != examrequest.TypeLimit {
		return nil, ErrInvalidRequest
	}
	if strings.TrimSpace(req.Title) == "" || req.RequestedLimit <= 0 {
		return nil, ErrInvalidRequest
	}

	if req.Type == examrequest.TypeLimit {
		if req.PackID == nil {
			return nil, ErrInvalidRequest
		}
		pack, err := s.packRepo.GetExamPackByID(*req.PackID)
		if err != nil {
			return nil, err
		}
		if pack == nil {
			return nil, ErrExamPackNotFound
		}
		if pack.CreatedBy == nil || *pack.CreatedBy != teacherID {
			return nil, ErrForbidden
		}
	}

	req.TeacherID = teacherID
	req.Status = examrequest.StatusPending
	if err := s.repo.Create(&req); err != nil {
		return nil, err
	}

	return s.repo.GetByID(req.ID)
}

func (s *ExamRequestService) List(userID int) ([]examrequest.ExamRequest, error) {
	if s.roleOf(userID) == "teacher" {
		return s.repo.GetByTeacher(userID)
	}
	return s.repo.GetAll()
}

func (s *ExamRequestService) Review(adminID, requestID int, status string, note *string) (*examrequest.ExamRequest, error) {
	if s.roleOf(adminID) != "admin" {
		return nil, ErrForbidden
	}

	status = strings.ToLower(strings.TrimSpace(status))
	if status != examrequest.StatusApproved && status != examrequest.StatusRejected {
		return nil, ErrInvalidRequest
	}

	req, err := s.repo.GetByID(requestID)
	if err != nil {
		return nil, err
	}
	if req == nil {
		return nil, ErrRequestNotFound
	}
	if req.Status != examrequest.StatusPending {
		return nil, ErrRequestHandled
	}

	if status == examrequest.StatusApproved {
		if err := s.applyApproval(req); err != nil {
			return nil, err
		}
	}

	if err := s.repo.UpdateStatus(requestID, status, note); err != nil {
		return nil, err
	}

	return s.repo.GetByID(requestID)
}

func (s *ExamRequestService) applyApproval(req *examrequest.ExamRequest) error {
	switch req.Type {
	case examrequest.TypePack:
		// Grant the teacher the requested total exam pack allowance.
		return s.userRepo.UpdateExamPackLimit(req.TeacherID, req.RequestedLimit)
	case examrequest.TypeLimit:
		if req.PackID == nil {
			return ErrInvalidRequest
		}
		// Raise the exam creation limit of the requested pack.
		return s.packRepo.UpdateExamPackLimit(*req.PackID, req.RequestedLimit)
	default:
		return ErrInvalidRequest
	}
}
