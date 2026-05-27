package service

import (
	"encoding/json"
	"errors"
	"strings"
)

type richTextEnvelope struct {
	Version     int    `json:"version"`
	ContentType string `json:"contentType"`
	ContentHTML string `json:"contentHtml"`
}

func normalizeRichTextPayload(value interface{}) (json.RawMessage, error) {
	if value == nil {
		return nil, nil
	}

	switch v := value.(type) {
	case json.RawMessage:
		return normalizeRichTextBytes([]byte(v))
	case []byte:
		return normalizeRichTextBytes(v)
	case string:
		return normalizeRichTextString(v)
	default:
		b, err := json.Marshal(v)
		if err != nil {
			return nil, err
		}
		return normalizeRichTextBytes(b)
	}
}

func normalizeRichTextString(raw string) (json.RawMessage, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return nil, errors.New("contentHtml is required")
	}
	if json.Valid([]byte(trimmed)) {
		return normalizeRichTextBytes([]byte(trimmed))
	}
	return buildRichTextEnvelope(trimmed)
}

func normalizeRichTextBytes(raw []byte) (json.RawMessage, error) {
	trimmed := strings.TrimSpace(string(raw))
	if trimmed == "" {
		return nil, errors.New("contentHtml is required")
	}

	if !json.Valid([]byte(trimmed)) {
		return buildRichTextEnvelope(trimmed)
	}

	var obj map[string]interface{}
	if err := json.Unmarshal([]byte(trimmed), &obj); err == nil {
		contentHTML, ok := extractContentHTML(obj)
		if !ok {
			var asString string
			if err := json.Unmarshal([]byte(trimmed), &asString); err == nil {
				return buildRichTextEnvelope(asString)
			}
			return nil, errors.New("contentHtml is required")
		}
		version := extractVersion(obj)
		contentType := extractContentType(obj)
		return buildRichTextEnvelopeWithMeta(contentHTML, version, contentType)
	}

	var asString string
	if err := json.Unmarshal([]byte(trimmed), &asString); err == nil {
		return buildRichTextEnvelope(asString)
	}

	return nil, errors.New("invalid rich text payload")
}

func extractContentHTML(obj map[string]interface{}) (string, bool) {
	if v, ok := obj["contentHtml"]; ok {
		if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
			return s, true
		}
	}
	if v, ok := obj["content_html"]; ok {
		if s, ok := v.(string); ok && strings.TrimSpace(s) != "" {
			return s, true
		}
	}
	return "", false
}

func extractVersion(obj map[string]interface{}) int {
	if v, ok := obj["version"]; ok {
		switch n := v.(type) {
		case float64:
			if n > 0 {
				return int(n)
			}
		case int:
			if n > 0 {
				return n
			}
		case int64:
			if n > 0 {
				return int(n)
			}
		case string:
			n = strings.TrimSpace(n)
			if n != "" {
				if parsed, err := json.Number(n).Int64(); err == nil && parsed > 0 {
					return int(parsed)
				}
			}
		}
	}
	return 2
}

func extractContentType(obj map[string]interface{}) string {
	if v, ok := obj["contentType"]; ok {
		if s, ok := v.(string); ok {
			return strings.TrimSpace(s)
		}
	}
	if v, ok := obj["content_type"]; ok {
		if s, ok := v.(string); ok {
			return strings.TrimSpace(s)
		}
	}
	return "tiptap"
}

func buildRichTextEnvelope(html string) (json.RawMessage, error) {
	return buildRichTextEnvelopeWithMeta(html, 2, "tiptap")
}

func buildRichTextEnvelopeWithMeta(html string, version int, contentType string) (json.RawMessage, error) {
	if strings.TrimSpace(html) == "" {
		return nil, errors.New("contentHtml is required")
	}
	if version <= 0 {
		version = 2
	}
	contentType = strings.TrimSpace(contentType)
	if contentType == "" {
		contentType = "tiptap"
	}

	payload := richTextEnvelope{
		Version:     version,
		ContentType: contentType,
		ContentHTML: html,
	}
	b, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return json.RawMessage(b), nil
}
