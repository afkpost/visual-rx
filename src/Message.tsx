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

const minSize = 20;
const maxSize = 50;

export class Message extends React.PureComponent<Props> {
    render() {
        const { msg, style } = this.props;
        const count = msg.colors.length;
        const widthCount = Math.floor(Math.sqrt(count) + 1);
        const size = Math.min(minSize, maxSize / widthCount);
        return (
            <div className="messages-container" style={style}>
                <div 
                    key={msg.id} 
                    className={cx('messages', msg.type, { single: count <= 1})}
                    style={{
                        maxWidth: widthCount * size,
                        mawHeight: widthCount * size
                    }}
                >
                    { msg.colors.map((background, i) => 
                        <span 
                            key={i} 
                            className="message"
                            style={{ 
                                background,
                                width: size,
                                height: size
                            }}
                        />
                    )}
                </div>
            </div>
        );
    }
}