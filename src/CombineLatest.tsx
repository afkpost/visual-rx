import { WithSinks, WithSources, Component, Message } from './Models';
import { ReplaySubject, Observable } from 'rxjs';

export const CombineLatest = () => {
    const left = new ReplaySubject<Observable<Message>>();
    const right = new ReplaySubject<Observable<Message>>();
    let next = 0;
    const leftStream = left.switch().map(message => ({ message, i: next++}));
    const rightStream = right.switch().map(message => ({ message, i: next++}));

    return (
        WithSinks(
            WithSources(
                Component('CombineLatest'),
                x => left.next(x),
                x => right.next(x)
            ),
            () => leftStream.combineLatest(rightStream, (l, r) => 
                new Message(
                    l.i > r.i 
                        ? l.message.type 
                        : r.message.type, 
                    ...r.message.colors.concat(l.message.colors))))
    );
};