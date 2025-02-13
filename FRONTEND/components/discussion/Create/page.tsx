import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketProvider";

export function CreateDiscussion() {
    const { controleur } = useSocket();
    const [users, setUsers] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [showList, setShowList] = useState(false);
    const [searchInput, setSearchInput] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);

    const handler = {
        nomDInstance: "CreateDiscussion",
        traitementMessage: (msg: { users_list_response?: { etat: boolean; users?: any[]; error?: string } }) => {
            if (msg.users_list_response) {
                if (!msg.users_list_response.etat) {
                    setError(`Fetching users failed: ${msg.users_list_response.error}`);
                } else {
                    setUsers(msg.users_list_response.users || []);
                }
            }
        },
    };

    useEffect(() => {
        if (controleur) {
            controleur.inscription(handler, ["users_list_request"], ["users_list_response"]);
        }
        return () => {
            if (controleur) {
                controleur.desincription(handler, ["users_list_request"], ["users_list_response"]);
            }
        };
    }, [controleur]);

    const fetchUsersList = () => {
        try {
            const T = { users_list_request: {} };
            controleur?.envoie(handler, T);
        } catch (err) {
            setError("Failed to fetch users list. Please try again.");
        }
    };

 

    const handleUserSelect = (user: any) => {
        if (!selectedUsers.find(u => u.email === user.email)) {
            setSelectedUsers([...selectedUsers, user]);
        }
        setSearchInput("");
        setShowList(false);
    };

    const handleRemoveUser = (userToRemove: any) => {
        setSelectedUsers(selectedUsers.filter(user => user.email !== userToRemove.email));
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setSearchInput(value);
        if (value.length >= 1) {
            setShowList(true);
            fetchUsersList();
            setFilteredUsers(users.filter(user => 
                !selectedUsers.find(u => u.email === user.email) && (
                    user.firstname.toLowerCase().includes(value.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(value.toLowerCase())
                )
            ));
        } else {
            setShowList(false);
            setFilteredUsers([]);
        }
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap gap-2 mb-2">
                {selectedUsers.map((user) => (
                    <div 
                        key={user.email}
                        className="flex items-center bg-gray-100 rounded px-2 py-1"
                    >
                        <span>{user.firstname} {user.lastname}</span>
                        <button 
                            onClick={() => handleRemoveUser(user)}
                            className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex items-center">
                <input 
                    type="text" 
                    id="discussionMembers" 
                    name="discussionMembers" 
                    placeholder="Recherchez des membres ..." 
                    value={searchInput}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>

            {showList && filteredUsers.length > 0 && (
                <ul className="absolute w-full mt-1 border rounded bg-white shadow-lg z-10">
                    {filteredUsers.map((user) => (
                        <li 
                            key={user.email}
                            onClick={() => handleUserSelect(user)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {user.firstname} {user.lastname}
                        </li>
                    ))}
                </ul>
            )}
            <textarea name="message" id="message"></textarea>
            <button>Envoyer</button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}