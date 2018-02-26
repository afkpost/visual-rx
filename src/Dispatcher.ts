import { Subject, Observable, Observer } from 'rxjs';
import { Action } from './Actions';

const stream = new Subject<Action>();

export const Bus: Observer<Action> = stream;
export const Dispatcher: Observable<Action> = stream;