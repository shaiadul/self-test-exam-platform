package service

import (
	"errors"
	"fmt"
	"strings"

	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/user"
)

var (
	ErrExamPackNotFound     = errors.New("exam pack not found")
	ErrForbidden            = errors.New("you do not have permission to perform this action")
	ErrExamPackLimitReached = errors.New("exam pack creation limit reached")
)

type ExamPackService struct {
	repo     exampack.ExamPackRepository
	userRepo user.UserRepository
}

func NewExamPackService(repo exampack.ExamPackRepository, userRepo user.UserRepository) *ExamPackService {
	return &ExamPackService{repo: repo, userRepo: userRepo}
}

func (s *ExamPackService) roleOf(userID int) (string, error) {
	if s.userRepo == nil || userID <= 0 {
		return "", nil
	}
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil {
		return "", err
	}
	return strings.ToLower(role), nil
}

func (s *ExamPackService) ListExamPacks(userID int, onlyMine bool) ([]exampack.ExamPack, error) {
	if onlyMine {
		if userID <= 0 {
			return []exampack.ExamPack{}, nil
		}
		return s.repo.GetExamPacksByCreator(userID)
	}
	return s.repo.GetExamPacks()
}

func (s *ExamPackService) GetExamPack(userID int, id int) (*exampack.ExamPack, error) {
	pack, err := s.repo.GetExamPackByID(id)
	if err != nil {
		return nil, err
	}
	if pack == nil {
		return nil, ErrExamPackNotFound
	}
	return pack, nil
}

func (s *ExamPackService) CreateExamPack(userID int, pack *exampack.ExamPack) error {
	role, err := s.roleOf(userID)
	if err != nil {
		return err
	}

	if pack.Image == "" {
		pack.Image = "/global/no-picture.jpg"
	}
	if pack.ExamLimit <= 0 {
		pack.ExamLimit = exampack.DefaultExamLimit
	}

	if role == "teacher" {
		limit, err := s.resolvePackLimit(userID)
		if err != nil {
			return err
		}
		pack.CreatedBy = &userID
		if limit != nil {
			created, err := s.repo.CreateExamPackWithinLimit(pack, userID, *limit)
			if err != nil {
				return err
			}
			if !created {
				count, _ := s.repo.CountExamPacksByCreator(userID)
				return fmt.Errorf("exam pack creation limit reached: you have already created %d of %d allowed exam packs; please request an increase", count, *limit)
			}
			return nil
		}
	} else if userID > 0 {
		pack.CreatedBy = &userID
	}

	return s.repo.CreateExamPack(pack)
}

func (s *ExamPackService) UpdateExamPack(userID int, pack *exampack.ExamPack) error {
	existing, err := s.repo.GetExamPackByID(pack.ID)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrExamPackNotFound
	}

	role, err := s.roleOf(userID)
	if err != nil {
		return err
	}
	if role == "teacher" && (existing.CreatedBy == nil || *existing.CreatedBy != userID) {
		return ErrForbidden
	}

	return s.repo.UpdateExamPack(pack)
}

func (s *ExamPackService) DeleteExamPack(userID int, id int) error {
	existing, err := s.repo.GetExamPackByID(id)
	if err != nil {
		return err
	}
	if existing == nil {
		return ErrExamPackNotFound
	}

	role, err := s.roleOf(userID)
	if err != nil {
		return err
	}
	if role == "teacher" && (existing.CreatedBy == nil || *existing.CreatedBy != userID) {
		return ErrForbidden
	}

	return s.repo.DeleteExamPack(id)
}

// resolvePackLimit returns the teacher's exam pack creation limit. A negative
// value means unlimited.
func (s *ExamPackService) resolvePackLimit(userID int) (*int, error) {
	u, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}
	if u == nil {
		return nil, nil
	}

	limit := 3
	if u.ExamPackLimit != nil {
		limit = *u.ExamPackLimit
	}
	if limit < 0 {
		limit = -1
	}
	return &limit, nil
}
