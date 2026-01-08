import { UserData, storeUserData, useUser } from '@/components/user-methods';
import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PhoneInput from 'react-native-phone-number-input';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function PhoneNumberPage(){
    const [phoneNumberText, setPhoneNumberText] = useState("")
    const [isTextFocused, setIsTextFocused] = useState(true);
    const [showNotValid, setShowNotValid] = useState<boolean | undefined>(false);
    const phoneInput = useRef<PhoneInput>(null);

    const { userText, modify, userId } = useLocalSearchParams<{
        userText: string
        modify: string
        userId: string
    }>();

    const { setUser, setUserProperty } = useUser()
    const user : UserData = userText ? JSON.parse(userText) : {};

    const modifyPhoneNumber = async(phoneNumber : string) => {
        try {
            console.log("Modifying phone number for: " + userId);
            const res = await fetch("http://127.0.0.1:5000/modify_phone_number", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "userId": userId, "phoneNumber": phoneNumber })
            });
            const json = await res.json();
            console.log(json);
        }  catch (err) {
            console.error("Request failed:", err);
        }
    }

    function submitNumber(){
        const checkValid = phoneInput.current?.isValidNumber(phoneNumberText);
        if(phoneNumberText && !checkValid){
            setShowNotValid(true);
            return;
        }

        if(modify){
            setUserProperty("phoneNumber", phoneNumberText);
            modifyPhoneNumber(phoneNumberText).then(() => router.back())
        } else {
            user.phoneNumber = phoneNumberText;
            storeUserData(user);
            setUser(user);

            router.navigate({ 
                pathname: '/status-page',
                //params: { username: user.name }
            });
        }
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.root}>
                <KeyboardAvoidingView style={[styles.base, modify ? {justifyContent: 'flex-start'} : null]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    { modify && <View style={{marginTop: 20, marginBottom: 15}}>
                        <AntDesign name="close" size={35} color="rgb(211, 211, 211)" style={{alignSelf: 'flex-end'}} onPress={() => router.back()}/>
                    </View> }
                    <View>
                        <Text style={[styles.labelText, { fontSize: 30, marginBottom: 30 }]}>What is your phone number?</Text>
                        {/* <TextInput
                            style={[styles.textInput, isTextFocused ? { borderColor: 'rgb(255, 255, 255)' } : null]}
                            value={phoneNumberText}
                            onChangeText={setPhoneNumberText}
                            placeholder='#'
                            placeholderTextColor={'rgba(211, 211, 211, 0.45)'}
                            onFocus={() => setIsTextFocused(true)}
                            onBlur={() => setIsTextFocused(false)}
                            autoFocus={true}
                            onSubmitEditing={() => submitNumber()}
                            keyboardType='numeric'
                        /> */}
                        <PhoneInput
                            ref={phoneInput}
                            defaultValue={phoneNumberText}
                            placeholder='#'
                            layout='second'
                            onChangeText={setPhoneNumberText}
                            containerStyle={[styles.inputContainer, isTextFocused ? { borderColor: 'rgb(255, 255, 255)' } : null]}
                            textInputStyle={styles.inputText}
                            textContainerStyle={styles.inputTextContainer}
                            codeTextStyle={styles.inputText}
                            defaultCode='US'
                            autoFocus={true}
                            renderDropdownImage={
                                <Entypo name="chevron-down" size={20} color="rgb(180, 180, 180)" />
                            }
                            textInputProps={{
                                selectionColor: "rgb(180, 180, 180)", 
                                placeholderTextColor: 'rgba(211, 211, 211, 0.45)',
                                onFocus: () => { setIsTextFocused(true) },
                                onBlur: () => { setIsTextFocused(false) },
                                onSubmitEditing: () => { submitNumber() },
                                keyboardType: "numeric"
                            }}
                        />
                        { showNotValid &&
                            <Text style={styles.notValidText}>Number not valid</Text>
                        }
                        <Text style={[styles.labelText, { marginTop: 30, color: 'rgb(180, 180, 180)' }]}>
                            This number will only be used so others 
                            can text you about planned activities. It is completely optional and can be removed from your
                            profile at any time.
                        </Text>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', marginTop: 50}} onPress={() => submitNumber()}>
                            <View>
                                <Text style={[styles.labelText, { fontSize: 20, textAlign: 'right' }]}>{modify ? "Add to profile" : "Finish sign in"}</Text>
                                <Text style={[styles.labelText, { fontSize: 18, color: 'rgba(255,255,255,0.5)', textAlign: 'right' }]}>{"(or press to skip)"}</Text>
                            </View>
                            <Entypo name="chevron-right" size={20} color='rgb(211, 211, 211)' />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
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
        marginHorizontal: 20
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
    labelText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    footerText: {
        color: 'rgba(211, 211, 211, 0.5)',
        fontSize: 20,
        marginBottom: 20,
        fontFamily: 'InstrumentSans-Medium',
        textAlign: 'center'
    },
    notValidText: {
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        color: 'rgb(245, 32, 32)',
        textAlign: 'center'
    },
    textInput: {
        height: 60,
        marginVertical: 6,
        borderWidth: 3,
        borderColor: 'rgb(180, 180, 180)',
        color: 'rgb(180, 180, 180)',
        borderRadius: 3,
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
        padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.04)'
    },
    inputContainer: {
        height: 65,
        marginVertical: 6,
        borderWidth: 3,
        borderColor: 'rgb(180, 180, 180)',
        borderRadius: 3,
        //padding: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        width: '100%',
        maxWidth: 400
    },
    inputTextContainer: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
    },
    inputText: {
        color: 'rgb(180, 180, 180)',
        fontSize: 20,
        fontFamily: 'InstrumentSans-Medium',
    },
    countryPicker: {
        color: 'rgb(180, 180, 180)',
    }
});