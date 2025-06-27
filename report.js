import { get, put, post, del, checkTypes } from './ohdear.js';
import { cache, putCache, getCacheKey } from './utils.js';
import { format } from 'date-fns';

function getDateTimeFilterRange() {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    
    return {
        startDate: firstDayOfMonth,
        endDate: new Date(),
    }
}

async function getUptimeResults(siteId, filters) {
    const cacheKey = getCacheKey(siteId, 'uptime');

    const uptime = await cache(cacheKey, get(`sites/${siteId}/uptime`, {
        started_at: format(filters.startDate, 'yyyyMMddHHmmss'),
        ended_at: format(filters.endDate, 'yyyyMMddHHmmss'),
    }, {
        split: 'day'
    }));

    return {uptime, cacheKey};
}

async function getDowntimeResults(siteId, filters) {
    const cacheKey = getCacheKey(siteId, 'downtime');

    const downtime = await cache(cacheKey, get(`sites/${siteId}/downtime`, {
        started_at: format(filters.startDate, 'yyyyMMddHHmmss'),
        ended_at: format(filters.endDate, 'yyyyMMddHHmmss'),
    }));

    return {downtime, cacheKey};
}

async function getPerformanceResults(siteId, filters) {
    const cacheKey = getCacheKey(siteId, 'performance');

    const performance = await cache(cacheKey, get(`sites/${siteId}/performance-records`, {
        start: format(filters.startDate, 'yyyyMMddHHmmss'),
        end: format(filters.endDate, 'yyyyMMddHHmmss'),
        group_by: 'day'
    }));

    return {performance, cacheKey};
}

async function getBrokenLinksResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'broken-links');

    const brokenLinks = await cache(cacheKey, get(`broken-links/${siteId}`));

    return {brokenLinks, cacheKey};
}

async function getMixedContentResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'mixed-content');

    const mixedContent = await cache(cacheKey, get(`mixed-content/${siteId}`));

    return {mixedContent, cacheKey};
}

async function getCronDefinitions(siteId) {
    const cacheKey = getCacheKey(siteId, 'cron-definitions');

    const cronDefinitions = await cache(cacheKey, get(`sites/${siteId}/cron-checks`));

    return {cronDefinitions, cacheKey};
}

async function getCronResults(siteId) {
    //
}

async function getApplicationHealthResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'application-health');

    const applicationHealth = await cache(cacheKey, get(`sites/${siteId}/application-health-checks`));

    return {applicationHealth, cacheKey};
}

async function getApplicationHealthCheckResults(siteId, applicationHealthCheckId) {
    const cacheKey = getCacheKey(siteId, `application-health-check-${applicationHealthCheckId}`);

    const applicationHealthCheck = await cache(cacheKey, get(`sites/${siteId}/application-health-checks/${applicationHealthCheckId}`));

    return {applicationHealthCheck, cacheKey};
}

async function getSitemapResults(siteId) {
    //
}

async function getLighthouseResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'lighthouse');

    const lighthouse = await cache(cacheKey, get(`sites/${siteId}/lighthouse-reports/latest`));

    return {lighthouse, cacheKey};
}

async function getDnsResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'dns');

    const dns = await cache(cacheKey, get(`sites/${siteId}/dns-history-items`));

    return {dns, cacheKey};
}

async function getDomainResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'domain');

    const domain = await cache(cacheKey, get(`sites/${siteId}/domain`));

    return {domain, cacheKey};
}

async function getCertificateHealthResults(siteId) {
    const cacheKey = getCacheKey(siteId, 'certificate-health');

    const certificateHealth = await cache(cacheKey, get(`certificate-health/${siteId}`));

    return {certificateHealth, cacheKey};
}

async function getSite(siteId) {
    const cacheKey = getCacheKey(siteId, 'site');

    const site = await cache(cacheKey, get(`sites/${siteId}`));

    return {site, cacheKey};
}

async function generateReportSnapshot(siteId) {
    const { startDate, endDate } = getDateTimeFilterRange();

    const { site, cacheKey: siteCacheKey } = await getSite(siteId);
    const { uptime, cacheKey: uptimeCacheKey } = await getUptimeResults(siteId, {startDate, endDate});
    const { downtime, cacheKey: downtimeCacheKey } = await getDowntimeResults(siteId, {startDate, endDate});
    const { performance, cacheKey: performanceCacheKey } = await getPerformanceResults(siteId, {startDate, endDate});
    const { brokenLinks, cacheKey: brokenLinksCacheKey } = await getBrokenLinksResults(siteId);
    const { mixedContent, cacheKey: mixedContentCacheKey } = await getMixedContentResults(siteId);
    const { certificateHealth, cacheKey: certificateHealthCacheKey } = await getCertificateHealthResults(siteId);
    const { cronDefinitions, cacheKey: cronDefinitionsCacheKey } = await getCronDefinitions(siteId);
    const { dns, cacheKey: dnsCacheKey } = await getDnsResults(siteId);
    const { applicationHealth, cacheKey: applicationHealthCacheKey } = await getApplicationHealthResults(siteId);
    const { domain, cacheKey: domainCacheKey } = await getDomainResults(siteId);
    const { lighthouse, cacheKey: lighthouseCacheKey } = await getLighthouseResults(siteId);

    const applicationHealthCheckResults = await Promise.all(applicationHealth.data.map(async (applicationHealthCheck) => {
        const { applicationHealthCheck: applicationHealthCheckResult, cacheKey: applicationHealthCheckCacheKey } = await getApplicationHealthCheckResults(siteId, applicationHealthCheck.id);
        
        return applicationHealthCheckResult;
    }));

    const reportCacheKey = getCacheKey(siteId, 'report');

    const report = await putCache(reportCacheKey, {
        site,
        uptime,
        downtime: downtime.data,
        performance: performance.data,
        brokenLinks: brokenLinks.data,
        mixedContent: mixedContent.data,
        certificateHealth: certificateHealth,
        cronDefinitions: cronDefinitions,
        dns: dns.data,
        applicationHealth: applicationHealth,
        applicationHealthCheckResults: applicationHealthCheckResults,
        domain: domain,
        lighthouse: lighthouse
    });

    return report;
}