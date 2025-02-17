// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { NeedsReviewCardSelectionActions } from 'background/actions/needs-review-card-selection-actions';
import { StoreNames } from 'common/stores/store-names';

import * as TelemetryEvents from '../../common/extension-telemetry-events';
import { getStoreStateMessage, Messages } from '../../common/messages';
import { Interpreter } from '../interpreter';
import { TelemetryEventHandler } from '../telemetry/telemetry-event-handler';
import {
    BaseActionPayload,
    CardSelectionPayload,
    RuleExpandCollapsePayload,
} from './action-payloads';

export class NeedsReviewCardSelectionActionCreator {
    constructor(
        private readonly interpreter: Interpreter,
        private readonly needsReviewCardSelectionActions: NeedsReviewCardSelectionActions,
        private readonly telemetryEventHandler: TelemetryEventHandler,
    ) {}

    public registerCallbacks(): void {
        this.interpreter.registerTypeToPayloadCallback(
            Messages.NeedsReviewCardSelection.CardSelectionToggled,
            this.onNeedsReviewCardSelectionToggle,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.NeedsReviewCardSelection.RuleExpansionToggled,
            this.onRuleExpansionToggle,
        );
        this.interpreter.registerTypeToPayloadCallback(
            getStoreStateMessage(StoreNames.NeedsReviewCardSelectionStore),
            this.onGetCurrentState,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.NeedsReviewCardSelection.ToggleVisualHelper,
            this.onToggleVisualHelper,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.NeedsReviewCardSelection.ExpandAllRules,
            this.onExpandAllRules,
        );
        this.interpreter.registerTypeToPayloadCallback(
            Messages.NeedsReviewCardSelection.CollapseAllRules,
            this.onCollapseAllRules,
        );
    }

    private onGetCurrentState = (): void => {
        this.needsReviewCardSelectionActions.getCurrentState.invoke(null);
    };

    private onNeedsReviewCardSelectionToggle = (payload: CardSelectionPayload): void => {
        this.needsReviewCardSelectionActions.toggleCardSelection.invoke(payload);
        this.telemetryEventHandler.publishTelemetry(
            TelemetryEvents.CARD_SELECTION_TOGGLED,
            payload,
        );
    };

    private onRuleExpansionToggle = (payload: RuleExpandCollapsePayload): void => {
        this.needsReviewCardSelectionActions.toggleRuleExpandCollapse.invoke(payload);
        this.telemetryEventHandler.publishTelemetry(
            TelemetryEvents.RULE_EXPANSION_TOGGLED,
            payload,
        );
    };

    private onToggleVisualHelper = (payload: BaseActionPayload): void => {
        this.needsReviewCardSelectionActions.toggleVisualHelper.invoke(null);
        this.telemetryEventHandler.publishTelemetry(TelemetryEvents.VISUAL_HELPER_TOGGLED, payload);
    };

    private onCollapseAllRules = (payload: BaseActionPayload): void => {
        this.needsReviewCardSelectionActions.collapseAllRules.invoke(null);
        this.telemetryEventHandler.publishTelemetry(TelemetryEvents.ALL_RULES_COLLAPSED, payload);
    };

    private onExpandAllRules = (payload: BaseActionPayload): void => {
        this.needsReviewCardSelectionActions.expandAllRules.invoke(null);
        this.telemetryEventHandler.publishTelemetry(TelemetryEvents.ALL_RULES_EXPANDED, payload);
    };
}
