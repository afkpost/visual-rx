import * as React from 'react';
import { Component, WithSinks, Message } from './Models';
import { Subject } from 'rxjs';

export type ClickComponent = Component & {
    click: () => void
};

export const ClickComponent = () => {
    const stream = new Subject<Message>();
    return {
        ...WithSinks(
            Component('Click'),
            () => stream
        ),
        click: () => stream.next(new Message('Hot'))
    };
};

export class Click extends React.PureComponent<ClickComponent> {
    render () {
        return <button onClick={() => this.props.click()}>Click me</button>;
    }
}