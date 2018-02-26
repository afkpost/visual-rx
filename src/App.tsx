import * as React from 'react';
import { Model, Component as ComponentModel, PrintComponent, TimerComponent, ConnectableComponent } from './Models';
import { Component } from './Component';
import { Connection } from './Connection';
import { Dispatcher } from './Dispatcher';
import { Observable } from 'rxjs';
import { Print } from './Print';
import { Timer } from './Timer';
import { Connectable } from './Connectable';

const tick = Observable.timer(0, 10);

const InnerComponent = (component: ComponentModel) => {
  switch (component.type) {
    case 'Print': return <Print {...component as PrintComponent}/>;
    case 'Timer': return <Timer {...component as TimerComponent}/>;
    case 'Connectable': return <Connectable model={component as ConnectableComponent}/>;
    default: return null;
  }
};

export class App extends React.Component<{}, Model> {
  state = Model;

  componentWillMount() {
    Dispatcher
      .scan((model, action) => action(model), Model)
      .sample(tick)
      .subscribe(model => this.setState(model));
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
