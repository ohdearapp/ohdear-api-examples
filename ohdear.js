import 'dotenv/config';

const url = process.env.OHDEAR_API_URL ?? 'https://ohdear.app/api/';

const headers = {
    'Authorization': `Bearer ${process.env.OHDEAR_API_KEY}`,
    'Content-Type': 'application/json'
}

const template = {
    "checks": [
      "uptime",
      "performance",
      "broken_links",
      "mixed_content",
      "lighthouse",
      "cron",
      "application_health",
      "sitemap",
      "dns",
      "domain",
      "certificate_health",
      "certificate_transparency"
    ],
    "uptime_check_location": "london",
    "uptime_check_failed_notification_threshold": 2,
    "uptime_check_http_verb": "get",
    "uptime_check_timeout": 5,
    "uptime_check_max_redirect_count": 5,
    "uptime_check_payload": [],
    "uptime_check_valid_status_codes": ["2*"],
    "uptime_check_look_for_string": null,
    "uptime_check_absent_string": null,
    "uptime_check_expected_response_headers": [
        {
          "name": "my-response-header", 
          "condition": "equals", 
          "value": "my-response-value"
          }
    ],
    "http_client_headers": [
        {
          "name": "my-header",
          "value": "my-value"
        }
    ],
    "performance_threshold_in_ms": 3500,
    "performance_change_percentage": 50,
    "crawler_headers": [
        {
          "name": "my-broken-links-header",
          "value": "my-broken-links-value"
        }
    ],
    "broken_links_check_include_external_links": false,
    "broken_link_types": ["link", "image", "script", "stylesheet", "og:image"],
    "broken_links_whitelisted_urls": [],
    "respect_robots": true,
    "sitemap_path": "/sitemap.xml",
    "sitemap_speed": "slow",
    "application_health_check_result_url": "https://mybrandnewsite.tld/health",
    "application_health_headers": [
        {"name": "my-header", "value": "my-value"}
    ],
    "certificate_health_check_expires_soon_threshold_in_days": 14,
    "dns_check_nameservers_in_sync": true,
    "dns_monitor_main_domain": false,
    "dns_extra_cnames": ["cname1", "cname2"],
    "dns_ignored_record_types": ["A", "CNAME"],
    "domain_check_expires_soon_threshold_in_days": 30,
    "lighthouse_check_continent": "europe",
    "lighthouse_cpu_slowdown_modifier": 0
}

const checkTypes = {
    uptime: "uptime",
    performance: "performance",
    brokenLinks: "broken_links",
    mixedContent: "mixed_content",
    lighthouse: "lighthouse",
    cron: "cron",
    applicationHealth: "application_health",
    sitemap: "sitemap",
    dns: "dns",
    domain: "domain",
    certificateHealth: "certificate_health",
    certificateTransparency: "certificate_transparency"
};

const linkTypes = {
    link: "link",
    image: "image",
    script: "script",
    stylesheet: "stylesheet",
    ogImage: "og:image"
}

const checkResults = {
    pending: "pending",
    succeeded: "succeeded",
    warning: "warning",
    failed: "failed",
    erroredOrTimedOut: "errored-or-timed-out"
}

const summarizedCheckResults = {
    succeeded: "succeeded",
    warning: "warning",
    failed: "failed"
}

const crawlerSpeed = {
    slowest: "slowest",
    slow: "slow",
    default: "default",
    fast: "fast",
    fastest: "fastest"
}

const lighthouseSpeedModifier = {
    slowest: 5,
    slow: 4,
    default: 3,
    fast: 2,
    fastest: 1,
    none: 0
}

const lighthouseContinent = {
    europe: "europe",
    northAmerica: "north-america",
    asia: "asia"
}

const responseHeaderConditions = {
    contains: "contains",
    notContains: "not-contains",
    equals: "equals",
    matchesPattern: "matches-pattern"
}

const uptimeCheckLocations = {
    africa: {
        capeTown: "cape-town"
    },

    asia: {
        bangalore: "bangalore",
        seoul: "seoul",
        singapore: "singapore",
        tokyo: "tokyo"
    },
    australia: {
        sydney: "sydney"
    },

    canada: {
        toronto: "toronto"
    },

    europe: {
        frankfurt: "frankfurt",
        london: "london",
        paris: "paris"
    },

    middleEast: {
        bahrain: "bahrain"
    },

    southAmerica: {
        saoPaulo: "sao-paulo"
    },

    us: {
        newYork: "new-york",
        dallas: "dallas",
        losAngeles: "los-angeles",
        sanFrancisco: "san-francisco"
    }
}

const dnsRecordTypes = {
    A: "A",
    AAAA: "AAAA",
    CAA: "CAA",
    CNAME: "CNAME",
    MX: "MX",
    NS: "NS",
    SOA: "SOA",
    SRV: "SRV",
    TXT: "TXT",
    PTR: "PTR"
}

const getBaseUrl = (endpoint = null) => {
    const baseUrl = url.endsWith('/') ? url : url + '/';

    return baseUrl + (endpoint ?? '');
}

const ohDearApi = (endpoint, filters = {}, params = {}) => {
    const url = new URL(getBaseUrl(endpoint));

    url.search = buildQueryString(filters, params);

    return url;
}

const buildQueryString = (filters, params) => {
    return Object.entries(filters)
        .map(([key, val]) => `filter[${key}]=${encodeURIComponent(val)}`)
        .concat(Object.entries(params)
            .map(([key, val]) => `${key}=${encodeURIComponent(val)}`)
        )
        .join('&');
}

const get = async (endpoint, filters, params) => {
    return await fetch(ohDearApi(endpoint, filters, params).toString(), {
        headers
    });
}

const post = async (endpoint, data) => {
    return await fetch(ohDearApi(endpoint).toString(), {
        headers,
        method: 'POST',
        body: JSON.stringify(data)
    });
}

const put = async (endpoint, data) => {
    return await fetch(ohDearApi(endpoint).toString(), {
        headers,
        method: 'PUT',
        body: JSON.stringify(data)
    });
}

const del = async (endpoint) => {
    return await fetch(ohDearApi(endpoint).toString(), {
        headers,
        method: 'DELETE'
    });
}

export {
    ohDearApi,
    get,
    post,
    put,
    del,
    template,
    checkTypes,
    linkTypes,
    checkResults,
    summarizedCheckResults,
    crawlerSpeed,
    lighthouseSpeedModifier,
    lighthouseContinent,
    responseHeaderConditions,
    uptimeCheckLocations,
    dnsRecordTypes
};
