import * as React from 'react';
import { Message as Model } from './Models';
import * as cx from 'classnames';
import './Message.css';

type Props = {
    msg: Model
    style?: {
        left?: number
    }
};

export class Message extends React.PureComponent<Props> {
    render() {
        const { msg, style } = this.props;
        return (
            <span 
                key={msg.id} 
                className={cx('message', msg.type)}
                style={{
                    ...style,
                    background: msg.color
                }}
            />
        );
    }
}