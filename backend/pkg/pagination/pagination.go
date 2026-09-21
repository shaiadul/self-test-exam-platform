package pagination

import (
	"math"
	"net/http"
	"strconv"
	"strings"
)

// Params holds parsed query parameters for pagination, searching, and sorting.
type Params struct {
	Page      int    `json:"page"`
	PerPage   int    `json:"per_page"`
	Search    string `json:"search"`
	Category  string `json:"category"`
	SortBy    string `json:"sort_by"`
	SortOrder string `json:"sort_order"`
}

// Offset returns the zero-indexed SQL offset.
func (p Params) Offset() int {
	return (p.Page - 1) * p.PerPage
}

// Meta holds pagination metadata to be returned in API responses.
type Meta struct {
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	CurrentPage int   `json:"current_page"`
	PerPage     int   `json:"per_page"`
}

// Response represents a standard paginated API envelope.
type Response[T any] struct {
	Data []T  `json:"data"`
	Meta Meta `json:"meta"`
}

// Parse extracts and sanitizes pagination parameters from an HTTP request.
func Parse(r *http.Request) Params {
	q := r.URL.Query()

	page := 1
	if p, err := strconv.Atoi(q.Get("page")); err == nil && p > 0 {
		page = p
	}

	perPage := 10
	if l := q.Get("per_page"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			perPage = val
		}
	} else if l := q.Get("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			perPage = val
		}
	}
	if perPage > 100 {
		perPage = 100
	}

	search := strings.TrimSpace(q.Get("search"))
	if search == "" {
		search = strings.TrimSpace(q.Get("q"))
	}

	sortOrder := strings.ToLower(strings.TrimSpace(q.Get("sort_order")))
	if sortOrder != "asc" && sortOrder != "desc" {
		sortOrder = "desc"
	}

	return Params{
		Page:      page,
		PerPage:   perPage,
		Search:    search,
		Category:  strings.TrimSpace(q.Get("category")),
		SortBy:    strings.TrimSpace(q.Get("sort_by")),
		SortOrder: sortOrder,
	}
}

// NewMeta calculates the total pages and builds a Meta object.
func NewMeta(totalItems int64, page, perPage int) Meta {
	totalPages := 0
	if totalItems > 0 && perPage > 0 {
		totalPages = int(math.Ceil(float64(totalItems) / float64(perPage)))
	}
	return Meta{
		TotalItems:  totalItems,
		TotalPages:  totalPages,
		CurrentPage: page,
		PerPage:     perPage,
	}
}

// PaginateSlice takes an in-memory slice and returns a paginated slice along with pagination metadata.
func PaginateSlice[T any](items []T, params Params) Response[T] {
	totalItems := int64(len(items))
	meta := NewMeta(totalItems, params.Page, params.PerPage)

	if totalItems == 0 {
		return Response[T]{
			Data: []T{},
			Meta: meta,
		}
	}

	start := params.Offset()
	if start >= len(items) {
		return Response[T]{
			Data: []T{},
			Meta: meta,
		}
	}

	end := start + params.PerPage
	if end > len(items) {
		end = len(items)
	}

	return Response[T]{
		Data: items[start:end],
		Meta: meta,
	}
}
