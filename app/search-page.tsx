import { SearchGroupBox } from '@/components/group-box';
import { useUser } from '@/components/user-methods';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export type SearchGroup = {
    name: string;
    description: string;
    isPrivate: boolean;
    isJoined: boolean;
    requestStatus: boolean;
    id: string;
    owner: string;
};

export default function SearchPage(){
    const [groups, setGroups] = useState<SearchGroup[]>([]);
    const [searchResults, setSearchResults] = useState<SearchGroup[]>();
    const [currentSearch, setCurrentSearch] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const debounceTimeoutRef = useRef<number>(null);

    const { getUserGroups, getUserJoinRequests } = useUser();

    const getGroups = async() => {
        try {
            const res = await fetch("http://127.0.0.1:5000/groups", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const json = await res.json();
            const groupsArr: [string, string, boolean, string, string][] = json["results"]; //every group that exists

            const userGroups : [string, string, boolean, string, string][] = await getUserGroups(); //groups the user is part of
            const userGroupIds: string[] = []; //list of ids for groups the user is part of
            userGroups.forEach(group => {
                userGroupIds.push(group[3]);
            });

            const joinRequests: string[] = await getUserJoinRequests();
            const joinRequestsSet = new Set(joinRequests);
            //console.log(joinRequests);

            //set isJoined property of each group based on whether or not its id is in the list of group ids joined by the user
            let parsedGroups: SearchGroup[] = [];
            groupsArr.forEach(group => {
                const groupId = group[3];
                const isJoined = userGroupIds.includes(groupId);
                const requestStatus = joinRequestsSet.has(groupId);
                parsedGroups.push({ name: group[0], description: group[1], isPrivate: group[2], isJoined: isJoined, requestStatus: requestStatus, id: groupId, owner: group[4] })
            });

            setGroups(parsedGroups);
            setSearchResults(parsedGroups);
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

    useFocusEffect(
        useCallback(() => {
            getGroups();
        }, [])
    );

    useEffect(() =>
    {
        
        //this code will be called every time the uses makes a key press -- debouncing only calls filtering once the user has stopped typing for 200ms
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        if(currentSearch){
            debounceTimeoutRef.current = setTimeout(() => {
                const filteredResults = groups.filter(group => group.name.toLowerCase().includes(currentSearch.toLowerCase()));
                setSearchResults(filteredResults);
            }, 200);
        } else {
            setSearchResults(groups);
        }
        /*
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
        */
    }, [currentSearch]);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Entypo name="chevron-left" size={30} color='rgb(111, 111, 111)' />
                            <MaterialIcons name='groups' size={40} color='rgb(111, 111, 111)' />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Find groups</Text>
                </View>
                <View style={styles.base}>
                    <View style={styles.searchBar}>
                        <TextInput 
                        style={styles.searchBarText}
                        value={currentSearch}
                        onChangeText={setCurrentSearch}
                        placeholder='Search by group name...'
                        placeholderTextColor={'rgb(111, 111, 111)'}
                        />
                    </View>
                    <FlatList
                        data={searchResults}
                        renderItem={({ item }) => <SearchGroupBox group={item}/>}
                        ListEmptyComponent={
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={styles.centerText}>{"No results found"}</Text>
                            </View>
                        }
                        ListFooterComponent={
                            <View style={{height: 100}}>
                                <Text style={[styles.footerText, { fontSize: 15, marginTop: 15, color: 'rgb(111, 111, 111, 0.7)' }]}>Publicly visible groups will appear here</Text>
                            </View>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['rgba(111, 111, 111, 0.5)']} tintColor={'rgba(111, 111, 111, 0.5)'}/>
                        }
                    />
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(66, 66, 66)'
    },
    base: {
        flex: 1,
        marginHorizontal: 10
    },
    footerText: {
        textAlign: 'center',
        color: 'rgb(111, 111, 111)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium' //add a font later, maybe InstrumentSans?
    },
    searchBar: {
        width: '100%',
        height: 50,
        backgroundColor:'rgb(56, 56, 56)',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection:'row',
        justifyContent:'space-between',
        padding: 10,
        paddingHorizontal: 15
    },
    searchBarText: {
        color: 'rgb(255, 255, 255)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    headerText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 35,
        fontFamily: 'InstrumentSans-Medium' //add a font later, maybe InstrumentSans?
    },
    header: {
        height: 80,
        marginRight: 20,
        marginLeft: 12,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    centerText: {
        color: 'rgb(111, 111, 111)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        marginTop: 250
    },
});