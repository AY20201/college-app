import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { sendSMS } from './likes-page';
import { ActivityRequest } from './status-page';

export default function ActivityDetailPage() {
    const { requestStr, userId, time } = useLocalSearchParams<{
        requestStr: string
        userId: string
        time: string
    }>();
    const request: ActivityRequest = JSON.parse(requestStr);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <ScrollView style={styles.base}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => router.navigate({ pathname: '/status-page' }) }>
                            <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                            <Text style={[styles.text, { fontSize: 40 }]}>{request.name}</Text>
                        </TouchableOpacity>
                        { (request.phoneNumber && !request.hideNumber && request.userId != userId)  &&
                            <TouchableOpacity onPress={() => sendSMS("Hey everyone! Let's do the activity.", undefined, request.phoneNumber)}>
                                <FontAwesome6 name="message" size={35} color='rgb(211, 211, 211)' />
                            </TouchableOpacity>
                        }
                    </View>
                    <Text style={styles.labelText}>Activity</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>{request.activity ? request.activity : "No description"}</Text>
                    </View>
                    <Text style={styles.labelText}>Location</Text>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>{request.location ? request.location : "No location"}</Text>
                    </View>
                    <Text style={styles.detailsText}>Posted by {request.email} at {time}</Text>
                    { request.likes.length > 0 && <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginVertical: 10}} onPress={() => 
                        router.navigate({pathname: '/likes-page', params: { requestId: request.requestId, groupId: request.groupId }})
                        }>
                        <Text style={styles.likesText}>View likes ({request.likes.length})</Text>
                        <Entypo name="chevron-right" size={20} color='rgb(180, 180, 180)' style={{marginTop: 2}}/>
                    </TouchableOpacity> }
                </ScrollView>
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
        color: 'rgb(211, 211, 211)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
    },
    detailsText:{
        marginVertical: 10, 
        fontSize: 20, 
        color: 'rgb(180, 180, 180)',
        fontFamily: 'InstrumentSans-Medium',
    },
    descriptionContainer: {
        marginVertical: 10,
        borderWidth: 2,
        borderRadius: 3,
        borderColor: 'rgba(180, 180, 180, 0.25)',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        padding: 10,
    },
    labelText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
        marginTop: 10,
        marginBottom: 5
    },
    likesText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        textDecorationLine: 'underline'
    },
});