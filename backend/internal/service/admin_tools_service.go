package service

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/selftest/backend/internal/domain/examrequest"
	"github.com/selftest/backend/internal/domain/system"
	"github.com/selftest/backend/internal/domain/user"
	"github.com/selftest/backend/internal/infrastructure/cache"
)

var (
	ErrAdminRequired = errors.New("admin privileges required")
)

type CacheStatus struct {
	Connected bool   `json:"connected"`
	Provider  string `json:"provider"`
	Status    string `json:"status"`
	Details   string `json:"details"`
}

type RequestCategoryInfo struct {
	Key         string           `json:"key"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Total       int64            `json:"total"`
	Pending     int64            `json:"pending"`
	Approved    int64            `json:"approved"`
	Rejected    int64            `json:"rejected"`
	Breakdown   map[string]int64 `json:"breakdown,omitempty"`
}

type RequestApprovalOverview struct {
	TotalRequests int64                 `json:"totalRequests"`
	TotalPending  int64                 `json:"totalPending"`
	TotalResolved int64                 `json:"totalResolved"`
	Categories    []RequestCategoryInfo `json:"categories"`
}

type ToolsOverviewResponse struct {
	Cache    CacheStatus             `json:"cache"`
	Requests RequestApprovalOverview `json:"requests"`
}

type ClearRequestResult struct {
	Target       string           `json:"target"`
	Scope        string           `json:"scope"`
	TotalDeleted int64            `json:"totalDeleted"`
	Details      map[string]int64 `json:"details"`
	Message      string           `json:"message"`
}

type AdminToolsService struct {
	cacheService cache.CacheService
	requestRepo  examrequest.ExamRequestRepository
	systemRepo   system.SystemRepository
	userRepo     user.UserRepository
}

func NewAdminToolsService(
	cacheService cache.CacheService,
	requestRepo examrequest.ExamRequestRepository,
	systemRepo system.SystemRepository,
	userRepo user.UserRepository,
) *AdminToolsService {
	return &AdminToolsService{
		cacheService: cacheService,
		requestRepo:  requestRepo,
		systemRepo:   systemRepo,
		userRepo:     userRepo,
	}
}

func (s *AdminToolsService) VerifyAdmin(userID int) error {
	role, err := s.userRepo.GetRoleByID(userID)
	if err != nil || strings.ToLower(role) != "admin" {
		return ErrAdminRequired
	}
	return nil
}

func (s *AdminToolsService) GetOverview(ctx context.Context) (*ToolsOverviewResponse, error) {
	// Cache status
	cacheStatus := CacheStatus{
		Connected: false,
		Provider:  "Redis",
		Status:    "Passthrough (No Redis)",
		Details:   "Database caching running in direct-query mode.",
	}

	if s.cacheService != nil && s.cacheService.Client() != nil {
		client := s.cacheService.Client()
		pingErr := client.Ping(ctx).Err()
		if pingErr == nil {
			cacheStatus.Connected = true
			cacheStatus.Status = "Connected (Healthy)"
			cacheStatus.Details = "In-memory cache active for user sessions, exam packs, exams, analytics, and rate-limits."
		} else {
			cacheStatus.Status = "Degraded (Ping failed)"
			cacheStatus.Details = fmt.Sprintf("Redis client configured but ping returned: %v", pingErr)
		}
	}

	// Request approval categories (extensible list)
	categories := []RequestCategoryInfo{}
	var grandTotal int64 = 0
	var grandPending int64 = 0
	var grandResolved int64 = 0

	// 1. Quota & Pack Requests category
	if s.requestRepo != nil {
		quotaStats, err := s.requestRepo.GetStats()
		if err == nil {
			total := quotaStats["total"]
			pending := quotaStats["pending"]
			approved := quotaStats["approved"]
			rejected := quotaStats["rejected"]

			grandTotal += total
			grandPending += pending
			grandResolved += (approved + rejected)

			categories = append(categories, RequestCategoryInfo{
				Key:         "quota",
				Name:        "Teacher Quota Requests",
				Description: "Requests to increase exam creation allowances or allocate new exam packs",
				Total:       total,
				Pending:     pending,
				Approved:    approved,
				Rejected:    rejected,
				Breakdown: map[string]int64{
					"pack":  quotaStats["pack"],
					"limit": quotaStats["limit"],
				},
			})
		}
	}

	// 2. Institution Suggestions category
	if s.systemRepo != nil {
		instStats, err := s.systemRepo.GetInstitutionSuggestionStats()
		if err == nil {
			total := instStats["total"]
			pending := instStats["pending"]
			approved := instStats["approved"]
			rejected := instStats["rejected"]

			grandTotal += total
			grandPending += pending
			grandResolved += (approved + rejected)

			categories = append(categories, RequestCategoryInfo{
				Key:         "institution",
				Name:        "Institution Name Suggestions",
				Description: "User-submitted custom educational institutions waiting for administrative review",
				Total:       total,
				Pending:     pending,
				Approved:    approved,
				Rejected:    rejected,
			})
		}
	}

	overview := &ToolsOverviewResponse{
		Cache: cacheStatus,
		Requests: RequestApprovalOverview{
			TotalRequests: grandTotal,
			TotalPending:  grandPending,
			TotalResolved: grandResolved,
			Categories:    categories,
		},
	}

	return overview, nil
}

func (s *AdminToolsService) ClearCache(ctx context.Context) error {
	if s.cacheService == nil {
		return nil
	}
	return s.cacheService.ClearAll(ctx)
}

func (s *AdminToolsService) ClearRequestApprovalData(ctx context.Context, target string, scope string) (*ClearRequestResult, error) {
	target = strings.ToLower(strings.TrimSpace(target))
	if target == "" {
		target = "quota"
	}

	scope = strings.ToLower(strings.TrimSpace(scope))
	if scope == "" {
		scope = "all"
	}

	details := make(map[string]int64)
	var totalDeleted int64 = 0

	// Handle "quota" or "all"
	if target == "quota" || target == "all" {
		if s.requestRepo != nil {
			deletedQuota, err := s.requestRepo.ClearRequests("all", scope)
			if err != nil {
				return nil, fmt.Errorf("failed to clear quota requests: %w", err)
			}
			details["quota"] = deletedQuota
			totalDeleted += deletedQuota
		}
	}

	// Handle "institution" or "all"
	if target == "institution" || target == "all" {
		if s.systemRepo != nil {
			deletedInst, err := s.systemRepo.ClearInstitutionSuggestions(scope)
			if err != nil {
				return nil, fmt.Errorf("failed to clear institution suggestions: %w", err)
			}
			details["institution"] = deletedInst
			totalDeleted += deletedInst
		}
	}

	// Invalidate any dependent caches
	if s.cacheService != nil {
		_ = s.cacheService.DeleteByPattern(ctx, "reports:stats:*")
		_ = s.cacheService.DeleteByPattern(ctx, "exampack:*")
	}

	msg := fmt.Sprintf("Successfully removed %d request approval record(s) [Target: %s, Scope: %s].", totalDeleted, target, scope)

	return &ClearRequestResult{
		Target:       target,
		Scope:        scope,
		TotalDeleted: totalDeleted,
		Details:      details,
		Message:      msg,
	}, nil
}
