import { Model, Position, Component } from './Models';

export type Action = (model: Model) => Model;
export const Action = (action: Action) => action;

export const Move = (needleId: string, position: Position) =>
    Action(model => ({
        ...model,
        components: model.components.map(component => component.id !== needleId
            ? component
            : { ...component, position: position })
    }));

export const Replace = (component: Component) => 
    Action(model => ({
        ...model,
        components: model.components.map(x => x.id === component.id
            ? component
            : x)
    }));