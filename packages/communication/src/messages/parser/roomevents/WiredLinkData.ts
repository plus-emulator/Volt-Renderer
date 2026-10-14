import { IMessageDataWrapper } from '@volt/api';

/** package_82.WiredLinkNetwork (WIN63-202610131318). The id "0" means no network. */
export interface IWiredLinkNetwork
{
    id: string;
    name: string;
    connectionCount: number;
    linkedInCurrentRoom: boolean;
}

/** package_82.WiredLinkConnection: one wf_link of a network, possibly in another room. */
export interface IWiredLinkConnection
{
    roomId: number;
    roomName: string;
    furniId: number;
    isBuildersClub: boolean;
    receiveLocal: boolean;
}

export const WIRED_LINK_NO_NETWORK = '0';

export function parseWiredLinkNetwork(wrapper: IMessageDataWrapper): IWiredLinkNetwork
{
    return { id: wrapper.readString(), name: wrapper.readString(), connectionCount: wrapper.readInt(), linkedInCurrentRoom: wrapper.readBoolean() };
}

export function parseWiredLinkNetworks(wrapper: IMessageDataWrapper): IWiredLinkNetwork[]
{
    const count = wrapper.readInt();
    const networks: IWiredLinkNetwork[] = [];

    for(let i = 0; i < count; i++) networks.push(parseWiredLinkNetwork(wrapper));

    return networks;
}

export function parseWiredLinkConnection(wrapper: IMessageDataWrapper): IWiredLinkConnection
{
    return { roomId: wrapper.readInt(), roomName: wrapper.readString(), furniId: wrapper.readInt(), isBuildersClub: wrapper.readBoolean(), receiveLocal: wrapper.readBoolean() };
}
