// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IndexedDBDataKeys } from 'background/IndexedDBDataKeys';
import { PersistentStore } from 'common/flux/persistent-store';
import { IndexedDBAPI } from 'common/indexedDB/indexedDB';
import { Logger } from 'common/logging/logger';
import { forOwn, isEmpty } from 'lodash';
import { StoreNames } from '../../common/stores/store-names';
import {
    CardSelectionStoreData,
    RuleExpandCollapseData,
} from '../../common/types/store-data/card-selection-store-data';
import {
    CardSelectionPayload,
    RuleExpandCollapsePayload,
    UnifiedScanCompletedPayload,
} from '../actions/action-payloads';
import { CardSelectionActions } from '../actions/card-selection-actions';
import { UnifiedScanResultActions } from '../actions/unified-scan-result-actions';

export class CardSelectionStore extends PersistentStore<CardSelectionStoreData> {
    constructor(
        private readonly cardSelectionActions: CardSelectionActions,
        private readonly unifiedScanResultActions: UnifiedScanResultActions,
        persistedState: CardSelectionStoreData,
        idbInstance: IndexedDBAPI,
        logger: Logger,
        tabId: number,
        persistStoreData: boolean,
    ) {
        super(
            StoreNames.CardSelectionStore,
            persistedState,
            idbInstance,
            IndexedDBDataKeys.cardSelectionStore(tabId),
            logger,
            persistStoreData,
        );
    }

    protected addActionListeners(): void {
        this.cardSelectionActions.toggleRuleExpandCollapse.addListener(
            this.toggleRuleExpandCollapse,
        );
        this.cardSelectionActions.toggleCardSelection.addListener(this.toggleCardSelection);
        this.cardSelectionActions.collapseAllRules.addListener(this.collapseAllRules);
        this.cardSelectionActions.expandAllRules.addListener(this.expandAllRules);
        this.cardSelectionActions.toggleVisualHelper.addListener(this.toggleVisualHelper);
        this.cardSelectionActions.getCurrentState.addListener(this.onGetCurrentState);
        this.unifiedScanResultActions.scanCompleted.addListener(this.onScanCompleted);
        this.cardSelectionActions.resetFocusedIdentifier.addListener(this.onResetFocusedIdentifier);
        this.cardSelectionActions.navigateToNewCardsView.addListener(this.onNavigateToNewCardsView);
    }

    public getDefaultState(): CardSelectionStoreData {
        const defaultValue: CardSelectionStoreData = {
            rules: {},
            visualHelperEnabled: false,
            focusedResultUid: null,
        };

        return defaultValue;
    }

    private deselectAllCardsInRule = (rule: RuleExpandCollapseData): void => {
        if (!rule) {
            return;
        }

        forOwn(rule.cards, (isSelected, resultInstanceUid, cards) => {
            cards[resultInstanceUid] = false;
        });
    };

    private deselectAllCards = (): void => {
        forOwn(this.state.rules, rule => {
            this.deselectAllCardsInRule(rule);
        });
    };

    private toggleRuleExpandCollapse = (payload: RuleExpandCollapsePayload): void => {
        if (!payload || !this.state.rules[payload.ruleId]) {
            return;
        }

        const rule = this.state.rules[payload.ruleId];

        rule.isExpanded = !rule.isExpanded;

        if (!rule.isExpanded) {
            this.deselectAllCardsInRule(rule);
        }

        this.emitChanged();
    };

    private toggleCardSelection = (payload: CardSelectionPayload): void => {
        if (
            !payload ||
            !this.state.rules[payload.ruleId] ||
            this.state.rules[payload.ruleId].cards[payload.resultInstanceUid] === undefined
        ) {
            return;
        }

        const rule = this.state.rules[payload.ruleId];
        const isSelected = !rule.cards[payload.resultInstanceUid];
        rule.cards[payload.resultInstanceUid] = isSelected;

        // whenever a card is selected, the visual helper is enabled
        if (isSelected) {
            this.state.visualHelperEnabled = true;
            this.state.focusedResultUid = payload.resultInstanceUid;
        }

        this.emitChanged();
    };

    private collapseAllRules = (): void => {
        forOwn(this.state.rules, rule => {
            rule.isExpanded = false;
            this.deselectAllCardsInRule(rule);
        });

        this.emitChanged();
    };

    private expandAllRules = (): void => {
        forOwn(this.state.rules, rule => {
            rule.isExpanded = true;
        });

        this.emitChanged();
    };

    private toggleVisualHelper = (): void => {
        this.state.visualHelperEnabled = !this.state.visualHelperEnabled;

        if (!this.state.visualHelperEnabled) {
            this.deselectAllCards();
        }

        this.emitChanged();
    };

    private onScanCompleted = (payload: UnifiedScanCompletedPayload): void => {
        this.state = this.getDefaultState();

        if (!payload) {
            return;
        }

        payload.scanResult.forEach(result => {
            if (result.status !== 'fail' && result.status !== 'unknown') {
                return;
            }

            if (this.state.rules[result.ruleId] === undefined) {
                this.state.rules[result.ruleId] = {
                    isExpanded: false,
                    cards: {},
                };
            }

            this.state.rules[result.ruleId].cards[result.uid] = false;
        });

        this.state.visualHelperEnabled = true;

        this.emitChanged();
    };

    private onResetFocusedIdentifier = (): void => {
        this.state.focusedResultUid = null;
        this.emitChanged();
    };

    private onNavigateToNewCardsView = (): void => {
        this.state.focusedResultUid = null;
        for (const ruleId in this.state.rules) {
            this.state.rules[ruleId].isExpanded = false;
            for (const resultId in this.state.rules[ruleId].cards) {
                this.state.rules[ruleId].cards[resultId] = false;
            }
        }
        this.state.visualHelperEnabled = !isEmpty(this.state.rules);
        this.emitChanged();
    };
}
