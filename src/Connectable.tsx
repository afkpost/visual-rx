import * as React from 'react';
import { Switch } from './controls/Switch';
import { Component, Message, WithSinks, WithSources, MessageType } from './Models';
import { Observable, Subscription, BehaviorSubject, Subject, ConnectableObservable } from 'rxjs';

export type ConnectableComponent = Component & {
    subscription: Observable<Subscription | undefined>
    connect: () => void
    disconnect: () => void
};

export const ConnectableComponent: () => ConnectableComponent = () => {
    const subscription = new BehaviorSubject<Subscription | undefined>(undefined);
    const connections  = new Subject<ConnectableObservable<Message>>();
    const connectableConnections = connections.publishReplay();
    connectableConnections.connect();

    const _connections = connectableConnections as Observable<ConnectableObservable<Message>>;

    return {
        ...WithSinks(
            WithSources(
                Component('Connectable'),
                x => connections.next(x.publish())),
            () => _connections
                .switch()
                .map(x => ({...x, type: 'Hot' as MessageType}))),
        subscription,
        connect: () => {
            _connections
                .take(1)
                .subscribe(c => subscription.next(c.connect()));
        },
        disconnect: () => subscription
            .take(1)
            .filter(x => !!x)
            .subscribe(sub => {
                sub!.unsubscribe();
                subscription.next(undefined);
            })
    };
};

type State = {
    hasSubscription: boolean
};

export class Connectable extends React.PureComponent<{model: ConnectableComponent}, State> {
    state: State = {
        hasSubscription: false
    };

    componentWillMount() {
        this.props.model
            .subscription
            .map(x => x !== undefined)
            .subscribe(hasSubscription => this.setState({ hasSubscription }));
    }

    render() {
        const { model } = this.props;
        return (
            <Switch
                label="Connected"
                value={this.state.hasSubscription}
                onChange={connect => {
                    if (connect) {
                        model.connect();
                    } else {
                        model.disconnect();
                    }
                }}
            />  
        );
    }
}