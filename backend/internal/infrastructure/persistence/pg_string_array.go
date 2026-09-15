package persistence

import (
	"context"
	"fmt"
	"reflect"

	"github.com/lib/pq"
	"gorm.io/gorm/schema"
)

// pgStringArraySerializer lets a plain []string domain field map to a
// PostgreSQL text[] column. Without it GORM treats the slice as a composite
// value and expands it into a record, e.g. ($1,$2,$3).
type pgStringArraySerializer struct{}

func init() {
	schema.RegisterSerializer("pg_string_array", pgStringArraySerializer{})
}

func (pgStringArraySerializer) Scan(ctx context.Context, field *schema.Field, dst reflect.Value, dbValue interface{}) error {
	if dbValue == nil {
		field.Set(ctx, dst, []string{})
		return nil
	}

	switch v := dbValue.(type) {
	case []string:
		field.Set(ctx, dst, v)
		return nil
	case string:
		var arr pq.StringArray
		if err := arr.Scan(v); err != nil {
			return err
		}
		field.Set(ctx, dst, []string(arr))
		return nil
	case []byte:
		var arr pq.StringArray
		if err := arr.Scan(v); err != nil {
			return err
		}
		field.Set(ctx, dst, []string(arr))
		return nil
	default:
		return fmt.Errorf("pg_string_array: unsupported database type %T", dbValue)
	}
}

func (pgStringArraySerializer) Value(ctx context.Context, field *schema.Field, dst reflect.Value, fieldValue interface{}) (interface{}, error) {
	if fieldValue == nil {
		return nil, nil
	}

	if v, ok := fieldValue.([]string); ok {
		return v, nil
	}

	rv := reflect.ValueOf(fieldValue)
	if rv.Kind() == reflect.Slice {
		out := make([]string, rv.Len())
		for i := 0; i < rv.Len(); i++ {
			out[i] = fmt.Sprint(rv.Index(i).Interface())
		}
		return out, nil
	}

	return fieldValue, nil
}
