import * as React from 'react';
import './Stepper.css';
import * as cx from 'classnames';

type Props = {
    label: string,
    value: number,
    min?: number,
    max?: number,
    onChange: (value: number) => void,
    steps?: number[],
    unit?: string
};

export class Stepper extends React.PureComponent<Props> {
    render() {
        const { label, value, min, max, onChange, unit } = this.props;
        const steps = (this.props.steps || [1]).slice().sort((a, b) => a - b);

        const decDisabled = min !== undefined && value <= min;
        const incDisabled = max !== undefined && value >= max;

        const update = (delta: number) => {
            let newValue = value + delta;
            if (min !== undefined && newValue < min) {
                newValue = min;
            }
            if (max !== undefined && newValue > max) {
                newValue = max;
            }
            onChange(newValue);
        };

        return (
            <div className="stepper">
                <label>{label}</label>
                <div className="content">
                    <div className="steps">
                        {steps.map((step, i) => 
                            <div 
                                className={cx('button', { disabled: decDisabled })} 
                                key={i}
                                onClick={() => update(-step)}
                            >
                                -{step}
                            </div>
                        )}
                    </div>
                    <div className="value">
                        <div>
                            {value}
                            <div className="unit">{unit}</div>
                        </div>
                    </div>
                    <div className="steps">
                        {steps.map((step, i) => 
                            <div 
                                className={cx('button', { disabled: incDisabled })} 
                                key={i}
                                onClick={() => update(step)}                                
                            >
                                +{step}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}