package service

import (
	"testing"

	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
	"github.com/selftest/backend/internal/domain/user"
)

type mockRoleUserRepo struct {
	user.UserRepository
	roles map[int]string
}

func (m *mockRoleUserRepo) GetRoleByID(id int) (string, error) {
	if r, ok := m.roles[id]; ok {
		return r, nil
	}
	return "student", nil
}

func (m *mockRoleUserRepo) GetByID(id int) (*user.User, error) {
	role := "student"
	if r, ok := m.roles[id]; ok {
		role = r
	}
	limit := 10
	return &user.User{
		ID:            id,
		Role:          role,
		ExamPackLimit: &limit,
		ExamLimit:     &limit,
	}, nil
}

type mockPackRepo struct {
	exampack.ExamPackRepository
	packs map[int]*exampack.ExamPack
}

func (m *mockPackRepo) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	if p, ok := m.packs[id]; ok {
		return p, nil
	}
	return nil, nil
}

func (m *mockPackRepo) CreateExamPack(pack *exampack.ExamPack) error {
	pack.ID = 100
	m.packs[pack.ID] = pack
	return nil
}

func (m *mockPackRepo) CreateExamPackWithinLimit(pack *exampack.ExamPack, creatorID int, limit int) (bool, error) {
	pack.ID = 101
	m.packs[pack.ID] = pack
	return true, nil
}

func (m *mockPackRepo) UpdateExamPack(pack *exampack.ExamPack) error {
	m.packs[pack.ID] = pack
	return nil
}

func (m *mockPackRepo) DeleteExamPack(id int) error {
	delete(m.packs, id)
	return nil
}

func (m *mockPackRepo) CountExamPacksByCreator(creatorID int) (int, error) {
	return 0, nil
}

func TestExamPackRolePermissions(t *testing.T) {
	studentID := 1
	teacherID := 2
	otherTeacherID := 3
	adminID := 4

	uRepo := &mockRoleUserRepo{
		roles: map[int]string{
			studentID:      "student",
			teacherID:      "teacher",
			otherTeacherID: "teacher",
			adminID:        "admin",
		},
	}

	pRepo := &mockPackRepo{
		packs: make(map[int]*exampack.ExamPack),
	}

	packSvc := NewExamPackService(pRepo, uRepo)

	// 1. Student cannot create exam pack
	err := packSvc.CreateExamPack(studentID, &exampack.ExamPack{Title: "Student Pack"})
	if err != ErrForbidden {
		t.Fatalf("expected ErrForbidden for student creating exam pack, got %v", err)
	}

	// 2. Teacher can create exam pack
	teacherPack := &exampack.ExamPack{Title: "Teacher Pack"}
	if err := packSvc.CreateExamPack(teacherID, teacherPack); err != nil {
		t.Fatalf("expected teacher to create exam pack, got %v", err)
	}
	if teacherPack.CreatedBy == nil || *teacherPack.CreatedBy != teacherID {
		t.Fatalf("expected pack creator to be teacherID %d, got %v", teacherID, teacherPack.CreatedBy)
	}

	// 3. Other teacher cannot update teacher's pack
	err = packSvc.UpdateExamPack(otherTeacherID, teacherPack)
	if err != ErrForbidden {
		t.Fatalf("expected ErrForbidden for other teacher updating pack, got %v", err)
	}

	// 4. Other teacher cannot delete teacher's pack
	err = packSvc.DeleteExamPack(otherTeacherID, teacherPack.ID)
	if err != ErrForbidden {
		t.Fatalf("expected ErrForbidden for other teacher deleting pack, got %v", err)
	}

	// 5. Admin can update teacher's pack
	teacherPack.Title = "Updated by Admin"
	if err := packSvc.UpdateExamPack(adminID, teacherPack); err != nil {
		t.Fatalf("expected admin to be able to update pack, got %v", err)
	}

	// 6. Admin can delete teacher's pack
	if err := packSvc.DeleteExamPack(adminID, teacherPack.ID); err != nil {
		t.Fatalf("expected admin to be able to delete pack, got %v", err)
	}
}

func TestExamRolePermissions(t *testing.T) {
	studentID := 1
	teacherID := 2
	adminID := 4

	uRepo := &mockRoleUserRepo{
		roles: map[int]string{
			studentID: "student",
			teacherID: "teacher",
			adminID:   "admin",
		},
	}

	tPackID := 1
	teacherPack := &exampack.ExamPack{
		ID:        tPackID,
		Title:     "Teacher Pack",
		CreatedBy: &teacherID,
	}

	pRepo := &mockPackRepo{
		packs: map[int]*exampack.ExamPack{
			tPackID: teacherPack,
		},
	}

	examSvc := &ExamService{
		userRepo: uRepo,
		packRepo: pRepo,
	}

	// Student cannot edit exam
	testExam := &exam.Exam{
		ID:         "exam-1",
		ExamPackID: tPackID,
		CreatedBy:  &teacherID,
	}
	if err := examSvc.assertExamEdit(studentID, testExam); err != ErrForbidden {
		t.Fatalf("expected ErrForbidden for student in assertExamEdit, got %v", err)
	}

	// Teacher who created/owns can edit
	if err := examSvc.assertExamEdit(teacherID, testExam); err != nil {
		t.Fatalf("expected teacher owner to edit exam, got %v", err)
	}

	// Admin can edit
	if err := examSvc.assertExamEdit(adminID, testExam); err != nil {
		t.Fatalf("expected admin to edit exam, got %v", err)
	}
}
