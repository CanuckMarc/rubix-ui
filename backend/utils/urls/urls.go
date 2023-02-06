package urls

import "strings"

func AttachQueryParams(baseURL string, queryParams string) string {
	if queryParams == "" {
		return baseURL
	}
	sep := "?"
	if strings.Contains(baseURL, "?") {
		sep = "&"
	}
	return baseURL + sep + queryParams
}
