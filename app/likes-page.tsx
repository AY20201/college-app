import { useUser } from '@/components/user-methods';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Checkbox from 'expo-checkbox';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Linking, Platform, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const sendSMS = async(message: string, selection?: [string, string][], phoneNumber?: string) => {
    //formats [[name1, number1], [name2, number2]...] to [+number1, +number2, ...]
    let phoneNumbers : string[] = [];
    if(!phoneNumber && selection){
        selection.forEach((like) => {
            phoneNumbers.push(`+${like[1]}`);
        });
        if(phoneNumbers.length == 0) { return; }
    } else if(phoneNumber) {
        phoneNumbers.push(`+${phoneNumber[2]}`);
    } else {
        return;
    }

    const separator = Platform.OS === 'ios' ? '&' : '?';
    const body = encodeURIComponent(message);
    const url = `sms:${phoneNumbers.join(',')}${separator}body=${body}`;

    try {
        // Check if the device can handle the URL
        const canOpen = await Linking.canOpenURL(url);
    
        if (canOpen) {
            await Linking.openURL(url);
        } else {
            Alert.alert('Error', 'Cannot open SMS app');
        }
    } catch (error) {
        console.error('An error occurred', error);
        Alert.alert('Error', 'Failed to open SMS app');
    }
}

export const getLikes = async(requestId: string, groupId: string) => {
    try {
        const res = await fetch(`https://alxy24.pythonanywhere.com/get_likes_list?request_id=${requestId}&group_id=${groupId}`, {
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

export default function LikesPage(){
    const [likes, setLikes] = useState<[string, string, string, boolean][]>([]); //user id, user name, phone number, hide number
    const [selection, setSelection] = useState<[string, string][]>([]); //user id, phone number
    const [refreshing, setRefreshing] = useState(false);

    const { requestId, groupId } = useLocalSearchParams<{requestId: string, groupId: string}>();
    const { getUserProperty } = useUser();

    //get list of likes as usernames (instead of user ids)
    const onRefresh = useCallback(() => {
        getLikes(requestId, groupId).then((likes) => setLikes(likes));
        
        setRefreshing(true);
        setTimeout(() => {
          setRefreshing(false);
        }, 500);
    }, []);

    useEffect(() => {
        getLikes(requestId, groupId).then((likes) => setLikes(likes));  
    }, []);

    function UserRow({ like } : { like: [string, string, string, boolean] }){
        const [userId, userName, phoneNum, numHidden] = like;
        const isSelected = selection.some(item => item[0] === userId);

        return (
            <View>
                <View style={[styles.rowContainer, isSelected ? { "backgroundColor":'rgb(0, 105, 50)' } : null]}>
                    <View style={{maxWidth: 300}}>
                        <Text style={styles.text}>{userName}</Text>
                    </View>
                    <View style={styles.checkboxView}>
                        { userId === getUserProperty("id") ? 
                            <Text style={styles.meText}>Me</Text>
                            :
                            ((!numHidden && phoneNum) && <Checkbox value={isSelected} onValueChange={(value) => {
                                if(value){
                                    setSelection(prev => [...prev, [userId, phoneNum]]);
                                } else {
                                    setSelection(prev => prev.filter(item => item[0] !== userId)); //filter out the already added user
                                }
                            }} color={'rgb(180, 180, 180)'}/>)
                        }
                    </View>
                </View>
                <View style={styles.divider}/>
            </View>
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.base}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => router.back()}>
                            <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                            <Text style={[styles.text, { fontSize: 40 }]}>Likes</Text>
                        </TouchableOpacity>
                        { !(likes.length === 1 && likes[0][0] === getUserProperty("id")) && 
                            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 5}} onPress={() => sendSMS("Hey everyone! Let's do the activity.", selection)}>
                                <Text style={[styles.meText, { color: 'rgb(180, 180, 180)', fontSize: 25 }]}>({selection.length})</Text>
                                <FontAwesome6 name="message" size={35} color='rgb(211, 211, 211)' />
                            </TouchableOpacity>
                        }
                    </View>
                    <FlatList
                        data={likes}
                        renderItem={({ item }) => <UserRow like={item}/>}
                        ListHeaderComponent={<View style={styles.divider}/>}
                        ListFooterComponent={<View style={{height: 100}}/>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['rgba(111, 111, 111, 0.5)']} tintColor={'rgba(111, 111, 111, 0.5)'}/>
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
    meText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 16,
        fontFamily: 'InstrumentSans-Medium',
    },
    checkboxView: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    }
})