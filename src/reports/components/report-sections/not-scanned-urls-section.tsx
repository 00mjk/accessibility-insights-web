// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import { SummaryScanResults } from 'reports/package/accessibilityInsightsReport';
import {
    CollapsibleUrlResultSection,
    CollapsibleUrlResultSectionDeps,
} from 'reports/components/report-sections/collapsible-url-result-section';

export type NotScannedUrlsSectionDeps = CollapsibleUrlResultSectionDeps;

export type NotScannedUrlsSectionProps = {
    deps: NotScannedUrlsSectionDeps;
    results: SummaryScanResults;
};

export const NotScannedUrlsSection = NamedFC<NotScannedUrlsSectionProps>(
    'NotScannedUrlsSection',
    ({ results, deps }) => {
        return (
            <CollapsibleUrlResultSection
                deps={deps}
                title="Not scanned URLs"
                outcomeType="unscannable"
                badgeCount={results.unscannable.length}
                containerId="not-scanned-urls-section"
            />
        );
    },
);
