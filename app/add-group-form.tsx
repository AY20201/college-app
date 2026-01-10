import Entypo from '@expo/vector-icons/Entypo';
import { Checkbox } from 'expo-checkbox';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function AddGroupForm() {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [isSearchable, setIsSearchable] = useState(true);

    const [isNameFocused, setIsNameFocused] = useState(true);
    const [isDescFocused, setIsDescFocused] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const descInputRef = useRef<TextInput>(null);

    const { groupCount } = useLocalSearchParams<{
        groupCount: string
    }>();

    useEffect(() => {
        const keyboardListenerDidShow = Keyboard.addListener(
            'keyboardDidShow',
            () => { setKeyboardVisible(true); }
        );
        const keyboardListenerDidHide = Keyboard.addListener(
            'keyboardDidHide',
            () => { setKeyboardVisible(false); }
        );
        return () => {
            keyboardListenerDidShow.remove();
            keyboardListenerDidHide.remove();
        };
    }, [])

    function submitGroup() {
        if(groupName) {
            console.log("Group submitted")
            router.navigate({ 
                pathname: '/status-page',
                params: { name: groupName, desc: description, isPrivate: String(isPrivate), isSearchable: String(isSearchable), groupCount: groupCount }
            });
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <ScrollView style={styles.base} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginLeft: -2}} onPress={() => router.back()}>
                        <Entypo name="chevron-left" size={35} color='rgb(211, 211, 211)' />
                        <Text style={[styles.text, { fontSize: 40 }]}>Add group</Text>
                    </TouchableOpacity>
                    <View style={styles.inputView}>
                        <Text style={styles.inputLabel}>Group name</Text>
                        <TextInput
                            style={isNameFocused ? [styles.textInput, styles.focusedTextInput] : styles.textInput}
                            value={groupName}
                            onChangeText={setGroupName}
                            placeholder="Enter your group's name here"
                            placeholderTextColor={'rgba(211, 211, 211, 0.45)'}
                            autoFocus={true}
                            onFocus={() => setIsNameFocused(true)}
                            onBlur={() => setIsNameFocused(false)}
                            onSubmitEditing={() => {
                                if(descInputRef.current){
                                    descInputRef.current.focus(); //refocus input field
                                }
                            }}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput
                            style={[styles.textInput, isDescFocused ? styles.focusedTextInput : null, { height: 200 }]}
                            value={description}
                            ref={descInputRef}
                            onChangeText={setDescription}
                            placeholder="Describe your group here 200 characters max)"
                            placeholderTextColor={'rgba(211, 211, 211, 0.45)'}
                            multiline={true}
                            maxLength={200}
                            onFocus={() => setIsDescFocused(true)}
                            onBlur={() => setIsDescFocused(false)}
                            onSubmitEditing={() => {
                                if(descInputRef.current){
                                    descInputRef.current.blur(); //refocus input field
                                }
                            }}
                        />
                    </View>
                    <View style={styles.inputView}>
                        <View style={styles.checkboxView}>
                            <Checkbox style={{borderWidth: 3}} value={isPrivate} onValueChange={() => { if(isSearchable) setIsPrivate(!isPrivate) }} color={'rgb(180, 180, 180)'}/>
                            <Text style={styles.inputLabel}>Request to join only</Text>
                        </View>
                        <View style={styles.checkboxView}>
                            <Checkbox style={{borderWidth: 3}} value={!isSearchable} onValueChange={() => { 
                                setIsSearchable(!isSearchable); 
                                if(isSearchable){ //this will be true when checking the box
                                    setIsPrivate(true);
                                }
                                }} color={'rgb(180, 180, 180)'}/>
                            <Text style={styles.inputLabel}>Hide from search page</Text>
                        </View>
                    </View>
                    {/* <TouchableOpacity style={styles.submitButton} onPress={() => router.back()}>
                        <Text style={styles.submitButtonText}>Back to groups</Text>
                    </TouchableOpacity> */}
                </ScrollView>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    <TouchableOpacity style={styles.addButton} onPress={() => submitGroup()}>
                        <Text style={styles.text}>{"Create group"}</Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(0, 105, 62)'
    },
    base: {
        flex: 1,
        marginHorizontal: 10
    },
    text: {
        color: 'rgb(211, 211, 211)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium' //add a font later, maybe InstrumentSans?
    },
    header: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textInput: {
        height: 60,
        margin: 6,
        borderWidth: 3,
        borderColor: 'rgb(180, 180, 180)',
        color: 'rgb(180, 180, 180)',
        borderRadius: 3,
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.04)'
    },
    focusedTextInput: {
        borderColor: 'rgb(255, 255, 255)',
        color: 'rgb(211, 211, 211)'
    },
    inputLabel: {
        margin: 6,
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        color: 'rgb(180, 180, 180)',
    },
    inputView: {
        marginVertical: 15
    },
    checkboxView: {
        margin: 6,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButton: {
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)',
        marginBottom: 15,
        marginHorizontal: 15,
        marginTop: 15
    },
});

//'rgb(18, 49, 43)'