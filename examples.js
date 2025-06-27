import 'dotenv/config';

import { get, put, post, del, checkTypes } from './ohdear.js';
import { matches, cache, getCacheKey } from './utils.js';

/**
 * This function will create new sites in Oh Dear if they don't already exist.
 */
async function create_sites() {
    const teamId = 5;

    const response = await get('sites', {
        "team_id": teamId
    });

    const existingSites = await response.json();

    const sites = [
        {
            "url": "https://example.com?test=1",
            "label": "Example 1",
            "tags": ["example", "env:production"], 
            "checks": [checkTypes.uptime, checkTypes.certificateHealth] 
        },
        {
            "url": "https://example.com?test=2",
            "label": "Example 2",
            "tags": ["example", "env:staging"],
            "checks": [checkTypes.uptime, checkTypes.certificateHealth]
        },
        {
            "url": "https://example.com?test=3",
            "label": "Example 3",
            "tags": ["example", "env:development"],
            "checks": [checkTypes.certificateHealth]
        }
    ].map(site => ({
        ...site,
        "team_id": teamId
    }))
    .filter(site => {
        return ! existingSites.data.find(s => s.url === site.url);
    });

    for (const site of sites) {
        const response = await post('sites', site);
        console.log(response.status);
    }

}

/**
 * This script will create a new site from a template site by ID
 */
async function create_site_from_existing(templateSiteId, teamId = null) {
    const response = await get('sites/' + templateSiteId);

    const templateSite = await response.json();

    const keysToRemove = [
        'id', 'team_id', 'url', 'label', 'checks',
    ];

    const rawData = Object.fromEntries(
        Object.entries(templateSite).filter(([key]) => !keysToRemove.includes(key))
    );

    const templateCheckTypes = templateSite.checks.filter(check => check.enabled).map(check => check.type);

    const checkSettings = templateSite.checks.map(check => check.settings).reduce((acc, obj) => ({ ...acc, ...obj }), {});

    const data = {
        "url": "https://example.com/from-template",
        "team_id": teamId || templateSite.team_id,
        ...rawData,
        ...checkSettings,
        checks: templateCheckTypes
    }

    const created = await post('sites', data)

    console.log(data);
    console.log(created.status, await created.json());
}

/**
 * This script will enable the certificate_health check for all sites containing the tag 'production'.
 */
async function enable_certificate_health_check() {
    const response = await get('sites', {
        "tag": "production"
    });

    const sites = await response.json();

    for (const site of sites.data) {

        const update = await put('sites/' + site.id, {
            "checks": site.checks
                .filter(check => check.enabled)
                .map(check => check.type)
                .concat([
                    checkTypes.certificateHealth
                ]),
            "certificate_health_check_expires_soon_threshold_in_days": 10,
        });

        console.log(update.status);
    }
}

/**
 * This script will update the tags for all sites containing the tag 'production'.
 */
async function update_site_tags() {
    const sites = await (await get('sites', { "tag": "production" })).json();

    for (const site of sites.data) {
        const update = await put('sites/' + site.id, {
            "tags": ["production", "example"]
        });
    }
}

/**
 * This script will sync the status page sites with the tagged sites.
 */
async function sync_status_pages_with_tagged_sites(tag) {
    const statusPages = await (await get('status-pages', {
        "domain": "status.example.com"
    })).json();

    const statusPage = statusPages.data[0];

    const sites = await (await get('sites', {
        "tag": tag
    })).json();

    const sitesToSync = sites.data.map(site => ({
        "id": site.id,
        "clickable": true
    }));

    const response = await post(`status-pages/${statusPage.id}/sites`, {
        "sync": true,
        "sites": sitesToSync
    })

    console.log({
        status: response.status,
        count: sitesToSync.length,
        synced: sites.data.map(site => site.url)
    });
}

/*
 * This script will migrate to tag notifications and remove site all and team notifications
 */
async function migrate_to_tag_notifications() {

    const teamId = 5;

    const tagNotifications = [
        {
            "tagIds": [51, 23],
            "label": "Email dev team",
            "channel": "mail",
            "destination": {
                "mail": "developers@example.com"
            },
        },
        {
            "tagIds": [51],
            "label": "Webhook handler",
            "channel": "webhook",
            "destination": {
                "url": "https://eoxub5g04jwdou2.m.pipedream.net"
            },
        }
    ].flatMap(notification => {
        const { tagIds, ...restOfNotification } = notification;
        return tagIds.map(tagId => ({
            ...restOfNotification,
            tagId: tagId
        }));
    });

    // check if tags exist for teamId otherwise exit
    const tags = await (await get('tags')).json();

    if (tags.data.length === 0) {
        console.log('No tags found for teamId', teamId);
        return;
    }
    const existingTagNotifications = await (await get('tags/notification-destinations')).json();

    // check if tagNotification already exists for the team_id, channel, destination and tagId
    const newTagNotifications = tagNotifications.filter(notification => {
        return !existingTagNotifications.data.find(existingNotification => {
            return existingNotification.tag.team_id === teamId 
                && existingNotification.tag.id === notification.tagId
                && existingNotification.channel === notification.channel 
                && matches(existingNotification.destination, notification.destination)
        });
    });

    const createdNotifications = []

    newTagNotifications.forEach(async (notification) => {
        const {tagId, ...notificationData} = notification;

        const response = await post(`tags/${tagId}/notification-destinations`, notificationData);

        createdNotifications.push({
            task: 'Creating tag notification',
            label: notificationData.label,
            tagIds: tagId,
            status: response.status,
            message: await response.json()
        })
    })

    if(createdNotifications.some(notification => notification.status !== 200)) {
        console.log('Failed to create tag notifications');
        console.log({ createdNotifications });

        return;
    }

    const sitesResponse = await get(`sites`, {
        team_id: teamId
    });

    const sites = await sitesResponse.json();

    for (const site of sites.data) {
        const siteNotificationsDestinationsResponse = await get(`sites/${site.id}/notification-destinations`);

        const siteNotificationsDestinations = await siteNotificationsDestinationsResponse.json();

        for (const notification of siteNotificationsDestinations.data) {
            const response = await del(`sites/${site.id}/notification-destinations/${notification.id}`);

            console.log({
                task: 'Deleting site notification',
                siteId: site.id,
                status: response.status,
            });
        }
    }
}

/**
 * Trigger a new run on demand
 */
async function run(siteId, checkType)
{

    const site = await cache(getCacheKey(siteId, 'site'), get(`sites/${siteId}`));

    const check = site.checks.filter(check => check.type === checkType).pop();

    if(!check) {
        console.log('Check not found');

        return;
    }

    const runResponse = await post(`checks/${check.id}/request-run`);

    const run = await runResponse.json();

    console.log({runResponse, run});
}

/**
 * This script use a notification template (in another team you have access to)
 * and create a new notification for the given team (you also have access to)
 */
async function create_slack_template_notification() {
    const teamId = 5746;

    const notificationsResponse = await fetch('https://ohdear.app/api/team-notification-destinations', {
        headers: {
            'Authorization': `Bearer ${process.env.OHDEAR_API_KEY}`,
            'Content-Type': 'application/json'
        },
        method: 'GET'
    });
    
    const slackTemplateNotification = (await notificationsResponse.json())
        .data
        .find(notification => notification.label === 'slack-template')
    
    const response = await fetch(`https://ohdear.app/api/team-notification-destinations/${teamId}`, {
        headers: {
            'Authorization': `Bearer ${process.env.OHDEAR_API_KEY}`,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            "channel": slackTemplateNotification.channel,
            "destination": slackTemplateNotification.destination
        })
    });
    
    console.log(response.status);
    console.log(await response.json());
}


