import { AntDesign } from '@expo/vector-icons';
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const deviceWidth = Dimensions.get("window").width;
//const deviceHeight = Dimensions.get("window").height;

export function InfoPanel({ closePanel }: { closePanel: () => void }){
    return (
        <View style={styles.overlay}>
            <View style={styles.panel}>
                <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
                    <AntDesign name="close" size={35} color="gray"/>
                </TouchableOpacity>
                <ScrollView style={{flex: 1, marginTop: 5}}>
                    <Text style={styles.header}>Welcome to DSocial!</Text>
                    <Text style={styles.paragraph}>
                    As a first year in college, making friends and seeing them on a regular basis is hard.
                    </Text>
                    <Text style={styles.paragraph}>
                    That's why I created DSocial, an app designed to make hanging out with friends (and meeting new people) easier. DSocial allows anyone on campus to create virtual groups that 
                    their friends, teammates, classmates, or fellow club members can join. Members of these groups can post activity plans that any other group members can see
                    and respond to with a virtual "thumb-up" if they are interested.
                    </Text>
                    <Text style={styles.paragraph}>
                    Likes are visible to anyone in the group, and depending on individual privacy settings, group members can message some or all activity "likers" via SMS, 
                    if you haven't shared contact info already. Activities obviously don't apply to lunch only, either. You can post about absolutely anything, 
                    from workouts and hikes to games of pool in Collis or your plans to watch an upcoming football game.
                    </Text>
                </ScrollView>
            </View>
        </View>
    );
}
  
const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust transparency here
        justifyContent: 'center',
        alignItems: 'center',
    },
    panel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        marginVertical: 120,
        marginHorizontal: 30,
        paddingBottom: 33,
        backgroundColor: 'rgb(18, 49, 43)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    paragraph: {
        fontSize: 20,
        marginTop: 20,
        marginBottom: 0,
        color: 'rgb(211, 211, 211)',
        fontFamily: 'InstrumentSans-Medium',
        marginHorizontal: 33
    },
    header: {
        fontSize: 26,
        marginTop: 0,
        marginHorizontal: 33,
        color: 'rgb(211, 211, 211)',
        fontFamily: 'InstrumentSans-Medium',
        textAlign: 'left'
    },
    closeButton: {
        //backgroundColor: 'rgba(240, 240, 240)',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginTop: 10,
        marginRight: 10
        //top: 95,
        //right: 15
    },
    image: {
        marginHorizontal: 33,
        width: deviceWidth - 60 - 66,
        height: undefined,
        aspectRatio: 1179 / 1630,
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 1.0,
        borderColor: 'rgb(200, 200, 200)'
    },
    caption: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 0,
        color: 'rgb(211, 211, 211)',
        fontFamily: 'InstrumentSans-Medium',
        fontSize: 13,
    }
});