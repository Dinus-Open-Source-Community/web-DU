package cache

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"net/url"
	"sort"
	"strings"
)

const keyPrefix = "dkelas:"

func HashKey(value any) string {
	data, _ := json.Marshal(value)
	sum := sha256.Sum256(data)
	return hex.EncodeToString(sum[:])
}

func physicalKey(namespace, suffix, version string) string {
	return keyPrefix + namespace + ":v" + version + ":" + suffix
}

func versionKey(namespace string) string {
	return keyPrefix + "version:" + namespace
}

func RequestSuffix(path string, query url.Values) string {
	normalized := make(url.Values, len(query))
	for key, values := range query {
		trimmed := make([]string, len(values))
		for i, value := range values {
			trimmed[i] = strings.TrimSpace(value)
		}
		normalized[key] = trimmed
	}
	keys := make([]string, 0, len(normalized))
	for key := range normalized {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	canonical := make(url.Values, len(keys))
	for _, key := range keys {
		canonical[key] = normalized[key]
	}
	return HashKey(path + "?" + canonical.Encode())
}
