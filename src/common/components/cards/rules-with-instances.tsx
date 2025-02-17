// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { FixInstructionProcessor } from 'common/components/fix-instruction-processor';
import { CardSelectionMessageCreator } from 'common/message-creators/card-selection-message-creator';
import { NamedFC } from 'common/react/named-fc';
import * as React from 'react';
import { OutcomeCounter } from 'reports/components/outcome-counter';
import { TargetAppData } from '../../../common/types/store-data/unified-data-interface';
import { InstanceOutcomeType } from '../../../reports/components/instance-outcome-type';
import { outcomeTypeSemantics } from '../../../reports/components/outcome-type';
import { MinimalRuleHeader } from '../../../reports/components/report-sections/minimal-rule-header';
import { CardRuleResult } from '../../types/store-data/card-view-model';
import { UserConfigurationStoreData } from '../../types/store-data/user-configuration-store';
import {
    CollapsibleComponentCardsDeps,
    CollapsibleComponentCardsProps,
} from './collapsible-component-cards';
import { RuleContent, RuleContentDeps } from './rule-content';
import * as styles from './rules-with-instances.scss';

export const ruleGroupAutomationId = 'cards-rule-group';

export type RulesWithInstancesDeps = RuleContentDeps &
    CollapsibleComponentCardsDeps & {
        collapsibleControl: (props: CollapsibleComponentCardsProps) => JSX.Element;
    };

export type RulesWithInstancesProps = {
    deps: RulesWithInstancesDeps;
    fixInstructionProcessor: FixInstructionProcessor;
    rules: CardRuleResult[];
    outcomeType: InstanceOutcomeType;
    userConfigurationStoreData: UserConfigurationStoreData;
    targetAppInfo: TargetAppData;
    outcomeCounter: OutcomeCounter;
    headingLevel: number;
    cardSelectionMessageCreator: CardSelectionMessageCreator;
};

export const ruleDetailsGroupAutomationId = 'rule-details-group';

export const RulesWithInstances = NamedFC<RulesWithInstancesProps>(
    'RulesWithInstances',
    ({
        rules,
        outcomeType,
        fixInstructionProcessor,
        deps,
        userConfigurationStoreData,
        targetAppInfo,
        outcomeCounter,
        headingLevel,
        cardSelectionMessageCreator,
    }) => {
        const getCollapsibleComponentProps = (
            rule: CardRuleResult,
            idx: number,
            buttonAriaLabel: string,
        ) => {
            return {
                id: rule.id,
                key: `summary-details-${idx + 1}`,
                header: (
                    <MinimalRuleHeader
                        key={rule.id}
                        rule={rule}
                        outcomeType={outcomeType}
                        outcomeCounter={outcomeCounter}
                    />
                ),
                content: (
                    <RuleContent
                        key={`${rule.id}-rule-group`}
                        deps={deps}
                        rule={rule}
                        fixInstructionProcessor={fixInstructionProcessor}
                        userConfigurationStoreData={userConfigurationStoreData}
                        targetAppInfo={targetAppInfo}
                        cardSelectionMessageCreator={cardSelectionMessageCreator}
                    />
                ),
                containerAutomationId: ruleGroupAutomationId,
                containerClassName: styles.collapsibleRuleDetailsGroup,
                buttonAriaLabel: buttonAriaLabel,
                headingLevel,
                deps: deps,
                onExpandToggle: (event: React.MouseEvent<HTMLDivElement>) => {
                    cardSelectionMessageCreator.toggleRuleExpandCollapse(rule.id, event);
                },
                isExpanded: rule.isExpanded,
            };
        };

        return (
            <div
                className={styles.ruleDetailsGroup}
                data-automation-id={ruleDetailsGroupAutomationId}
            >
                {rules.map((rule, idx) => {
                    const { pastTense } = outcomeTypeSemantics[outcomeType];
                    const count = outcomeCounter(rule.nodes);
                    const buttonAriaLabel = `${rule.id} ${count} ${pastTense} ${rule.description}`;
                    const CollapsibleComponent = deps.collapsibleControl(
                        getCollapsibleComponentProps(rule, idx, buttonAriaLabel),
                    );
                    return CollapsibleComponent;
                })}
            </div>
        );
    },
);
