import { logout, useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function UserPage() {
    const { getUserProperty } = useUser();
    
    const [phoneNumber, setPhoneNumber] = useState(getUserProperty("phoneNumber"));

    useFocusEffect(
        useCallback(() => {
            setPhoneNumber(getUserProperty("phoneNumber"));
        }, [])
    );
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.base}>
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -8}} onPress={() => router.back()}>
                        <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                        <Text style={[styles.text, { fontSize: 40 }]}>{getUserProperty("name")}</Text>
                    </TouchableOpacity>
                    <Text style={styles.labelText}>Email</Text>
                    <Text style={[styles.descriptionText, {marginBottom: 20}]}>{getUserProperty("email")}</Text>
                    <Text style={styles.labelText}>Phone</Text>
                    { phoneNumber ?
                        <View style={styles.phoneNumContainer}>
                            <Text style={styles.descriptionText}>{getUserProperty("phoneNumber")}</Text>
                            <TouchableOpacity onPress={() => router.navigate({ pathname: "/modify-phone-page", params: { modify: "true", userId: getUserProperty("id") } })}>
                                <AntDesign name="edit" size={22} color="rgb(111, 111, 111)" />
                            </TouchableOpacity>
                        </View>
                        :
                        <View style={styles.phoneNumContainer}>
                            <Text style={styles.descriptionText}>Not added</Text>
                            <TouchableOpacity onPress={() => router.navigate({ pathname: "/modify-phone-page", params: { modify: "true", userId: getUserProperty("id") } })}>
                                <AntDesign name="plus" size={22} color="rgb(111, 111, 111)"/>
                            </TouchableOpacity>
                        </View>
                    }
                </View>
                <TouchableOpacity style={styles.leaveButton} onPress={() => { 
                    logout();
                    router.navigate({ pathname: '/' })
                    }}>
                    <Text style={styles.leaveButtonText}>Sign out</Text>
                </TouchableOpacity>
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
    leaveButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)',
        marginBottom: 20,
        marginHorizontal: 15
    },
    leaveButtonText: {
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        color: 'rgb(211, 211, 211)',
    },
    descriptionText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    labelText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium',
        marginTop: 10,
        marginBottom: 5
    },
    phoneNumContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 20,
    }
});