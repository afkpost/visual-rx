import * as React from 'react';
import { Connection as Model, Component, Message as MessageModel } from './Models';
import './Connection.css';
import { Message } from './Message';

type Props = {
    connection: Model,
    components: ReadonlyArray<Component>
};

type State = {
    messages: { progress: number, message: MessageModel}[]
};

const componentSize = 150;

export class Connection extends React.Component<Props, State> {
    state: State = {
        messages: []
    };

    componentWillMount() {
        this.props.connection
            .progress
            .subscribe(msg => {
                const messages = this.state.messages;
                if (msg.progress === 1) {
                    this.setState({ 
                        messages: messages.filter(x => x.message.id !== msg.message.id)
                    });
                } else if (!messages.find(x => x.message.id === msg.message.id)) {
                    this.setState({
                        messages: messages.concat(msg)
                    });
                } else {
                    this.setState({ 
                        messages: messages.map(x => x.message.id !== msg.message.id
                            ? x
                            : msg)
                    });
                }
            });
    }

    render() {
        const { connection, components } = this.props;
        const fromComponent = components.find(x => x.id === connection.sink.ownerId)!;
        const toComponent = components.find(x => x.id === connection.source.ownerId)!;
        const fromIdx = fromComponent.sinks.indexOf(connection.sink) + 0.5;
        const toIdx = toComponent.sources.indexOf(connection.source) + 0.5;

        const from = {
            x: fromComponent.position.x + fromIdx / fromComponent.sinks.length * componentSize,
            y: fromComponent.position.y + componentSize
        };

        const to = {
            x: toComponent.position.x + toIdx / toComponent.sources.length * componentSize,
            y: toComponent.position.y
        };

        const length = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
        const center = {
            x: (from.x + to.x) / 2,
            y: (from.y + to.y) / 2
        };
        const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI;

        return (
            <div 
                className="connection"
                style={{
                    left: center.x - length / 2,
                    top: center.y,
                    width: length,
                    height: 2,
                    transform: 'rotate3d(0, 0, 1, ' + angle + 'deg)'
                }}
            >
                {this.state.messages.slice().reverse().map(msg => 
                    <Message 
                        key={msg.message.id} 
                        msg={msg.message}
                        style={{
                            left: msg.progress * (length + 35) - 35,
                        }}
                    />
                )}
            </div>
        );
    }
}