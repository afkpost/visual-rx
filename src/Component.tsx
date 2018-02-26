import * as React from 'react';
import { Component as Props, Position } from './Models';
import './Component.css';
import { Move } from './Actions';
import { Bus } from './Dispatcher';

type State = {
    offset: Position
    capturing: boolean
};

type MouseEvent = { 
    clientX: number 
    clientY: number
};

export class Component extends React.Component<Props, State> {
    state = {
        offset: { x: 0, y: 0},
        capturing: false
    };
      
    render() {
        const { position, sources, sinks, type } = this.props;
        
        return (
            <div 
                className="component" 
                style={{ top: position.y, left: position.x }}
                onMouseDown={e => this.capture(e)}
                onMouseUp={() => this.release()}
                onMouseMove={e => this.mouseMove(e)}
                onMouseLeave={() => this.release()}
            >
                <header>{type}</header>
                <div className="sources">
                    {sources.map((x, i) => <div className="port" key={i}/>)}
                </div>
                <div className="content">
                    {this.props.children}
                </div>
                <div className="sinks">
                    {sinks.map((x, i) => <div className="port" key={i}/>)}
                </div>
            </div>
        );
    }

    capture(e: MouseEvent) {
        const { position } = this.props;
        this.setState({ 
            offset: {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            },
            capturing: true
        });
    }

    release() {
        this.setState({ capturing: false });
    }

    mouseMove(e: MouseEvent) {
        if (!this.state.capturing) {
            return;
        }

        const x = e.clientX - this.state.offset.x;
        const y = e.clientY - this.state.offset.y;
        Bus.next(Move(this.props.id, { x, y }));
    }
}