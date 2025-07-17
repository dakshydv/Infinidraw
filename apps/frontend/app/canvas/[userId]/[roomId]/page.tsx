import { RoomCanvas } from "../../../../components/RoomCanvas";

export default async function CanvasPage({ params }: {
    params: {
        userId: number,
        roomId: number
    }
}) {
    const userId = (await params).userId;
    const roomId = (await params).roomId;
    
    return <RoomCanvas userId={userId} roomId={roomId} />
}