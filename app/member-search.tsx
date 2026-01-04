import { useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function MemberSearch(){
    const [searchResults, setSearchResults] = useState<[string, string, string][] | null>(null);
    const [currentSearch, setCurrentSearch] = useState('');
    const debounceTimeoutRef = useRef<number>(null);

    const { groupId, ownerId, existingMembers } = useLocalSearchParams<{
        groupId: string,
        ownerId: string,
        existingMembers: string,
    }>();

    const { addUserGroup } = useUser();
    const existingMembersList = JSON.parse(existingMembers);

    //need to filter out users who are already in the group
    const searchUsers = async() => {
        const res = await fetch(`http://127.0.0.1:5000/filter_users?search_query=${currentSearch}&owner_id=${ownerId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const json = await res.json();
        setSearchResults(json["results"]);
    }

    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        if(currentSearch){
            debounceTimeoutRef.current = setTimeout(() => searchUsers(), 500);
        }
    }, [currentSearch])

    function UserRow({ user } : {user: [string, string, string]}){
        const userId = user[0];
        const userName = user[1];
        const userEmail = user[2];

        const [isAdded, setIsAdded] = useState(existingMembersList.includes(userId));

        return (
            <View>
                <View style={styles.rowContainer}>
                    <View>
                        <Text style={styles.text}>{userName}</Text>
                        {/* <Text style={styles.emailText}>{userEmail}</Text> */}
                    </View>
                    <TouchableOpacity style={styles.addButton} disabled={isAdded} onPress={() => {
                        setIsAdded(true);
                        addUserGroup(groupId, userId, userName);
                    }}>
                        <Text style={[styles.text, {fontSize: 16}]}>{isAdded ? "Added" : "Add"}</Text>
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
                    <View style={{marginTop: 20, marginBottom: 15}}>
                        <AntDesign name="close" size={35} color="rgb(211, 211, 211)" style={{alignSelf: 'flex-end'}} onPress={() => router.back()}/>
                    </View>
                    <View style={styles.searchBar}>
                        <TextInput 
                        style={styles.searchBarText}
                        value={currentSearch}
                        onChangeText={setCurrentSearch}
                        onSubmitEditing={() => searchUsers()}
                        placeholder='Search user by name...'
                        placeholderTextColor={'rgb(111, 111, 111)'}
                        autoFocus={true}
                        />
                    </View>
                    <FlatList
                        data={searchResults}
                        renderItem={({ item }) => <UserRow user={item}/>}
                        ListHeaderComponent={<View style={styles.divider}/>}
                        ListFooterComponent={<View style={{height: 100}}/>}
                        ListEmptyComponent={
                            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={styles.centerText}>{searchResults ? "No results found" : "Enter your search to see results!"}</Text>
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
        backgroundColor: 'rgb(18, 49, 43)'
    },
    base: {
        flex: 1,
        marginHorizontal: 20,
        //height: '100%'
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
        paddingHorizontal: 15,
        marginVertical: 5
    },
    searchBarText: {
        color: 'rgb(255, 255, 255)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: 'rgb(111, 111, 111)'
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
    },
    emailText: {
        color: 'rgb(111, 111, 111)',
        fontSize: 15,
        fontFamily: 'InstrumentSans-Medium',
    },
    centerText: {
        color: 'rgb(111, 111, 111)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        marginTop: 250
    },
    addButton: {
        height: 50,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)', 
    },
})