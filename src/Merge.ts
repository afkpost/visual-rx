import { WithSinks, WithSources, Component, Message } from './Models';
import { ReplaySubject, Observable } from 'rxjs';

export const MergeComponent = (sources = 2) => {
    const streams = new ReplaySubject<Observable<Message>>();

    let c = Component('Merge');
    for (let i = 0; i < sources; i++) {
        c = WithSources(c, x => streams.next(x));
    }

    return (
        WithSinks(
            c,
            () => streams.scan((x, y) => x.merge(y)).switch())
    );
};