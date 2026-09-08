package service

import (
	"errors"

	"github.com/selftest/backend/internal/domain/exampack"
)

var (
	ErrExamPackNotFound = errors.New("exam pack not found")
)

type ExamPackService struct {
	repo exampack.ExamPackRepository
}

func NewExamPackService(repo exampack.ExamPackRepository) *ExamPackService {
	return &ExamPackService{repo: repo}
}

func (s *ExamPackService) ListExamPacks() ([]exampack.ExamPack, error) {
	return s.repo.GetExamPacks()
}

func (s *ExamPackService) GetExamPack(id int) (*exampack.ExamPack, error) {
	pack, err := s.repo.GetExamPackByID(id)
	if err != nil {
		return nil, err
	}
	if pack == nil {
		return nil, ErrExamPackNotFound
	}
	return pack, nil
}

func (s *ExamPackService) CreateExamPack(pack *exampack.ExamPack) error {
	if pack.Image == "" {
		pack.Image = "/global/no-picture.jpg"
	}
	return s.repo.CreateExamPack(pack)
}

func (s *ExamPackService) UpdateExamPack(pack *exampack.ExamPack) error {
	return s.repo.UpdateExamPack(pack)
}

func (s *ExamPackService) DeleteExamPack(id int) error {
	return s.repo.DeleteExamPack(id)
}
