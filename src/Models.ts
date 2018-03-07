import { Observable, Subject } from 'rxjs';
import * as guid from 'guid';

const Colors = [
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

export type MessageType = 'Hot' | 'Cold';

export class Message {
    readonly id = guid.raw();
    readonly colors: ReadonlyArray<string>;

    constructor(public readonly type: MessageType, ...colors: string[]) {
        this.colors = colors.length === 0
            ? [Colors[Math.floor(Math.random() * Colors.length)]]
            : colors;
    }
}

class Sink {
    readonly ownerId: string;
    readonly stream: () => Observable<Message>;

    constructor(
        ownerId: string,
        stream: () => Observable<Message>
    ) {
        this.stream = stream;
        this.ownerId = ownerId;
    }
}

class Source {
    readonly ownerId: string;
    readonly connector: Connector<Message>;

    constructor(
        ownerId: string,
        connector: Connector<Message>
    ) {
        this.connector = connector;
        this.ownerId = ownerId;
    }
}

export type Component = {
    readonly position: Position
    readonly id: string
    readonly sources: ReadonlyArray<Source>
    readonly sinks: ReadonlyArray<Sink>
    readonly type: ComponentType
};

export const Component: (type: ComponentType) => Component = (type: ComponentType) => ({
    position: { x: 0, y: 0 },
    id: guid.raw(),
    sources: [] as ReadonlyArray<Source>,
    sinks: [] as ReadonlyArray<Sink>,
    type
});

export const WithSources = (component: Component, ...sources: Connector<Message>[]) => ({
    ...component,
    sources: component.sources.concat(sources.map(x => new Source(component.id, x)))
});

export const WithSinks = (component: Component, ...sinks: (() => Observable<Message>)[]) => ({
    ...component,
    sinks: component.sinks.concat(sinks.map(x => new Sink(component.id, x)))
});

export class Connection {
    static readonly duration = 2000;
    static readonly frameRate = 30;
    readonly progress: Observable<{progress: number, message: Message}>;

    constructor(public sink: Sink, public source: Source) {
        const period = 1000 / Connection.frameRate;
        const progressStream = new Subject<{progress: number, message: Message}>();
        const stream = sink.stream()
            .do(message => {
                Observable.timer(0, period)
                    .map(i => i * period / Connection.duration)
                    .map(progress => ({ 
                        progress,
                        message
                    }))
                    .takeWhile(x => x.progress < 1)
                    .concat([{ progress: 1, message }])
                    .concat(Observable.never<{progress: number, message: Message}>())
                    .subscribe(progressStream);
            })
            .delay(Connection.duration);
        source.connector(stream);

        this.progress = progressStream;
    }
}

export type Model = {
    readonly components: ReadonlyArray<Component>
    readonly connections: ReadonlyArray<Connection>
};

export const Model = (components: ReadonlyArray<Component>, connections: ReadonlyArray<Connection>) => ({
    components, 
    connections
});