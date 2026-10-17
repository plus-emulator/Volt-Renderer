import { IActionDefinition, IActiveActionData } from '@volt/api';

export class ActiveActionData implements IActiveActionData
{
    private _actionType: string;
    private _actionParameter: string;
    private _definition: IActionDefinition;
    private _startFrame: number;
    private _overridingAction: string;
    // Looked up for every body part of every redraw; built once instead of each time.
    private _id: string = null;

    constructor(action: string, parameter: string = '', startFrame: number = 0)
    {
        this._actionType = action || '';
        this._actionParameter = parameter || '';
        this._definition = null;
        this._startFrame = startFrame || 0;
        this._overridingAction = null;
    }

    public dispose(): void
    {
        this._actionType = null;
        this._actionParameter = null;
        this._definition = null;
    }

    public get id(): string
    {
        if(!this._definition) return '';

        if(this._id === null) this._id = (this._definition.id + '_' + this._actionParameter);

        return this._id;
    }

    public get actionType(): string
    {
        return this._actionType;
    }

    public get actionParameter(): string
    {
        return this._actionParameter;
    }

    public set actionParameter(parameter: string)
    {
        this._actionParameter = parameter;
        this._id = null;
    }

    public get definition(): IActionDefinition
    {
        return this._definition;
    }

    public set definition(definition: IActionDefinition)
    {
        this._definition = definition;
        this._id = null;
    }

    public get startFrame(): number
    {
        return this._startFrame;
    }

    public get overridingAction(): string
    {
        return this._overridingAction;
    }

    public set overridingAction(action: string)
    {
        this._overridingAction = action;
    }
}
