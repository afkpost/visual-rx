import * as React from 'react';
import * as cx from 'classnames';
import './Switch.css';

type Props = {
    value: boolean
    label: string
    onChange: (value: boolean) => void
};

export class Switch extends React.PureComponent<Props> {
    render () {
        const { label, value, onChange } = this.props;
        return (
            <div className="switch">
                <label>{label}</label>
                <div className={cx('handle', { disabled: !value})} onClick={() => onChange(!value)}/>
            </div>
        );
    }
}