import { useUser } from '@/components/user-methods';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MembersPage(){
    const [members, setMembers] = useState<[string, string][]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const { id, owner } = useLocalSearchParams<{
        id: string,
        owner: string,
    }>();

    const { getUserProperty } = useUser();
    const ownerId = owner.split("/")[0];
    const userIsOwner = ownerId === getUserProperty("id");

    //get users in group
    const getGroupMembers = async(groupId: string) => {
        try {
            const res = await fetch(`https://alxy24.pythonanywhere.com/group_members?group_id=${groupId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
            });
            const json = await res.json();
            //console.log(json);
            return json["results"];
        } catch (err) {
            console.error("Request failed:", err);
            return [];
        }
    }

    //remove user from a group
    const removeGroupMember = async(groupId: string, userId: string) => {
        try {
            const res = await fetch(`https://alxy24.pythonanywhere.com/remove_group_member`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"groupId": groupId, "userId": userId})
            });
            const json = await res.json();

        } catch (err) {
            console.error("Request failed:", err);
            return [];
        }
    }

    const onRefresh = useCallback(() => {
        getGroupMembers(id).then((members) => setMembers(members));
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
    }, []);

    useFocusEffect(
        useCallback(() => { 
            getGroupMembers(id).then((members) => setMembers(members));
        }, [id])
    );

    function MemberRow({ member } : {member: [string, string]}){
        const [isRemoved, setIsRemoved] = useState(false);
        
        const userId = member[0];
        const userName = member[1];

        const memberIsOwner = userId === ownerId;

        return (
            <View>
                { isRemoved ?
                <View style={[styles.rowContainer, {justifyContent: 'center'}]}>
                    <Text style={styles.removedText}>{userName} has been removed</Text>
                </View>
                :
                <View style={styles.rowContainer}>
                    <Text style={[styles.text, { marginVertical: 20 }]}>{userName}</Text>
                    { userIsOwner && !memberIsOwner &&
                        <TouchableOpacity style={styles.removeButton} onPress={() => 
                            {
                                setIsRemoved(true);
                                removeGroupMember(id, userId);
                                //setRemovedUsers([...removedUsers, userId]);
                                //addUserGroup(groupId, userId); //add the user-group relationship so the user who made the request actually joins the group when accepted
                            }}>
                            <Text style={styles.removeButtonText}>{"Remove"}</Text>
                        </TouchableOpacity>
                    }
                    {(memberIsOwner || userId === getUserProperty("id")) && <View style={styles.removeButtonView}>
                        <Text style={styles.removeButtonText}>{memberIsOwner ? "Owner" : "Me"}</Text>
                    </View>}
                </View>
                }
                <View style={styles.divider}/>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.base}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => router.back()
                            //router.navigate({ pathname: '/detail-page', params: {name: name, desc: desc, isPrivate: isPrivate, isSearchable: isSearchable, id: id, owner: owner, isJoined: "true", returnPath: returnPath} })
                            }>
                            <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                            <Text style={[styles.text, { fontSize: 40 }]}>Members</Text>
                        </TouchableOpacity>
                        {userIsOwner && 
                            <TouchableOpacity onPress={() => router.navigate({pathname: '/member-search', params: { groupId: id, ownerId: ownerId, existingMembers: JSON.stringify(members.map((member) => member[0])) }})}>
                                <MaterialIcons name="group-add" size={45} color='rgb(211, 211, 211)' />
                            </TouchableOpacity>
                        }
                    </View>
                    <FlatList
                        data={members}
                        renderItem={({ item }) => <MemberRow member={item}/>}
                        ListHeaderComponent={<View style={styles.divider}/>}
                        ListFooterComponent={<View style={{height: 100}}/>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['rgb(111, 111, 111)']} tintColor='rgba(111, 111, 111, 0.5)'/>
                        }
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        //backgroundColor: 'rgb(0, 105, 62)'
        backgroundColor: 'rgb(0, 105, 62)'
    },
    base: {
        flex: 1,
        marginHorizontal: 15,
        //height: '100%'
    },
    rowContainer: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        minHeight: 90, 
        padding: 10
    },
    text: {
        color: 'rgb(211, 211, 211)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
        marginVertical: 10
    },
    removedText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgb(111, 111, 111)'
    },
    removeButton: {
        height: 50,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)', 
    },
    removeButtonText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 16,
        fontFamily: 'InstrumentSans-Medium'
    },
    removeButtonView: {
        height: 50,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
    }
})