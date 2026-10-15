import { IMessageComposer } from '@volt/api';
import { Byte } from '../../../codec/Byte';
import { Short } from '../../../codec/Short';
import { IWiredContractContents, IWiredContractRule } from '../../parser/roomevents/WiredContractData';

/** AIR AbstractContract.addContentsToComposer, PaymentContract / RewardContract, package_193.class_3028. */
export class UpdateWiredContractComposer implements IMessageComposer<unknown[]> {
    private _data: unknown[];
    constructor(contents: IWiredContractContents) {
        const data: unknown[] = [contents.contractId, new Short(contents.contractType)];
        const rule = (value: IWiredContractRule) => {
            data.push(value.nodes.length);
            for(const node of value.nodes) {
                data.push(new Byte(node.type), node.amount);
                if(node.type === 1) {
                    if(!node.itemType) throw new Error('Furniture contract node requires an item type');
                    data.push(node.itemType.isWallItem, node.itemType.typeId, node.itemType.legacyPosterId);
                }
            }
        };
        data.push(contents.definition.youGiveRule !== null);
        if(contents.definition.youGiveRule !== null) {
            data.push(contents.definition.youGiveRule.length);
            contents.definition.youGiveRule.forEach(rule);
        }
        data.push(contents.definition.youGetRule !== null);
        if(contents.definition.youGetRule !== null) rule(contents.definition.youGetRule);
        if(contents.contractType === 0) data.push(new Short(contents.paymentMode), contents.receiveText, contents.layoutType);
        if(contents.contractType === 2) data.push(new Short(contents.rewardCategory), contents.showDialog, contents.rewardText);
        this._data = data;
    }
    public getMessageArray(): unknown[] { return this._data; }
    public dispose(): void { }
}
