import { getUserData, storeUserData, useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as Google from 'expo-auth-session/providers/google';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

export default function LoginPage() {
    //const redirectUri = AuthSession.makeRedirectUri();
    //console.log(redirectUri);
    const { setUser } = useUser();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.EXPO_PUBLIC_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        //redirectUri: makeRedirectUri({ native: 'collegeapp://' }),
        scopes: ['profile', 'email'],
    });

    async function getUserInfoFromServer(token: string) {
        const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await response.json();
        console.log(user);
        
        //check if the user exists in database, so we can fill in existing phone number
        const res = await fetch(`http://127.0.0.1:5000/check_user?user_id=${user.id}`, {method: "GET", headers: {"Content-Type": "application/json"}});
        const json = await res.json();
        const userCheck : [string][] = json["results"];

        if(userCheck.length > 0){
            user.phoneNumber = userCheck[0][0];
            storeUserData(user);
            setUser(user);

            router.navigate({ 
                pathname: '/status-page',
                //params: { username: user.name }
            });
        } else { 
            router.navigate({ 
                pathname: '/phone-number-page',
                params: { userText: JSON.stringify(user) }
            })
        }
        return user;
    }

    const checkLogIn = async() => {
        const storedUserData = await getUserData();

        if(storedUserData !== null){
            setUser(storedUserData);
            router.navigate({ pathname: '/status-page' });
        }
    }

    useEffect(() => {
        checkLogIn();
        
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log("Access Token:", authentication?.accessToken);
            // From the token, you can now fetch profile info:
            if(authentication != null){
                getUserInfoFromServer(authentication.accessToken);
            }
        }
    }, [response]);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <View style={styles.base}>
                    <Text style={[styles.signInText, { fontSize: 30, marginBottom: 30 }]}>DSocial</Text>
                    <TouchableOpacity style={styles.signInButton} onPress={() => promptAsync()}>
                        <AntDesign name="google" size={24} color='rgb(211, 211, 211)' />
                        <Text style={styles.signInText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
                <Text style={styles.footerText}>Created by Alex Young '29</Text>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor:'rgb(0, 105, 62)',
    },
    base: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    signInButton: {
        backgroundColor: 'rgb(18, 49, 43)',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 10,
        padding: 15,
        height: 55,
        gap: 10
    },
    signInText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium'
    },
    footerText: {
        color: 'rgba(211, 211, 211, 0.5)',
        fontSize: 20,
        marginBottom: 20,
        fontFamily: 'InstrumentSans-Medium',
        textAlign: 'center'
    }
});