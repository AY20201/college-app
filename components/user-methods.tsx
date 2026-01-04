import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useState } from 'react';

export type UserData = {
    email: string,
    family_name: string,
    given_name: string,
    hd: string,
    id: string,
    name: string,
    picture: string,
    verified_email: string,
    phoneNumber: string
}

type UserContextType = {
    user: UserData | null;
    setUser: (user: UserData | null) => void;
    getUserProperty: <K extends keyof UserData>(key: K) => UserData[K];
    setUserProperty: <K extends keyof UserData>(key: K, value: string) => void;
    getUserGroups: (groupId?: string) => Promise<any>,
    addUserGroup: (groupId: string, userId?: string, userName?: string) => void;
    leaveUserGroup: (groupId: string) => void;
    likeActivity: (requestId: string) => void;
    getUserJoinRequests: () => Promise<any>;
    changeHideNumber: (groupId: string, newStatus: boolean) => void;
};

export const storeUserData = async(user : UserData) => {
    try {
        AsyncStorage.setItem('user', JSON.stringify(user));

        const res = await fetch("http://127.0.0.1:5000/add_user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: user.id, userName: user.name, email: user.email, phoneNumber: user.phoneNumber })
        });
        const json = await res.json();
        console.log(json);

    } catch (e) {
        console.log("Error storing using data " + e);
    }
}

export const getUserData = async (): Promise<UserData | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem('user');
      return jsonValue ? JSON.parse(jsonValue) as UserData : null;
    } catch (e) {
      console.log("Error reading user data " + e);
      return null;
    }
};

export const logout = async() => {
    try {
        AsyncStorage.removeItem('user');
    } catch (e) {
        console.log("Error reading user data " + e);
    }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
  
    function getUserProperty<K extends keyof UserData>(property: K): UserData[K]{
        if(user != null){
            return String(user[property]);
        }
        return "";
    }

    function setUserProperty<K extends keyof UserData>(property: K, value: string){
        if(user != null){
            user[property] = value;
            try {
                AsyncStorage.setItem('user', JSON.stringify(user));
                console.log("Reset phone number");
            } catch (e) {
                console.log("Error storing using data " + e);
            }
        }
    }

    const getUserGroups = async(groupId?: string) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/user_groups?user_id=${user?.id}&group_id=${groupId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const json = await res.json();
    
            const groupsArr = json["results"];
            
            return groupsArr;
        } catch (err) {
            console.error("Request failed:", err);
            return [];
        }
    }
    
    const addUserGroup = async(groupId: string, userId?: string, userName?: string) => {
        try {
            const res = await fetch("http://127.0.0.1:5000/add_user_group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"userId": userId ? userId : user?.id, "groupId": groupId, "userName": userName ? userName : user?.name})
            });
    
            const json = await res.json();
            console.log(json);
            //const updatedGroups = groups.map(group => group.id === groupId ? {...group, isJoined: true} : group)
        } catch (err) {
            console.error("Request failed:", err);
        }
    }
    
    const leaveUserGroup = async(groupId: string) => {
        try {
            const res = await fetch("http://127.0.0.1:5000/leave_user_group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"userId": user?.id, "groupId": groupId})
            });
    
            const json = await res.json();
            console.log(json);
            //const updatedGroups = groups.map(group => group.id === groupId ? {...group, isJoined: true} : group)
        } catch (err) {
            console.error("Request failed:", err);
        }
    }
    
    const likeActivity = async(requestId: string) => {
        try {
            console.log(`User ${user?.id} liked request ${requestId}`);
            const res = await fetch("http://127.0.0.1:5000/like_activity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"userId": user?.id, "requestId": requestId})
            });
    
            const json = await res.json();
            console.log(json);
        } catch (err) {
            console.error("Request failed:", err);
        }
    }

    const getUserJoinRequests = async() => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/user_join_requests?user_id=${user?.id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const json = await res.json();
            return json["results"];
        } catch (err) {
            console.error("Request failed:", err);
        }
        return [];
    }

    const changeHideNumber = async(groupId: string, newStatus: boolean) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/modify_hide_number`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "userId": user?.id, "groupId": groupId, "newStatus": newStatus })
            });
            const json = await res.json();
            console.log(json);
        } catch (err) {
            console.error("Request failed:", err);
        }
    }

    return (
      <UserContext.Provider value={{ user, setUser, getUserProperty, setUserProperty, getUserGroups, addUserGroup, leaveUserGroup, likeActivity, getUserJoinRequests, changeHideNumber }}>
        {children}
      </UserContext.Provider>
    );
};
  
export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
};