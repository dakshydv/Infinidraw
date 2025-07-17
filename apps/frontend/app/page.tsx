"use client"
import Link from "next/link";
import { useState } from "react";


export default function Home() {
  const [room, setRoom] = useState("");

  return <div className="flex h-screen w-screen">
    <input type="text" value={room} onChange={(e) => {
      setRoom(e.target.value)
    }} placeholder="room name" />

    <Link href={`/room/${room}`}>Join Room</Link>
  </div>
}