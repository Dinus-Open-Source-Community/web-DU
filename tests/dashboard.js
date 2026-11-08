import { sleep } from 'k6';
import {
  loadDocumentAndAssets,
  pickToken,
  runApiRound,
  summarizeConfig,
  thinkTime,
} from './lib/common.js';

const MODE = __ENV.MODE || 'ramp';
const ROLE = __ENV.ROLE || 'admin';
const TOKENS = JSON.parse(open('./tokens.json'));
const ASSETS = JSON.parse(open('./assets.json'));
const STATIC_ENABLED = __ENV.STATIC !== '0' && MODE !== 'api';
const TARGET_VUS = Number(__ENV.TARGET_VUS || 100);
const PRE_VUS = Number(__ENV.PRE_VUS || (MODE === 'ramp' ? 300 : 100));
const MAX_VUS = Number(__ENV.MAX_VUS || (MODE === 'ramp' ? 6000 : 500));
const DURATION = __ENV.DURATION || '60s';
const RATE = Number(__ENV.RATE || (MODE === 'api' ? 20 : TARGET_VUS / 2));
const THINK_SECONDS = Number(__ENV.THINK_SECONDS || 0);

// Rate is iterations/second. With 2s average think time, 50 iter/s ~= 100
// concurrent dashboard users; 5,000 iter/s ~= 10,000. This avoids allocating
// 10,000 heavyweight k6 VUs on the same laptop as the server.
const RAMP_STAGES = [
  { target: 0, duration: '10s' },
  { target: 50, duration: '15s' },
  { target: 50, duration: '90s' },
  { target: 250, duration: '15s' },
  { target: 250, duration: '90s' },
  { target: 500, duration: '15s' },
  { target: 500, duration: '90s' },
  { target: 1250, duration: '15s' },
  { target: 1250, duration: '90s' },
  { target: 2500, duration: '15s' },
  { target: 2500, duration: '90s' },
  { target: 3750, duration: '15s' },
  { target: 3750, duration: '90s' },
  { target: 5000, duration: '15s' },
  { target: 5000, duration: '90s' },
  { target: 0, duration: '60s' },
];

const scenarios = MODE === 'ramp'
  ? {
      dashboard: {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: '1s',
        preAllocatedVUs: PRE_VUS,
        maxVUs: MAX_VUS,
        stages: RAMP_STAGES,
        gracefulStop: '30s',
      },
    }
  : MODE === 'smoke'
    ? {
        smoke: {
          executor: 'per-vu-iterations',
          vus: 1,
          iterations: 1,
          maxDuration: '60s',
        },
      }
    : {
        stage: {
          executor: 'constant-arrival-rate',
          rate: RATE,
          timeUnit: '1s',
          duration: DURATION,
          preAllocatedVUs: PRE_VUS,
          maxVUs: MAX_VUS,
          gracefulStop: '10s',
        },
      };

export const options = {
  discardResponseBodies: true,
  // Each k6 VU represents a separate browser. The default 6-per-host batch
  // limit is global per k6 process and throttles independent users.
  batch: 100000,
  batchPerHost: 100000,
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  scenarios,
  thresholds: MODE === 'ramp'
    ? {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500', 'p(99)<1500'],
        user_data_duration: ['p(95)<500'],
        kpis_duration: ['p(95)<500'],
        analytics_duration: ['p(95)<1500'],
      }
    : {},
};

export function setup() {
  const config = summarizeConfig();
  console.log(`k6 config: ${JSON.stringify(config)}`);
  return { token: pickToken(TOKENS, ROLE) };
}

export default function (data) {
  if (STATIC_ENABLED && __ITER === 0) {
    loadDocumentAndAssets(ASSETS);
  }

  runApiRound(data.token);

  if (MODE !== 'api') {
    // Fixed think time lets an open-model run sustain the target rate with
    // fewer VUs; random 1-3s otherwise needs ~10k VUs at 5k iter/s.
    sleep(THINK_SECONDS > 0 ? THINK_SECONDS : thinkTime());
  }
}
