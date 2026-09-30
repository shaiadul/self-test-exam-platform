package persistence

import (
	"context"
	"strings"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/domain/exampack"
)

type mockCacheService struct {
	store        map[string][]byte
	deletedKeys  []string
	deletedPatt  []string
}

func newMockCacheService() *mockCacheService {
	return &mockCacheService{
		store: make(map[string][]byte),
	}
}

func (m *mockCacheService) Get(ctx context.Context, key string, dest interface{}) (bool, error) {
	_, ok := m.store[key]
	return ok, nil
}

func (m *mockCacheService) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	m.store[key] = []byte("cached")
	return nil
}

func (m *mockCacheService) Delete(ctx context.Context, keys ...string) error {
	for _, k := range keys {
		delete(m.store, k)
		m.deletedKeys = append(m.deletedKeys, k)
	}
	return nil
}

func (m *mockCacheService) DeleteByPattern(ctx context.Context, pattern string) error {
	m.deletedPatt = append(m.deletedPatt, pattern)
	prefix := strings.TrimSuffix(pattern, "*")
	for k := range m.store {
		if strings.HasPrefix(k, prefix) {
			delete(m.store, k)
		}
	}
	return nil
}

func (m *mockCacheService) Client() *redis.Client {
	return nil
}

// Mock base repo for ExamPack
type mockBasePackRepo struct {
	packs       []exampack.ExamPack
	createCalls int
	updateCalls int
	deleteCalls int
}

func (m *mockBasePackRepo) GetExamPacks() ([]exampack.ExamPack, error) {
	return m.packs, nil
}
func (m *mockBasePackRepo) GetExamPacksByCreator(creatorID int) ([]exampack.ExamPack, error) {
	return m.packs, nil
}
func (m *mockBasePackRepo) GetExamPackByID(id int) (*exampack.ExamPack, error) {
	return &exampack.ExamPack{ID: id, Title: "Test Pack"}, nil
}
func (m *mockBasePackRepo) GetExamPacksByIDs(ids []int) (map[int]exampack.ExamPack, error) {
	return nil, nil
}
func (m *mockBasePackRepo) CountExamPacksByCreator(creatorID int) (int, error) {
	return len(m.packs), nil
}
func (m *mockBasePackRepo) CreateExamPack(pack *exampack.ExamPack) error {
	m.createCalls++
	return nil
}
func (m *mockBasePackRepo) CreateExamPackWithinLimit(pack *exampack.ExamPack, creatorID int, limit int) (bool, error) {
	m.createCalls++
	return true, nil
}
func (m *mockBasePackRepo) UpdateExamPack(pack *exampack.ExamPack) error {
	m.updateCalls++
	return nil
}
func (m *mockBasePackRepo) UpdateExamPackLimit(id int, limit int) error {
	m.updateCalls++
	return nil
}
func (m *mockBasePackRepo) DeleteExamPack(id int) error {
	m.deleteCalls++
	return nil
}

func TestCachedExamPackRepository_Invalidations(t *testing.T) {
	mockCache := newMockCacheService()
	baseRepo := &mockBasePackRepo{
		packs: []exampack.ExamPack{{ID: 10, Title: "Initial Pack"}},
	}
	repo := NewCachedExamPackRepository(baseRepo, mockCache)

	// 1. Read to prime cache
	_, err := repo.GetExamPacks()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exampack:all"]; !ok {
		t.Fatalf("expected exampack:all to be cached")
	}

	// 2. Add: CreateExamPack should invalidate exampack:all
	creator := 5
	err = repo.CreateExamPack(&exampack.ExamPack{Title: "New Pack", CreatedBy: &creator})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exampack:all"]; ok {
		t.Fatalf("expected exampack:all to be deleted upon create")
	}

	// 3. Update: UpdateExamPack should invalidate specific ID and exampack:all
	mockCache.store["exampack:id:10"] = []byte("pack10")
	mockCache.store["exampack:all"] = []byte("all")
	err = repo.UpdateExamPack(&exampack.ExamPack{ID: 10, Title: "Updated Pack", CreatedBy: &creator})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exampack:id:10"]; ok {
		t.Fatalf("expected exampack:id:10 to be deleted upon update")
	}

	// 4. Delete: DeleteExamPack should invalidate pack ID, exams of pack, and exampack:all
	mockCache.store["exampack:id:10"] = []byte("pack10")
	mockCache.store["exam:pack:10"] = []byte("exams")
	err = repo.DeleteExamPack(10)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exampack:id:10"]; ok {
		t.Fatalf("expected exampack:id:10 to be deleted upon delete")
	}
	if _, ok := mockCache.store["exam:pack:10"]; ok {
		t.Fatalf("expected exam:pack:10 to be deleted upon pack delete")
	}
}

// Mock base repo for Exam
type mockBaseExamRepo struct {
	exams     map[string]*exam.Exam
	questions map[int]*exam.Question
}

func (m *mockBaseExamRepo) ListExams(filter exam.ExamFilter) ([]exam.Exam, exam.PaginationMeta, error) {
	return nil, exam.PaginationMeta{}, nil
}
func (m *mockBaseExamRepo) GetExamsByPackID(packID int) ([]exam.Exam, error) {
	var list []exam.Exam
	for _, e := range m.exams {
		if e.ExamPackID == packID {
			list = append(list, *e)
		}
	}
	return list, nil
}
func (m *mockBaseExamRepo) GetExamByID(id string) (*exam.Exam, error) {
	return m.exams[id], nil
}
func (m *mockBaseExamRepo) GetExamsByIDs(ids []string) ([]exam.Exam, error) {
	return nil, nil
}
func (m *mockBaseExamRepo) GetUpcomingExamsForUser(userID int, now time.Time) ([]exam.Exam, error) {
	return nil, nil
}
func (m *mockBaseExamRepo) CreateExam(e *exam.Exam) error {
	m.exams[e.ID] = e
	return nil
}
func (m *mockBaseExamRepo) CreateExamWithinLimit(e *exam.Exam, creatorID int, limit int) (bool, error) {
	m.exams[e.ID] = e
	return true, nil
}
func (m *mockBaseExamRepo) CreateExamWithinPackLimit(e *exam.Exam, packID int, limit int) (bool, error) {
	m.exams[e.ID] = e
	return true, nil
}
func (m *mockBaseExamRepo) UpdateExam(e *exam.Exam) error {
	m.exams[e.ID] = e
	return nil
}
func (m *mockBaseExamRepo) DeleteExam(id string) error {
	delete(m.exams, id)
	return nil
}
func (m *mockBaseExamRepo) CountExamsByCreator(creatorID int) (int, error) {
	return 0, nil
}
func (m *mockBaseExamRepo) GetQuestionsByExamID(examID string) ([]exam.Question, error) {
	var list []exam.Question
	for _, q := range m.questions {
		if q.ExamID == examID {
			list = append(list, *q)
		}
	}
	return list, nil
}
func (m *mockBaseExamRepo) CountAllQuestions() (int, error) {
	return len(m.questions), nil
}
func (m *mockBaseExamRepo) GetQuestionByID(id int) (*exam.Question, error) {
	return m.questions[id], nil
}
func (m *mockBaseExamRepo) CreateQuestion(q *exam.Question) error {
	m.questions[q.ID] = q
	return nil
}
func (m *mockBaseExamRepo) UpdateQuestion(q *exam.Question) error {
	m.questions[q.ID] = q
	return nil
}
func (m *mockBaseExamRepo) DeleteQuestion(id int) error {
	delete(m.questions, id)
	return nil
}

func TestCachedExamRepository_Invalidations(t *testing.T) {
	mockCache := newMockCacheService()
	baseRepo := &mockBaseExamRepo{
		exams: map[string]*exam.Exam{
			"exam-1": {ID: "exam-1", ExamPackID: 42, Name: "Exam 1"},
		},
		questions: map[int]*exam.Question{
			100: {ID: 100, ExamID: "exam-1", QuestionText: "What is 2+2?"},
		},
	}
	repo := NewCachedExamRepository(baseRepo, mockCache)

	// 1. Prime cache
	mockCache.store["exam:id:exam-1"] = []byte("exam")
	mockCache.store["exam:pack:42"] = []byte("pack_exams")
	mockCache.store["exam:questions:exam-1"] = []byte("questions")
	mockCache.store["question:id:100"] = []byte("q100")

	// 2. Add question should invalidate exam:questions:exam-1 and exam:id:exam-1
	err := repo.CreateQuestion(&exam.Question{ID: 101, ExamID: "exam-1", QuestionText: "New Q"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exam:questions:exam-1"]; ok {
		t.Fatalf("expected exam:questions:exam-1 to be deleted on question create")
	}
	if _, ok := mockCache.store["exam:id:exam-1"]; ok {
		t.Fatalf("expected exam:id:exam-1 to be deleted on question create")
	}

	// 3. Update question should invalidate question:id:100
	mockCache.store["question:id:100"] = []byte("q100")
	mockCache.store["exam:questions:exam-1"] = []byte("questions")
	err = repo.UpdateQuestion(&exam.Question{ID: 100, ExamID: "exam-1", QuestionText: "Updated Q"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["question:id:100"]; ok {
		t.Fatalf("expected question:id:100 to be deleted on question update")
	}

	// 4. Delete exam should invalidate exam:id:exam-1 and exam:pack:42
	mockCache.store["exam:id:exam-1"] = []byte("exam")
	mockCache.store["exam:pack:42"] = []byte("pack_exams")
	err = repo.DeleteExam("exam-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if _, ok := mockCache.store["exam:id:exam-1"]; ok {
		t.Fatalf("expected exam:id:exam-1 to be deleted on exam delete")
	}
	if _, ok := mockCache.store["exam:pack:42"]; ok {
		t.Fatalf("expected exam:pack:42 to be deleted on exam delete")
	}
}
