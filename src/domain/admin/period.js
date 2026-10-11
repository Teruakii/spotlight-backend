// Reporting windows for the admin dashboard. All bucketing is in UTC so the
// keys line up with what the database groups by.
const PERIODS = {
  "7D": { unit: "day", count: 7 },
  "30D": { unit: "day", count: 30 },
  "12M": { unit: "month", count: 12 },
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");

function bucketKey(date, unit) {
  const ym = `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
  return unit === "month" ? ym : `${ym}-${pad(date.getUTCDate())}`;
}

function bucketLabel(date, unit) {
  return unit === "month"
    ? MONTHS[date.getUTCMonth()]
    : `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`;
}

// { unit, since, buckets: [{ key, label }] } ending with the bucket containing `now`.
function resolvePeriod(period, now) {
  const { unit, count } = PERIODS[period];
  const buckets = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date =
      unit === "month"
        ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    buckets.push({ key: bucketKey(date, unit), label: bucketLabel(date, unit), start: date });
  }
  return { unit, since: buckets[0].start, buckets: buckets.map(({ key, label }) => ({ key, label })) };
}

// Lays counts ({ key -> count }) onto the period's buckets, filling gaps with 0.
function toSeries(buckets, counts) {
  return buckets.map(({ key }) => counts.get(key) ?? 0);
}

module.exports = { PERIODS, resolvePeriod, toSeries, bucketKey };
