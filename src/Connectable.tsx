import * as React from 'react';
import { Switch } from './controls/Switch';
import { ConnectableComponent as Model } from './Models';

type Props = {
    model: Model
};

type State = {
    hasSubscription: boolean
};

export class Connectable extends React.PureComponent<Props, State> {
    state: State = {
        hasSubscription: false
    };

    componentWillMount() {
        this.props.model
            .subscription
            .map(x => x !== undefined)
            .subscribe(hasSubscription => this.setState({ hasSubscription }));
    }

    render() {
        const { model } = this.props;
        return (
            <Switch
                label="Connected"
                value={this.state.hasSubscription}
                onChange={connect => {
                    if (connect) {
                        model.connect();
                    } else {
                        model.disconnect();
                    }
                }}
            />  
        );
    }
}