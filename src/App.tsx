import * as React from 'react';
import { Model, Component as ComponentModel, Connection as Conn } from './Models';
import { Component } from './Component';
import { Connection } from './Connection';
import { Dispatcher } from './Dispatcher';
import { Observer, ObserverComponent } from './Observer';
import { Timer, TimerComponent } from './Timer';
import { Connectable, ConnectableComponent } from './Connectable';
import { CombineLatest } from './CombineLatest';
import { MergeComponent } from './Merge';
import { Click, ClickComponent } from './Click';

const timer1 = { ...TimerComponent(3000), position: { x: 0, y: 0 }};
const timer2 = { ...TimerComponent(5000), position: { x: 200, y: 0 }};
const click = { ...ClickComponent(), position: { x: 300, y: 170 }};
const merge = { ...MergeComponent(2),      position: { x: 100, y: 170 }};
const combine = { ...CombineLatest(),      position: { x: 200, y: 340 }};
const conn = { ...ConnectableComponent(), position: { x: 200, y: 510 }};
const print = { ...ObserverComponent(),      position: { x: 200, y: 680 }};

const model = Model(
  [
    timer1,
    timer2,
    merge,
    combine, 
    conn,
    print,
    click,
  ], 
  [
    new Conn(timer1.sinks[0], merge.sources[0]),
    new Conn(timer2.sinks[0], merge.sources[1]),
    new Conn(click.sinks[0], combine.sources[1]),
    new Conn(combine.sinks[0], conn.sources[0]),
    new Conn(conn.sinks[0], print.sources[0]),
    new Conn(merge.sinks[0], combine.sources[0]),
]);

const InnerComponent = (component: ComponentModel) => {
  switch (component.type) {
    case 'Observer': return <Observer {...component as ObserverComponent}/>;
    case 'Timer': return <Timer {...component as TimerComponent}/>;
    case 'Click': return <Click {...component as ClickComponent}/>;
    case 'Connectable': return <Connectable model={component as ConnectableComponent}/>;
    default: return null;
  }
};

export class App extends React.Component<{}, Model> {
  state = model;

  componentWillMount() {
    Dispatcher
      .scan((x, action) => action(x), model)
      .subscribe(x => this.setState(x));
  }

  render() {
    return (
      <div style={{position: 'relative' }}>
        {this.state.components.map(x => 
          <Component key={x.id} {...x}>
            <InnerComponent {...x}/>
          </Component>
        )}
        {this.state.connections.map((x, i) => <Connection key={i} connection={x} components={this.state.components}/>)}
      </div>
    );
  }
}
