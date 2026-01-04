import { UserProvider } from '@/components/user-methods';
import * as Font from 'expo-font';
import { Stack } from "expo-router";
import React, { useEffect, useState } from 'react';

export default function RootLayout() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Font.loadAsync({
                    'InstrumentSans-Medium': require('./../assets/fonts/InstrumentSans-Medium.ttf'),
                    //'NotoSans-Italic': require('./assets/fonts/NotoSans-MediumItalic.ttf')
                });
                //await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }
        prepare();

    }, []);
  
    if (!appIsReady) {
        return null;
    }

    return (
        <UserProvider>
            <Stack>
                <Stack.Screen name='status-page' options={{ headerShown: false }}/>
                <Stack.Screen name='index' options={{ headerShown: false }}/>
                <Stack.Screen name='add-group-form' options={{ headerShown: false }}/>
                <Stack.Screen name='detail-page' options={{ headerShown: false }}/>
                <Stack.Screen name='activity-detail-page' options={{ headerShown: false }}/>
                <Stack.Screen name='search-page' options={{ headerShown: false }}/>
                <Stack.Screen name='user-page' options={{ headerShown: false }}/>
                <Stack.Screen name='likes-page' options={{ headerShown: false }}/>
                <Stack.Screen name='join-requests-page' options={{ headerShown: false }}/>
                <Stack.Screen name='phone-number-page' options={{ headerShown: false }}/>
                <Stack.Screen name='members-page' options={{ headerShown: false }}/>
                <Stack.Screen
                    name="member-search"
                    options={{
                        presentation: "modal",
                        animation: "slide_from_bottom",
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="modify-phone-page"
                    options={{
                        presentation: "modal",
                        animation: "slide_from_bottom",
                        headerShown: false
                    }}
                />
            </Stack>
        </UserProvider>
    );
}
