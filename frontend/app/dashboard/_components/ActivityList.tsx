'use client';
import { useState } from "react";

type ActivityItem = {
    eventType: string;
    createdAt: string;
    ip: string;
}

export default function ActivityList({ initialData }: { initialData: ActivityItem[] }) {
    const [activity, setActivity] = useState<ActivityItem[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refetchActivity = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY}/user/activity`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to fetch");
            setActivity(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {loading && <p>Loading Activities</p>}
            {error && <p className="text-red-500">{error}</p>}
            <ul className="space-y-2 flex flex-col justify-center items-center gap-2 w-100">
                {activity.map((item, index) => (
                    <li key={index} className="p-3 border rounded">
                        <div>Event: {item.eventType}</div>
                        <div>Date: {new Date(item.createdAt).toLocaleString()}</div>
                        <div>IP: {item.ip}</div>
                    </li>
                ))}
            </ul>
            <button onClick={refetchActivity} className="mt-4 p-2 bg-blue-500 text-white rounded">
                Refresh
            </button>
        </div>
    )
}