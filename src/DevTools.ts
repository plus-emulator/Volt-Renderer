import { GetRoomEngine, RoomEngine } from '@volt/room';
export { };

declare global
{
	interface Window
	{
		VoltDevTools?:
		{
            roomEngine: RoomEngine;
            setPlaneRenderMode: (mode: 'bake' | 'direct') => void;
		};
	}
}

window.VoltDevTools = {
    roomEngine: GetRoomEngine(),
    setPlaneRenderMode: mode => GetRoomEngine().setPlaneRenderMode(mode === 'direct')
};
