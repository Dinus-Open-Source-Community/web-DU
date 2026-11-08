import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const CHECKS_ENABLED = __ENV.CHECKS !== '0';

export const BASE_URL = (__ENV.BASE_URL || 'http://localhost:8081').replace(/\/+$/, '');
export const WEB_URL = (__ENV.WEB_URL || 'http://localhost:4173').replace(/\/+$/, '');

export const userDataTrend = new Trend('user_data_duration', true);
export const kpisTrend = new Trend('kpis_duration', true);
export const analyticsTrend = new Trend('analytics_duration', true);
export const documentTrend = new Trend('document_duration', true);
export const staticTrend = new Trend('static_asset_duration', true);

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function record(trend, response, name) {
  trend.add(response.timings.duration);
  if (CHECKS_ENABLED) {
    check(response, {
      [`${name} status 200`]: (r) => r.status === 200,
    });
  }
}

export function runApiRound(token) {
  const headers = authHeaders(token);
  const responses = http.batch([
    {
      method: 'GET',
      url: `${BASE_URL}/user/data`,
      params: { headers, tags: { endpoint: 'user_data' } },
    },
    {
      method: 'GET',
      url: `${BASE_URL}/admin/dashboard/kpis`,
      params: { headers, tags: { endpoint: 'kpis' } },
    },
    {
      method: 'GET',
      url: `${BASE_URL}/admin/dashboard/analytics?days=30`,
      params: { headers, tags: { endpoint: 'analytics' } },
    },
  ]);

  record(userDataTrend, responses[0], 'user/data');
  record(kpisTrend, responses[1], 'admin/dashboard/kpis');
  record(analyticsTrend, responses[2], 'admin/dashboard/analytics');
}

export function loadDocumentAndAssets(assets) {
  const document = http.get(`${WEB_URL}/dashboard`, {
    tags: { endpoint: 'document' },
  });
  record(documentTrend, document, 'dashboard document');

  for (const path of assets) {
    const response = http.get(`${WEB_URL}${path}`, {
      tags: { endpoint: 'static' },
    });
    record(staticTrend, response, `static ${path}`);
  }
}

export function thinkTime() {
  // Random 1-3 seconds, as requested for realistic user pacing.
  return 1 + Math.random() * 2;
}

export function pickToken(tokens, role) {
  const entry = tokens[role];
  if (!entry?.token) {
    throw new Error(`missing token for role ${role}; run tests/scripts/gen_tokens.sh`);
  }
  return entry.token;
}

export function summarizeConfig() {
  return {
    baseUrl: BASE_URL,
    webUrl: WEB_URL,
    mode: __ENV.MODE || 'ramp',
    role: __ENV.ROLE || 'admin',
    datasetRows: __ENV.DATASET_ROWS || 'unknown',
  };
}
