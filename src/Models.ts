import { Observable, Subject, BehaviorSubject, ConnectableObservable, Subscription, ReplaySubject } from 'rxjs';
import * as guid from 'guid';

const colors = [
    '#ff1744',
    '#d500f9',
    '#651fff',
    '#2979ff',
    '#00e5ff',
    '#00e676',
    '#c6ff00',
    '#ffc400'
];

type ComponentType = string;
type Connector<T> = (stream: Observable<T>) => void;
export type Position = { 
    readonly x: number
    readonly y: number 
};

type MessageType = 'Hot' | 'Cold';

export class Message {
    readonly id = guid.raw();
    readonly color: string;

    constructor(public readonly type: MessageType, color?: string) {
        this.color = color || colors[Math.floor(Math.random() * colors.length)];
    }
}

class Sink {
    readonly ownerId: string;
    readonly stream: () => Observable<Message>;

    constructor(
        owner: Component,
        stream: () => Observable<Message>
    ) {
        this.stream = stream;
        this.ownerId = owner.id;
    }
}

class Source {
    readonly ownerId: string;
    readonly connector: Connector<Message>;

    constructor(
        owner: Component,
        connector: Connector<Message>
    ) {
        this.connector = connector;
        this.ownerId = owner.id;
    }
}

export abstract class Component {
    readonly position: Position;
    readonly id: string;
    sources: ReadonlyArray<Source> = [];
    sinks: ReadonlyArray<Sink> = [];

    constructor(
        public readonly type: ComponentType,

    ) {
        this.position = {x: 0, y: 0 };
        this.id = guid.raw();
    }
}

export abstract class BaseComponent extends Component {
    protected source(...sources: Connector<Message>[]) {
        this.sources = this.sources.concat(sources.map(x => new Source(this, x)));
    }

    protected sink(...sinks: (() => Observable<Message>)[]) {
        this.sinks = this.sinks.concat(sinks.map(x => new Sink(this, x)));
    }
}

export class ClickComponent extends Component {
    readonly subject = new Subject<Message>();
    type: ComponentType = 'Click';
    sources: ReadonlyArray<Source> = [
    ];
    sinks: ReadonlyArray<Sink> = [ 
        new Sink(this, () => this.subject),
    ];

    click() {
        this.subject.next(new Message('Hot'));
    }
}

export class PrintComponent extends BaseComponent {
    readonly stream: Observable<Message>;

    constructor() {
        super('Print');
        const stream = new Subject<Message>();
        this.stream = stream;
        this.source(x => x.subscribe(stream));
    }
}

export class TimerComponent extends BaseComponent {
    readonly period: Subject<number>;

    constructor(period: number) {
        super('Timer');
        this.period = new BehaviorSubject(period);

        this.sink(() => this.period
            .map(x => Observable
                .timer(x, x)
                .map(() => (new Message('Cold'))))
            .switch());
    }
}

export class MergeComponent extends BaseComponent {
    constructor() {
        super('Merge');

        const streams = new ReplaySubject<Observable<Message>>();
        this.source(
            x => streams.next(x),
            x => streams.next(x)
        );

        this.sink(() => streams.scan((x, y) => x.merge(y)).switch());
    }
}

export class ConnectableComponent extends BaseComponent {
    subscription: Observable<Subscription | undefined>;
    _subscription: Subject<Subscription | undefined>;
    private connections: Observable<ConnectableObservable<Message>>;

    constructor() {
        super('Connectable');
        this._subscription = new BehaviorSubject<Subscription | undefined>(undefined);
        this.subscription = this._subscription;
        const connections = new Subject<ConnectableObservable<Message>>();
        const connectableConnections = connections
            .publishReplay(1);

        this.connections = connectableConnections;
        connectableConnections.connect();
        this.source(source => connections.next(source.publish()));
        this.sink(() => 
            this.connections.switch().map(x => ({ ...x, type: 'Hot' as MessageType})));
    }

    connect = () => {
        this.connections
            .take(1)
            .subscribe(c => this._subscription.next(c.connect()));
    }

    disconnect = () => {
        this.subscription
            .take(1)
            .filter(x => !!x)
            .subscribe(sub => {
                sub!.unsubscribe();
                this._subscription.next(undefined);
            });
    }
    
}

export class Connection {
    static readonly duration = 2000;
    static readonly frameRate = 30;
    readonly progress: Observable<{progress: number, message: Message}>;

    constructor(public sink: Sink, public source: Source) {
        const period = 1000 / Connection.frameRate;
        const progress = new Subject<{progress: number, message: Message}>();
        const stream = sink.stream()
            .flatMap(message => Observable
                .timer(0, period)
                .map(i => i * period / Connection.duration)
                .map(x => ({ progress: x, message }))
                .takeWhile(x => x.progress < 1)
                .concat(Observable.from([{ progress: 1, message}])))
            .do(x => progress.next(x))
            .filter(x => x.progress >= 1)
            .map(x => x.message);
        source.connector(stream);

        this.progress = progress;
    }
}

export type Model = {
    readonly components: ReadonlyArray<Component>
    readonly connections: ReadonlyArray<Connection>
};

const timer1 = { ...new TimerComponent(2000), position: { x: 0, y: 0 }};
const timer2 = { ...new TimerComponent(5000), position: { x: 200, y: 0 }};
const merge = { ...new MergeComponent(),      position: { x: 100, y: 200 }};
const conn = { ...new ConnectableComponent(), position: { x: 100, y: 400 }};
const print = { ...new PrintComponent(),      position: { x: 100, y: 600 }};

export const Model: Model = {
    components: [
        timer1,
        timer2,
        merge, 
        conn,
        print,
    ],
    connections: [
        new Connection(timer1.sinks[0], merge.sources[0]),
        new Connection(timer2.sinks[0], merge.sources[1]),
        new Connection(merge.sinks[0], conn.sources[0]),
        new Connection(conn.sinks[0], print.sources[0]),
    ],
};