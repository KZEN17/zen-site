import RoomForm from '@/components/admin/RoomForm'

export default function NewRoomPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Room</h1>
        <p className="text-sm text-gray-500 mt-0.5">Create a new room and configure its rate tiers</p>
      </div>
      <RoomForm />
    </div>
  )
}
