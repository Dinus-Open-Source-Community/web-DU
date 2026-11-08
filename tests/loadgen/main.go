package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"math"
	"net/http"
	"os"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

type tokenFile struct {
	Admin struct {
		Token string `json:"token"`
	} `json:"admin"`
	Superadmin struct {
		Token string `json:"token"`
	} `json:"superadmin"`
}

type result struct {
	Workers        int              `json:"workers"`
	ThinkSeconds   float64          `json:"think_seconds"`
	Duration       string           `json:"duration"`
	Elapsed        string           `json:"elapsed"`
	Cycles         int64            `json:"cycles"`
	CyclesPerSec   float64          `json:"cycles_per_sec"`
	Requests       int64            `json:"requests"`
	RequestsPerSec float64          `json:"requests_per_sec"`
	Errors         int64            `json:"errors"`
	Status         map[string]int64 `json:"status"`
	Endpoints      map[string]stats `json:"endpoints"`
}

type stats struct {
	Count int     `json:"count"`
	P50MS float64 `json:"p50_ms"`
	P95MS float64 `json:"p95_ms"`
	P99MS float64 `json:"p99_ms"`
	MaxMS float64 `json:"max_ms"`
}

type workerSamples struct {
	mu    sync.Mutex
	byURL map[string][]time.Duration
}

var paths = []string{
	"/user/data",
	"/admin/dashboard/kpis",
	"/admin/dashboard/analytics?days=30",
}

func main() {
	base := flag.String("base", "http://localhost:8081", "backend base URL")
	tokenPath := flag.String("token-file", "../tokens.json", "token JSON file")
	workers := flag.Int("workers", 100, "closed-model workers (concurrent users)")
	think := flag.Duration("think", time.Second, "think time after each cycle")
	duration := flag.Duration("duration", 30*time.Second, "measurement duration")
	outPath := flag.String("out", "", "optional JSON result path")
	flag.Parse()

	tokens := readTokens(*tokenPath)
	if tokens == "" {
		fmt.Fprintln(os.Stderr, "empty token; run tests/scripts/gen_tokens.sh")
		os.Exit(1)
	}

	client := &http.Client{
		Timeout: 30 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        *workers*3 + 100,
			MaxIdleConnsPerHost: *workers*3 + 100,
			MaxConnsPerHost:     0,
			IdleConnTimeout:     90 * time.Second,
			DisableCompression:  true,
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), *duration)
	defer cancel()

	samples := &workerSamples{byURL: map[string][]time.Duration{}}
	var cycles, errors int64
	var statusMu sync.Mutex
	statuses := map[string]int64{}
	start := time.Now()

	var wg sync.WaitGroup
	for i := 0; i < *workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			local := map[string][]time.Duration{}
			for ctx.Err() == nil {
				cycleStart := time.Now()
				var requests sync.WaitGroup
				for _, path := range paths {
					requests.Add(1)
					go func(path string) {
						defer requests.Done()
						url := strings.TrimRight(*base, "/") + path
						req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
						if err != nil {
							atomic.AddInt64(&errors, 1)
							return
						}
						req.Header.Set("Authorization", "Bearer "+tokens)
						begin := time.Now()
						resp, err := client.Do(req)
						elapsed := time.Since(begin)
						if err != nil {
							atomic.AddInt64(&errors, 1)
							return
						}
						_, _ = io.Copy(io.Discard, resp.Body)
						_ = resp.Body.Close()
						if resp.StatusCode != http.StatusOK {
							atomic.AddInt64(&errors, 1)
						}
						statusMu.Lock()
						statuses[fmt.Sprintf("%d %s", resp.StatusCode, path)]++
						statusMu.Unlock()
						local[path] = append(local[path], elapsed)
					}(path)
				}
				requests.Wait()
				atomic.AddInt64(&cycles, 1)

				if remaining := *think - time.Since(cycleStart); remaining > 0 {
					timer := time.NewTimer(remaining)
					select {
					case <-ctx.Done():
						timer.Stop()
					case <-timer.C:
					}
				}
			}

			samples.mu.Lock()
			for path, values := range local {
				samples.byURL[path] = append(samples.byURL[path], values...)
			}
			samples.mu.Unlock()
		}()
	}
	wg.Wait()

	elapsed := time.Since(start)
	reqCount := atomic.LoadInt64(&cycles) * int64(len(paths))
	res := result{
		Workers:        *workers,
		ThinkSeconds:   think.Seconds(),
		Duration:       duration.String(),
		Elapsed:        elapsed.Round(time.Millisecond).String(),
		Cycles:         atomic.LoadInt64(&cycles),
		CyclesPerSec:   float64(atomic.LoadInt64(&cycles)) / elapsed.Seconds(),
		Requests:       reqCount,
		RequestsPerSec: float64(reqCount) / elapsed.Seconds(),
		Errors:         atomic.LoadInt64(&errors),
		Status:         statuses,
		Endpoints:      map[string]stats{},
	}
	for path, values := range samples.byURL {
		res.Endpoints[path] = summarize(values)
	}

	encoded, _ := json.MarshalIndent(res, "", "  ")
	fmt.Println(string(encoded))
	if *outPath != "" {
		if err := os.WriteFile(*outPath, append(encoded, '\n'), 0o644); err != nil {
			fmt.Fprintf(os.Stderr, "write result: %v\n", err)
			os.Exit(1)
		}
	}
}

func readTokens(path string) string {
	raw, err := os.ReadFile(path)
	if err != nil {
		fmt.Fprintf(os.Stderr, "read tokens: %v\n", err)
		os.Exit(1)
	}
	var parsed tokenFile
	if err := json.Unmarshal(raw, &parsed); err != nil {
		fmt.Fprintf(os.Stderr, "parse tokens: %v\n", err)
		os.Exit(1)
	}
	return parsed.Admin.Token
}

func summarize(values []time.Duration) stats {
	sort.Slice(values, func(i, j int) bool { return values[i] < values[j] })
	ms := func(d time.Duration) float64 { return float64(d.Microseconds()) / 1000.0 }
	return stats{
		Count: len(values),
		P50MS: ms(percentile(values, 50)),
		P95MS: ms(percentile(values, 95)),
		P99MS: ms(percentile(values, 99)),
		MaxMS: ms(values[len(values)-1]),
	}
}

func percentile(sorted []time.Duration, p float64) time.Duration {
	if len(sorted) == 0 {
		return 0
	}
	index := int(math.Ceil(p/100*float64(len(sorted)))) - 1
	if index < 0 {
		index = 0
	}
	if index >= len(sorted) {
		index = len(sorted) - 1
	}
	return sorted[index]
}
