import * as React from 'react';
import { Component, Message as MessageModel } from './Models';
import { WithSources } from './Models';
import { Message } from './Message';
import './Observer.css';
import { Observable, Subject } from 'rxjs';

type State = {
    message?: MessageModel
};

export type ObserverComponent = Component & {
    readonly stream: Observable<MessageModel>
};

export const ObserverComponent = () => {
    const stream = new Subject<MessageModel>();
    return {
        ...WithSources(
            Component('Observer'), 
            x => x.subscribe(stream)),
        stream
    };
};

export class Observer extends React.PureComponent<ObserverComponent, State> {
    state: State = {
        message: undefined
    };

    componentWillMount() {
        this.props.stream.subscribe(message => {
            this.setState({ message });
        });
    }

    render() {
        return (
            <div className="observer">
                {this.state.message && <Message msg={this.state.message}/>}
            </div>
        );
    }
}