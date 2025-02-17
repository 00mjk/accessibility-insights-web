// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { StoreUpdateMessageDistributor } from 'common/store-update-message-distributor';
import { isEqual } from 'lodash';
import { BaseStore } from './base-store';
import { Store } from './flux/store';
import { StoreUpdateMessage } from './types/store-update-message';

export class StoreProxy<TState> extends Store implements BaseStore<TState> {
    private state: TState;

    constructor(
        private readonly storeId: string,
        private readonly messageDistributor: StoreUpdateMessageDistributor,
    ) {
        super();
        this.messageDistributor.registerStoreUpdateListener(storeId, this.onChange);
    }

    private onChange = (message: StoreUpdateMessage<TState>): void => {
        if (!isEqual(this.state, message.payload)) {
            this.state = message.payload;
            this.emitChanged();
        }
    };

    public getState = (): TState => {
        return this.state;
    };

    public getId(): string {
        return this.storeId;
    }
}
