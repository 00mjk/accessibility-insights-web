// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';

import { SummaryScanResults } from 'reports/package/accessibilityInsightsReport';
import {
    CollapsibleUrlResultSection,
    CollapsibleUrlResultSectionDeps,
} from 'reports/components/report-sections/collapsible-url-result-section';

export type PassedUrlsSectionDeps = CollapsibleUrlResultSectionDeps;

export type PassedUrlsSectionProps = {
    deps: PassedUrlsSectionDeps;
    results: SummaryScanResults;
};

export const PassedUrlsSection = NamedFC<PassedUrlsSectionProps>(
    'PassedUrlsSection',
    ({ results, deps }) => {
        return (
            <CollapsibleUrlResultSection
                deps={deps}
                title="Passed URLs"
                outcomeType="pass"
                badgeCount={results.passed.length}
                containerId="passed-urls-section"
            />
        );
    },
);
