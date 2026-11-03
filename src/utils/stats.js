/**
 * In-memory stats counters.
 * Resets on process restart — intentional for this demo.
 * Real source of truth is Elasticsearch.
 */
const stats = {
  totalRequests: 0,
  errorCount: 0,
  startTime: Date.now(),
};

const increment = (key) => {
  if (Object.prototype.hasOwnProperty.call(stats, key)) {
    stats[key]++;
  }
};

const getStats = () => ({
  totalRequests: stats.totalRequests,
  errorCount: stats.errorCount,
  uptime: Math.floor((Date.now() - stats.startTime) / 1000),
  startTime: new Date(stats.startTime).toISOString(),
});

module.exports = { increment, getStats };
