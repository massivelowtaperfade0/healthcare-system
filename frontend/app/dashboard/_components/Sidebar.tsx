'use client';
import {Activity, BarChart, LogIn, UserCheck, Users, Link2} from 'lucide-react'


type User = {
    email: string;
    activeOrg? : {
        id: string;
        role: string;
        name: string;
    } | null;
};

interface SidebarProps {
    user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {

    const linksByRole: Record<string, { name: string; href: string; icon: any }[]> = {
        admin: [
            { name: 'Users', icon: Users, href: '/users' },
            { name: 'Analytics', icon: BarChart, href: '/analytics' },
            { name: 'Activities', icon: Activity, href: '/activities' },
            { name: 'Log Out', icon: LogIn, href: '/logout' },
        ],
        doctor: [
            { name: 'Patients', icon: UserCheck, href: '/patients' },
            { name: 'Analytics', icon: BarChart, href: '/analytics' },
            { name: 'Activities', icon: Activity, href: '/activities' },
            { name: 'Log Out', icon: LogIn, href: '/logout' },
        ],
        nurse: [
            { name: 'Patients', icon: UserCheck, href: '/patients' },
            { name: 'Activities', icon: Activity, href: '/activities' },
            { name: 'Log Out', icon: LogIn, href: '/logout' },
        ],
        patient: [
            { name: 'My Records', icon: UserCheck, href: '/my-records' },
            { name: 'Appointments', icon: Activity, href: '/appointments' },
            { name: 'Link Records', icon: Link2, href: '/join' },
            { name: 'Log Out', icon: LogIn, href: '/logout' },
        ],
    };

    const currentRole = user?.activeOrg?.role?.toLowerCase() || "Guest";
    const orgName = user?.activeOrg?.name || 'No Organization';

    const initial = user.email.charAt(0).toUpperCase();
    let firstName = user.email.split('@')[0]
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
    const links = linksByRole[currentRole] || [];

        return (
            <div 
            className="group sticky flex flex-col w-18 rounded-r-lg hover:w-56 transition-all duration-300 ease-in-out text-black h-200 p-4"
            style={{
                backgroundColor: "var(--secondary)",
                color: "var(--foreground)",
                borderColor: "var(--border)",
            }}
            >
            
            {/* User Info */}
            <div className="mb-6 flex flex-col items-center">
                {/* Initial always visible group-hover:items-start transition-all duration-300*/}
                <div 
                className="w-10 h-10 rounded-full text-black flex items-center justify-center font-bold text-lg flex-shrink-0 transistion group-hover:hidden"
                style={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    borderColor: "var(--border)",
                }}
                >
                {initial}
                </div>

                {/* Full email name and role visible only on hover */}
                <div 
                className="overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-xs rounded-xl transition-all group-hover:scale-103 group-hover:p-10 duration-300 mt-2"
                style={{
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    borderColor: "var(--border)",
                }}
                >
                <div className="text-lg font-bold">{firstName}</div>
                <div className="text-xs font-semibold text-blue-500 uppercase">{currentRole}</div>
                <div className="text-xs opacity-60 truncate">{orgName}</div>
                </div>
            </div>

            {/* Links */}
            <ul className="flex flex-col gap-3">
                {links.map(({ name, href, icon: Icon}) => (
                <li key={name}>
                    <a
                    href={href}
                    className="flex gap-3 p-3 rounded-xl hover:scale-105 transition-all duration-200"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--card-hover"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                    >
                    {/* Icon always visible */}
                    <Icon className="w-5 h-5 flex-shrink-0" />

                    {/* Text only visible on sidebar hover */}
                    <span className="overflow-hidden whitespace-nowrap max-w-0 group-hover:max-w-full transition-all duration-300">
                        {name}
                    </span>
                    </a>
                </li>
                ))}
            </ul>

            </div>
        );
}

export default Sidebar