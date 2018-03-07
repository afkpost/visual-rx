import * as React from 'react';
import { Component, WithSinks, Message } from './Models';
import './Timer.css';
import { Stepper } from './controls/Stepper';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

export type TimerComponent = Component & {
    readonly period: Subject<number>
};

export const TimerComponent = (period: number) => {
    const periodStream: Subject<number> = new BehaviorSubject(period);
    
    return {
        ...WithSinks(
            Component('Timer'),
            () => periodStream
                .map(x => Observable
                    .timer(x, x)
                    .map(() => new Message('Cold')))
                .switch()
        ),
        period: periodStream
    };
};

type State = {
    period: number
};

export class Timer extends React.PureComponent<TimerComponent, State> {
    state: State = {
        period: 0
    };

    componentWillMount() {
        this.props.period.subscribe(period => this.setState({ period }));
    }

    render() {
        const { period } = this.props;

        return (
            <div className="timer">
                <Stepper
                    label="Period"
                    value={this.state.period}
                    onChange={x => period.next(x)}
                    min={500}
                    max={120000}
                    steps={[50, 100, 500]}
                    unit="ms"
                />
            </div>
        );
    }
}