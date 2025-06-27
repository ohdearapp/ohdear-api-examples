# Oh Dear API - Examples

This repository contains examples and quick scripts to help you get started with the Oh Dear API.

## Usage

Install the dependencies:
```bash
npm install
```

## Examples

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