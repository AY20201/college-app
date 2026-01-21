import { useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import Checkbox from 'expo-checkbox';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { addJoinRequest } from './join-requests-page';

export function formatClassYear(name: string, email: string){
    const splitEmail = email.split("@");
    if(splitEmail[1] === "dartmouth.edu"){
        if(splitEmail[0].length > 1){
            const numString = splitEmail[0].slice(-2);
            if(Number.isFinite(Number(numString))){
                return name + ` '${numString}`;
            }
        }
    }
    return name;
}

const modifyPrivacyStatus = async(groupId: string, newPrivacyStatus: boolean, useSearchable?: boolean) => {
    try {
        const res = await fetch("https://alxy24.pythonanywhere.com/modify_privacy_status", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"groupId": groupId, "newPrivacyStatus": newPrivacyStatus, "useSearchable": useSearchable })
        });
        const json = await res.json();
        console.log(json);
    } catch (err) {
        console.error("Request failed:", err);
    }
}

const deleteGroup = async(groupId: string) => {
    try {
        const res = await fetch("https://alxy24.pythonanywhere.com/delete_group", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"groupId": groupId})
        });
        const json = await res.json();
        console.log(json);
    } catch (err) {
        console.error("Request failed:", err);
    }
}

export const getJoinRequests = async(groupId: string) => {
    try {
        console.log(groupId);
        const res = await fetch(`https://alxy24.pythonanywhere.com/join_requests?group_id=${groupId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const json = await res.json();
        console.log(json);
        return json["results"];
    } catch (err) {
        console.error("Request failed:", err);
    }
    return [];
}

export default function DetailPage() {
    const [privacyStatus, setPrivacyStatus] = useState(false);
    const [searchableStatus, setSearchableStatus] = useState(false);
    const [hideNumber, setHideNumber] = useState(false);
    const [userIsOwner, setUserIsOwner] = useState(false);
    const [joinRequests, setJoinRequests] = useState<[string, string, string][]>([]);

    const { getUserProperty, leaveUserGroup, addUserGroup, getUserGroups, changeHideNumber } = useUser();

    //allow for back button to go to search page if this page was navigated to from search page
    const { name, desc, isPrivate, isSearchable, id, owner, isJoined } = useLocalSearchParams<{
        name: string, 
        desc: string, 
        isPrivate: string,
        isSearchable: string,
        id: string,
        owner: string,
        isJoined: string,
    }>();
    
    const isJoinedBool = isJoined === "true";
    const splitOwner = owner.split("/");
    console.log(splitOwner);

    useFocusEffect(
        useCallback(() => {
            if(id && isPrivate === "true") getJoinRequests(id).then((requests) => setJoinRequests(requests));
        }, [id])
    );

    useEffect(() => {
        setPrivacyStatus(isPrivate === "true");
        setSearchableStatus(isSearchable === "true");
        if(isJoinedBool){
            getUserGroups(id).then((userGroup) => {
                setHideNumber(Boolean(userGroup[3]));
            })
        }
        
        if(owner){
            setUserIsOwner(getUserProperty("id") == splitOwner[0]);
        }
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <ScrollView style={styles.base} keyboardShouldPersistTaps='handled'>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => {
                            if(isPrivate && (isPrivate === "true") !== privacyStatus){
                                modifyPrivacyStatus(id, privacyStatus);
                            }
                            if(isSearchable && (isSearchable === "true") !== searchableStatus){
                                modifyPrivacyStatus(id, searchableStatus, true); //actually modifying searchable status, just reusing the function
                            }
                            changeHideNumber(id, hideNumber);
                            router.back();
                        }}>
                        <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                        <Text style={[styles.text, { fontSize: 40 }]}>{name}</Text>
                    </TouchableOpacity>
                    <Text style={styles.descriptionText}>{desc ? desc : "No description"}</Text>
                    <View style={{marginVertical: 15, height: 1, backgroundColor: 'rgb(111, 111, 111)'}}></View>
                    {isPrivate && 
                        <View>
                            { userIsOwner ? 
                            <View style={{ flexDirection:'row', alignItems: 'center', gap: 10 }}> 
                                <Checkbox value={privacyStatus} onValueChange={(newValue) => { 
                                    setPrivacyStatus(newValue);
                                    if(!newValue && joinRequests){ //if making a previously private group public
                                        addJoinRequest(id, "", "", true, true); //accept all join requests from group
                                        const joinRequestIds: string[] = joinRequests.map(request => request[0]); //get a list of only request user ids
                                        addUserGroup(id, joinRequestIds, undefined, true); //add a user group for every user with a join request
                                        setJoinRequests([]); //set local join requests
                                        console.log("Flipped privacy status");
                                    }
                                }} color={'rgb(180, 180, 180)'}/>
                                <Text style={styles.detailsText}>Require request to join</Text>    
                            </View>
                            :
                            <View style={{ flexDirection:'row', alignItems: 'center', gap: 5 }}>
                                {isPrivate === "true" ? 
                                <Entypo name="lock" size={21} color="rgb(180, 180, 180)" />
                                :
                                <FontAwesome5 name="globe-americas" size={21} color="rgb(180, 180, 180)" />
                                }
                                <Text style={styles.detailsText}>{isPrivate === "true" ? "Private · Request to join only" : "Public"}</Text>    
                            </View>
                            }
                        </View>
                    }
                    {isSearchable && 
                        <View>
                            { userIsOwner ? 
                            <View style={{ flexDirection:'row', alignItems: 'center', gap: 10 }}> 
                                <Checkbox value={!searchableStatus} onValueChange={() => setSearchableStatus(!searchableStatus)} color={'rgb(180, 180, 180)'}/>
                                <Text style={styles.detailsText}>Hidden from search page</Text>    
                            </View>
                            :
                            <View style={{ flexDirection:'row', alignItems: 'center', gap: 5 }}>
                                <AntDesign name={searchableStatus ? "eye" : "eye-invisible"} size={21} color="rgb(180, 180, 180)" />
                                <Text style={styles.detailsText}>{searchableStatus ? "Visible in search" : "Hidden in search"}</Text>    
                            </View>
                            }
                        </View>
                    }
                    { isJoinedBool &&
                        <View style={{ flexDirection:'row', alignItems: 'center', gap: 10 }}> 
                            <Checkbox value={hideNumber} onValueChange={setHideNumber} color={'rgb(180, 180, 180)'}/>
                            <Text style={styles.detailsText}>Hide phone number</Text>    
                        </View>
                    }
                    {owner && 
                        <Text style={styles.detailsText}>Created by {formatClassYear(splitOwner[1], splitOwner[2])}</Text>
                    }
                    { isJoinedBool &&
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}} onPress={() =>
                            router.navigate({pathname: '/members-page', params: {id: id, owner: owner}})
                            }>
                            <Text style={styles.requestText}>Members</Text>
                            <Entypo name="chevron-right" size={20} color='rgb(180, 180, 180)' style={{marginTop: 2}}/>
                        </TouchableOpacity>
                    }
                    { userIsOwner && isPrivate === "true" && joinRequests.length > 0 && 
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}} onPress={() => 
                            router.navigate({pathname: '/join-requests-page', params: {joinRequestsStr: JSON.stringify(joinRequests)}})
                            }>
                            <Text style={styles.requestText}>Join requests ({joinRequests.length})</Text>
                            <Entypo name="chevron-right" size={20} color='rgb(180, 180, 180)' style={{marginTop: 2}}/>
                        </TouchableOpacity>
                    }
                </ScrollView>
                {id &&
                    <TouchableOpacity style={styles.leaveButton} onPress={() => { 
                        if(userIsOwner) { 
                            /*delete group*/
                            //make sure sure there is a confirmation overlay/popup that appears here
                            deleteGroup(id);
                        } else {
                            leaveUserGroup(id);
                        }
                        router.back();
                        }}>
                        <Text style={styles.leaveButtonText}>{userIsOwner ? "Delete group" : "Leave group"}</Text>
                    </TouchableOpacity>
                }
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(0, 105, 62)'
    },
    base: {
        flex: 1,
        marginHorizontal: 15
    },
    text: {
        color: 'rgb(211, 211, 211)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
        marginVertical: 10
    },
    descriptionText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
        marginVertical: 10
    },
    detailsText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        marginVertical: 10
    },
    requestText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        textDecorationLine: 'underline'
    },
    leaveButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(245, 32, 32)',
        marginBottom: 20,
        marginHorizontal: 15
    },
    leaveButtonText: {
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        color: 'rgb(245, 32, 32)',
    },
    privacyText: {
        color: 'rgb(111, 111, 111)',
        marginVertical: 10,
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    }
});