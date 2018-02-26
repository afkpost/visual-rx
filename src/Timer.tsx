import * as React from 'react';
import { TimerComponent as Props } from './Models';
import './Timer.css';
import { Stepper } from './controls/Stepper';

type State = {
    period: number
};

export class Timer extends React.PureComponent<Props, State> {
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