package persistence

import (
	"context"
	"fmt"
	"time"

	"github.com/selftest/backend/internal/domain/exam"
	"github.com/selftest/backend/internal/infrastructure/cache"
)

type CachedExamRepository struct {
	repo  exam.ExamRepository
	cache cache.CacheService
}

func NewCachedExamRepository(repo exam.ExamRepository, cache cache.CacheService) *CachedExamRepository {
	return &CachedExamRepository{
		repo:  repo,
		cache: cache,
	}
}

func (r *CachedExamRepository) ListExams(filter exam.ExamFilter) ([]exam.Exam, exam.PaginationMeta, error) {
	return r.repo.ListExams(filter)
}

func (r *CachedExamRepository) GetExamsByPackID(packID int) ([]exam.Exam, error) {
	ctx := context.Background()
	key := fmt.Sprintf("exam:pack:%d", packID)

	var exams []exam.Exam
	hit, _ := r.cache.Get(ctx, key, &exams)
	if hit && len(exams) > 0 {
		return exams, nil
	}

	freshExams, err := r.repo.GetExamsByPackID(packID)
	if err != nil {
		return nil, err
	}

	_ = r.cache.Set(ctx, key, freshExams, cache.DefaultExamTTL)
	return freshExams, nil
}

func (r *CachedExamRepository) GetExamByID(id string) (*exam.Exam, error) {
	ctx := context.Background()
	key := fmt.Sprintf("exam:id:%s", id)

	var e exam.Exam
	hit, _ := r.cache.Get(ctx, key, &e)
	if hit && e.ID != "" {
		return &e, nil
	}

	freshExam, err := r.repo.GetExamByID(id)
	if err != nil {
		return nil, err
	}
	if freshExam == nil {
		return nil, nil
	}

	_ = r.cache.Set(ctx, key, freshExam, cache.DefaultExamTTL)
	return freshExam, nil
}

func (r *CachedExamRepository) GetExamsByIDs(ids []string) ([]exam.Exam, error) {
	return r.repo.GetExamsByIDs(ids)
}

func (r *CachedExamRepository) GetUpcomingExamsForUser(userID int, now time.Time) ([]exam.Exam, error) {
	return r.repo.GetUpcomingExamsForUser(userID, now)
}

func (r *CachedExamRepository) invalidateExamAdd(e *exam.Exam) {
	ctx := context.Background()
	_ = r.cache.Delete(ctx,
		fmt.Sprintf("exam:pack:%d", e.ExamPackID),
		fmt.Sprintf("exampack:id:%d", e.ExamPackID),
		"exampack:all",
	)
	_ = r.cache.DeleteByPattern(ctx, "exampack:creator:*")
	_ = r.cache.DeleteByPattern(ctx, "exam:user_upcoming:*")
	_ = r.cache.DeleteByPattern(ctx, "reports:stats:*")
}

func (r *CachedExamRepository) CreateExam(e *exam.Exam) error {
	err := r.repo.CreateExam(e)
	if err == nil {
		r.invalidateExamAdd(e)
	}
	return err
}

func (r *CachedExamRepository) CreateExamWithinLimit(e *exam.Exam, creatorID int, limit int) (bool, error) {
	created, err := r.repo.CreateExamWithinLimit(e, creatorID, limit)
	if err == nil && created {
		r.invalidateExamAdd(e)
	}
	return created, err
}

func (r *CachedExamRepository) CreateExamWithinPackLimit(e *exam.Exam, packID int, limit int) (bool, error) {
	created, err := r.repo.CreateExamWithinPackLimit(e, packID, limit)
	if err == nil && created {
		r.invalidateExamAdd(e)
	}
	return created, err
}

func (r *CachedExamRepository) UpdateExam(e *exam.Exam) error {
	err := r.repo.UpdateExam(e)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx,
			fmt.Sprintf("exam:id:%s", e.ID),
			fmt.Sprintf("exam:pack:%d", e.ExamPackID),
		)
		_ = r.cache.DeleteByPattern(ctx, "exam:user_upcoming:*")
	}
	return err
}

func (r *CachedExamRepository) DeleteExam(id string) error {
	// Look up exam to find its pack ID for clean eviction
	existing, _ := r.GetExamByID(id)

	err := r.repo.DeleteExam(id)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx,
			fmt.Sprintf("exam:id:%s", id),
			fmt.Sprintf("exam:questions:%s", id),
			"exampack:all",
		)
		if existing != nil {
			_ = r.cache.Delete(ctx,
				fmt.Sprintf("exam:pack:%d", existing.ExamPackID),
				fmt.Sprintf("exampack:id:%d", existing.ExamPackID),
			)
		}
		_ = r.cache.DeleteByPattern(ctx, "exampack:creator:*")
		_ = r.cache.DeleteByPattern(ctx, "exam:user_upcoming:*")
		_ = r.cache.DeleteByPattern(ctx, "reports:stats:*")
	}
	return err
}

func (r *CachedExamRepository) CountExamsByCreator(creatorID int) (int, error) {
	return r.repo.CountExamsByCreator(creatorID)
}

func (r *CachedExamRepository) GetQuestionsByExamID(examID string) ([]exam.Question, error) {
	ctx := context.Background()
	key := fmt.Sprintf("exam:questions:%s", examID)

	var qs []exam.Question
	hit, _ := r.cache.Get(ctx, key, &qs)
	if hit && len(qs) > 0 {
		return qs, nil
	}

	freshQs, err := r.repo.GetQuestionsByExamID(examID)
	if err != nil {
		return nil, err
	}

	_ = r.cache.Set(ctx, key, freshQs, cache.DefaultQuestionTTL)
	return freshQs, nil
}

func (r *CachedExamRepository) CountAllQuestions() (int, error) {
	return r.repo.CountAllQuestions()
}

func (r *CachedExamRepository) GetQuestionByID(id int) (*exam.Question, error) {
	ctx := context.Background()
	key := fmt.Sprintf("question:id:%d", id)

	var q exam.Question
	hit, _ := r.cache.Get(ctx, key, &q)
	if hit && q.ID != 0 {
		return &q, nil
	}

	freshQ, err := r.repo.GetQuestionByID(id)
	if err != nil {
		return nil, err
	}
	if freshQ == nil {
		return nil, nil
	}

	_ = r.cache.Set(ctx, key, freshQ, cache.DefaultQuestionTTL)
	return freshQ, nil
}

func (r *CachedExamRepository) CreateQuestion(q *exam.Question) error {
	err := r.repo.CreateQuestion(q)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx,
			fmt.Sprintf("exam:questions:%s", q.ExamID),
			fmt.Sprintf("exam:id:%s", q.ExamID),
		)
		_ = r.cache.DeleteByPattern(ctx, "exam:pack:*")
		_ = r.cache.DeleteByPattern(ctx, "reports:stats:*")
	}
	return err
}

func (r *CachedExamRepository) UpdateQuestion(q *exam.Question) error {
	err := r.repo.UpdateQuestion(q)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx,
			fmt.Sprintf("question:id:%d", q.ID),
			fmt.Sprintf("exam:questions:%s", q.ExamID),
		)
	}
	return err
}

func (r *CachedExamRepository) DeleteQuestion(id int) error {
	existing, _ := r.GetQuestionByID(id)

	err := r.repo.DeleteQuestion(id)
	if err == nil {
		ctx := context.Background()
		_ = r.cache.Delete(ctx, fmt.Sprintf("question:id:%d", id))
		if existing != nil {
			_ = r.cache.Delete(ctx,
				fmt.Sprintf("exam:questions:%s", existing.ExamID),
				fmt.Sprintf("exam:id:%s", existing.ExamID),
			)
		} else {
			_ = r.cache.DeleteByPattern(ctx, "exam:questions:*")
		}
		_ = r.cache.DeleteByPattern(ctx, "exam:pack:*")
		_ = r.cache.DeleteByPattern(ctx, "reports:stats:*")
	}
	return err
}
