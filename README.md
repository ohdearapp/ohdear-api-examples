# Oh Dear API - Examples

This repository contains examples and quick scripts to help you get started with the Oh Dear API.

## Installation

Install the dependencies:
```bash
git clone https://github.com/ohdearapp/oh-dear-api-examples.git
cd oh-dear-api-examples
cp .env.example .env
npm install
```

Add your Oh Dear API key to the `.env` file.

```bash
OH_DEAR_API_KEY=your-api-key
```

## Usage

A `cache` directory is created at the root of the project and is used to store the results of the API calls. This will help you inspect the responses, avoid making the same requests to the API and speed up the execution of scripts. This directory is ignored by git by default.

This repository is not intended to be a JS SDK, but rather a collection of examples and quick scripts to help you get started with the Oh Dear API, and to help you in your current workflow. You probably already have some scripts/functions being used via an admin panel or one-off commands. This might give you a good start to getting things cleaned up, provide ideas for new automations or just help you understand what you can do with the API (hint: almost everything you can do in the application can be done via the API).

## Examples

You could use the Oh Dear API in deployment scripts to start a named maintenance window in your account to prevent false positive alerts and, at the same time, update the status page with a 'scheduled maintenance' message to keep your customers informed. 

You could also use scripts in GitHub actions workflows to automatically add a new client site to be monitored or to run Lighthouse report if you marketing site has been updated.

Here you will find examples of how to use the Oh Dear API to perform various tasks. It comes with a mini OhDear SDK, and some helper functions but you can copy and paste as you need into your own projects / utilities.

For example, you could create a new site from an existing site as a template:
```js
import { create_site_from_existing } from './examples.js';

create_site_from_existing(17, 5746);
```

Or sync the status pages with the tagged sites. Run this on a schedule to keep the status pages up to date automatically.
```js
import { sync_status_pages_with_tagged_sites } from './examples.js';

sync_status_pages_with_tagged_sites('production');
```

## Custom Monthly Report Snapshots

This examples script will generate a report snapshot for a given site ID at the current time.

```js
import { generateReportSnapshot } from './report.js';

generateReportSnapshot(18373);
```

From here you can use the generated results to create a custom/white labelled PDF, web view, email, etc.

## Oh Dear

You can dive deeper into the Oh Dear API by checking out the [documentation](https://ohdear.app/docs/api) and by signing up for a free account at [ohdear.app](https://ohdear.app/register).
