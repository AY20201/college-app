import { useUser } from '@/components/user-methods';
import Entypo from '@expo/vector-icons/Entypo';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const addJoinRequest = async(groupId: string, userId: string, userName: string, accept?: boolean, multiple?: boolean) => {
    try {
        //combining add and accept join request functions into one because they are so similar
        //when a value is passed for accept (checking if undefined or not here, will always be true when passed)
        //the request will be made to the accept endpoint instead of the add one
        const res = await fetch(`https://alxy24.pythonanywhere.com/${accept ? "accept" : "add"}_join_request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"groupId": groupId, "userId": userId, "userName": userName, "multiple": multiple})
        });
        const json = await res.json();
        //console.log(json);
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

export default function JoinRequestsPage(){
    const { joinRequestsStr, } = useLocalSearchParams<{
        joinRequestsStr: string
    }>();
    
    const [refreshing, setRefreshing] = useState(false);
    const [joinRequests, setJoinRequests] = useState<[string, string, string][]>(JSON.parse(joinRequestsStr));

    const { addUserGroup } = useUser();

    const onRefresh = useCallback(() => {
        //TODO: import get join requests method and call it here
        if(joinRequests.length > 0){
            //joinRequests[0][1] --> groupId
            getJoinRequests(joinRequests[0][1]).then((results) => setJoinRequests(results));
        }

        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
    }, []);

    function RequestRow({ request } : {request: [string, string, string]}){
        const userId = request[0];
        const groupId = request[1];
        const userName = request[2];
        
        const [localAccepted, setLocalAccepted] = useState(false);

        return (
            <View>
                <View style={styles.rowContainer}>
                    <View style={{maxWidth: 300}}>
                        <Text style={[styles.text, { marginVertical: 20 }]}>{userName}</Text>
                    </View>
                    <TouchableOpacity style={styles.requestButton} onPress={() => 
                        {
                            setLocalAccepted(true);
                            addJoinRequest(groupId, userId, "", true, false); //this is actually setting a request to accepted (username does not matter at all)
                            addUserGroup(groupId, userId, userName); //add the user-group relationship so the user who made the request actually joins the group when accepted
                        }} disabled={localAccepted}>
                        <Text style={styles.requestButtonText}>{localAccepted ? "Accepted" : "Accept"}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.divider}/>
            </View>
        );
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.base}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => router.back()
                        //router.navigate({ pathname: '/detail-page', params: {name: name, desc: desc, isPrivate: isPrivate, isSearchable: isSearchable, id: id, owner: owner, isJoined: "true", returnPath: returnPath} })
                        }>
                        <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                        <Text style={[styles.text, { fontSize: 40 }]}>Join requests</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={joinRequests}
                        renderItem={({ item }) => <RequestRow request={item}/>}
                        ListHeaderComponent={<View style={styles.divider}/>}
                        ListFooterComponent={<View style={{height: 100}}/>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['rgba(111, 111, 111, 0.5)']} tintColor={'rgba(111, 111, 111, 0.5)'}/>
                        }
                        ListEmptyComponent={
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={styles.centerText}>{"No join requests to review!"}</Text>
                            </View>
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
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgb(111, 111, 111)'
    },
    requestButton: {
        height: 50,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)', 
    },
    requestButtonText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 16,
        fontFamily: 'InstrumentSans-Medium'
    },
    centerText: {
        color: 'rgb(111, 111, 111)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        marginTop: 250
    },
})