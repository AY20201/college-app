import { InfoPanel } from '@/components/info-panel';
import { getAppOpened, setAppOpened, useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import GroupBox from '../components/group-box';

export type ActivityRequest = {
    userId: string,
    name: string,
    email: string,
    phoneNumber: string,
    hideNumber: boolean,
    activity: string,
    location: string,
    groupId: string,
    requestId: string,
    timePosted: string,
    likes: string[]
}

export type Group = {
    id: string;
    name: string;
    description: string;
    isPrivate: boolean;
    isSearchable: boolean,
    owner: string,
    activityRequests: ActivityRequest[];
};

export default function StatusPage() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [pageLoaded, setPageLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [infoPanelDisplayed, setInfoPanelDisplayed] = useState(false);
    //const [groupCount, setGroupCount] = useState(0);
    const { getUserGroups, getUserProperty, addUserGroup } = useUser();

    const { name, desc, isPrivate, isSearchable } = useLocalSearchParams<{
        name: string, 
        desc: string,
        isPrivate: string,
        isSearchable: string,
    }>();

    const getActivityRequests = async() => {
        try {
            const res = await fetch("https://alxy24.pythonanywhere.com/activity_requests", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const json = await res.json();
            const activityRequestsArr: [string, string, string, string, boolean, string, string, string, string, string, string][] = json["results"];
            //console.log(activityRequestsArr);

            let parsedActivityRequests: ActivityRequest[] = [];
            activityRequestsArr.forEach(request => {
                const [ userId, name, email, phoneNumber, hideNumber, activity, location, groupId, requestId, timePosted, likes ] = request;
                parsedActivityRequests.push({ userId, name, email, phoneNumber, hideNumber: Boolean(hideNumber), activity, location, groupId, requestId, timePosted, likes: JSON.parse(likes) })
            });
            //setGroups(parsedGroups);
            return parsedActivityRequests;
        } catch (err) {
            console.error("Request failed:", err);
        }
        return [];
    }

    //get list of groups from Flask and fill groups array with that data
    const getGroups = async() => {
        try {
            //const groupsArr: [string, string, boolean, string, string, boolean][] = await getUserGroups();
            const groupsArr: [string, string, string, boolean, boolean, string][] = await getUserGroups();
            //console.log(groupsArr);
            //create an array of groups that contain the activity request array (may be a faster way to do this)
            let parsedGroups: Group[] = [];
            groupsArr.forEach(group => {
                //parsedGroups.push({ name: group[0], description: group[1], isPrivate: group[2], id: group[3], owner: group[4], isSearchable: group[5], activityRequests: [] })
                const [id, name, description, isPrivate, isSearchable, owner] = group;
                //parsedGroups.push({ name: group[0], description: group[1], isPrivate: group[2], id: group[3], owner: group[4], isSearchable: group[5], activityRequests: [] })
                parsedGroups.push({ id, name, description, isPrivate: Boolean(isPrivate), isSearchable: Boolean(isSearchable), owner, activityRequests: [] })
            });

            //create a map of requests for each groupId
            let requestsById = new Map<string, ActivityRequest[]>();
            let activityRequests : ActivityRequest[] = await getActivityRequests();
            activityRequests.forEach(request => {
                if(!requestsById.has(request.groupId)){
                    requestsById.set(request.groupId, [])
                }
                requestsById.get(request.groupId)?.push(request);
                //parsedGroups[request.groupId].activityRequests.push(request);
            });
            
            //loop through groups, get list of activityRequest from that groupId, assign that list to group.activityRequests property
            const populatedGroups : Group[] = parsedGroups.map(group => ({...group, activityRequests: requestsById.get(group.id) || []}));
            setGroups(populatedGroups);
        } catch (err) {
            console.error("Request failed:", err);
        }
    }
    
    //makes a request to Flask to add group to database
    const addGroup = async(name: string, description: string, isPrivate: boolean, isSearchable: boolean) => {
        try {
            const owner = getUserProperty("id") + "/" + getUserProperty("name") + "/" + getUserProperty("email");
            const newGroup : Group = {"name": name, "description": description, "isPrivate": isPrivate, "isSearchable": isSearchable,  "id": "", "owner": owner, "activityRequests": []};
            // if(groups.length > 0 && groups[groups.length - 1] == newGroup){
            //     return;
            // }
            const res = await fetch("https://alxy24.pythonanywhere.com/add_group", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newGroup)
            });
            const json = await res.json();
            //console.log(json);
            const generatedID = json["id"];

            await addUserGroup(generatedID);
            getGroups();
        } catch (err) {
            console.error("Request failed:", err);
        }
    }
    //will be called from GroupBox class to add an activity request to database
    const addActivityRequest = async(userId: string, activity: string, location: string, groupId: string, timePosted: string) => {
        try {
            const res = await fetch("https://alxy24.pythonanywhere.com/add_activity_request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({"userId": userId, "activity": activity, "location": location, "groupId": groupId, "timePosted": timePosted})
            });
            //setGroupCount(groupCount + 1);
            const json = await res.json();
            //console.log(json);

            return json["id"];
            //getGroups();
        } catch (err) {
            console.error("Request failed:", err);
        }
    }

    const onRefresh = useCallback(() => {
        getGroups();
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
    }, []);

    useEffect(() => {
        if(name && desc !== undefined && isPrivate && isSearchable && !pageLoaded){
            addGroup(name, desc, isPrivate === "true", isSearchable === "true");
        } else {
            getGroups();
        }
        if(!pageLoaded){
            getAppOpened().then((appOpened) => { 
                console.log(appOpened);
                setInfoPanelDisplayed(appOpened !== undefined ? !appOpened : true);
                setAppOpened(true);
            }); //app opened (true) means don't display the panel
        }
        setPageLoaded(true);
        
    }, []);
    
    useFocusEffect(
        useCallback(() => {
            getGroups();
        }, [])
    );

    return (
        //<View>
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                        <TouchableOpacity onPress={() => router.navigate({ pathname: '/user-page' })}>
                            <View style={styles.profilePicture}><Text style={styles.profileText}>{getUserProperty("name")?.charAt(0)}</Text></View>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>My Groups</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.navigate({ pathname: '/search-page' })}>
                        <Feather name='search' size={34} color='rgb(111, 111, 111)' />
                    </TouchableOpacity>
                </View>
                <View style={styles.base}>
                    {groups.length > 0 || !pageLoaded ?
                    // <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <KeyboardAwareFlatList
                        data={groups}
                        renderItem={({ item }) => <GroupBox group={item} addActivity={addActivityRequest}/>}
                        ListFooterComponent={
                        <View style={{height: 150}}>
                            <Text style={[styles.text, { fontSize: 15, marginTop: 15, color: 'rgb(111, 111, 111, 0.7)' }]}>Joined groups and new activites will appear here</Text>
                        </View>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['rgba(111, 111, 111, 0.5)']} tintColor={'rgba(111, 111, 111, 0.5)'}/>
                        }
                    />
                    // </KeyboardAvoidingView>
                    :
                    <View style={styles.listEmpty}> 
                        <Text style={styles.text}>You haven't joined any groups yet!</Text>
                        <TouchableOpacity onPress={() => router.navigate({ pathname: '/search-page' })}>
                            <Text style={[styles.text, { textDecorationLine: 'underline' }]}>Search Groups</Text>
                        </TouchableOpacity>
                    </View>
                    }
                    <TouchableOpacity style={styles.addButton} onPress={() => router.navigate({ 
                                pathname: '/add-group-form',
                                params: { groupCount: groups.length }
                            })
                        }>
                        <AntDesign name="plus" size={45} color="rgb(211, 211, 211)"/>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
            {infoPanelDisplayed && 
                <InfoPanel closePanel={() => setInfoPanelDisplayed(false)}/>
            }
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        //backgroundColor: 'rgb(0, 105, 62)'
        backgroundColor: 'rgb(66, 66, 66)'
    },
    base: {
        flex: 1,
        marginHorizontal: 10,
        //height: '100%'
    },
    statusBox: {
        width: '100%',
        height: 100,
        backgroundColor:'rgb(0, 105, 62)',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection:'row',
        justifyContent:'space-between',
        padding: 30,
        alignItems: 'center',
        color: 'rgb(255, 255, 255)'
    },
    text: {
        textAlign: 'center',
        color: 'rgb(111, 111, 111)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium' //add a font later, maybe InstrumentSans?
    },
    headerText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 35,
        fontFamily: 'InstrumentSans-Medium'
    },
    addButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        shadowOffset: { width: 0, height: 3 },
        shadowColor: 'rgb(0, 0, 0)',
        shadowRadius: 3,
        shadowOpacity: 0.4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(18, 49, 43)',
        borderRadius: '50%',
        //borderWidth: 1,
        //borderColor: 'rgb(0, 105, 62)',
        width: 75,
        height: 75
    },
    listEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -100,
    },
    profileText: {
        color: 'rgb(150, 150, 150)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium'
    },
    header: {
        height: 80,
        marginRight: 20,
        marginLeft: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    profilePicture: {
        width: 45,
        height: 45,
        borderRadius: '50%',
        backgroundColor: 'rgb(111, 111, 111)',
        justifyContent: 'center',
        alignItems: 'center'
    }
});