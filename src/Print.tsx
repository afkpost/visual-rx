import * as React from 'react';
import { PrintComponent as Props, Message as MessageModel } from './Models';
import { Message } from './Message';
import './Print.css';

type State = {
    message?: MessageModel
};

export class Print extends React.PureComponent<Props, State> {
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
            <div className="print">
                {this.state.message && <Message msg={this.state.message}/>}
            </div>
        );
    }
}