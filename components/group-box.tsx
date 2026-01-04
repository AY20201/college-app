import { addJoinRequest } from "@/app/join-requests-page";
import { SearchGroup } from "@/app/search-page";
import { ActivityRequest, Group } from "@/app/status-page";
import AntDesign from '@expo/vector-icons/AntDesign';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useUser } from "./user-methods";

type AddActivityCallbackType = (personName: string, activity: string, location: string, groupId: string) => Promise<string>;

type EmptyActivityBoxProps = {
    addActivity: AddActivityCallbackType;
    addingCallback : React.Dispatch<React.SetStateAction<boolean>>;
    setNewActivity : (request: ActivityRequest) => void;
    groupId: string;
};

type GroupBoxProps = {
    group: Group;
    addActivity: AddActivityCallbackType;
};

type SearchGroupBoxProps = {
    group: SearchGroup,
};

function formatTime(time: string){
    const timeComponents = time.split(":");
    let amOrPm = 'AM';
    let hours = parseInt(timeComponents[0]);
    if(hours >= 12) amOrPm = 'PM';
    if(hours >= 13) hours -= 12;
    if(hours === 0) hours = 12;
    return `${hours}:${timeComponents[1]} ${amOrPm}`;
}

//Box with no text that pops up when you press add activity, will submit to database after pressing enter
function EmptyActivityBox({ addActivity, addingCallback, setNewActivity, groupId }: EmptyActivityBoxProps){
    //() => addActivity("John", "Lunch", "Collis", id) call this function when enter key is pressed
    const [textValue, setTextValue] = useState('');
    const [activityDesc, setActivityDesc] = useState('');
    const [editingLocation, setEditingLocation] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const translateX = useSharedValue(0);
    const slideLength = 240;

    const { getUserProperty } = useUser();

    const slideStyle = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: translateX.value }],
        };
    });

    const submitText = () => {
        if(editingLocation){
            submitActivity();
            return;
        }
        setActivityDesc(textValue); //store the current text value
        setTextValue(''); //reset input field
        if(inputRef.current){
            inputRef.current.focus(); //refocus input field
        } 
        translateX.value = withTiming(-slideLength, { duration: 300, easing: Easing.out(Easing.exp) });
        setEditingLocation(true); //switch so input field is editing location instead
    }

    //called when pressing enter in the text field after filling in an activity
    const submitActivity = () => {
        const now = new Date();
        const currentTime = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
        const username = getUserProperty("name");
        const email = getUserProperty("email");
        const userId = getUserProperty("id");

        //textValue is location
        //addActivity adds activity to database, setNewActivity adds it to local array
        addActivity(userId, activityDesc, textValue, groupId).then((requestId) => {
            setNewActivity({ userId: userId, name: username, email: email, phoneNumber: "", hideNumber: false, activity: activityDesc, location: textValue, groupId: groupId, requestId: requestId, timePosted: currentTime, likes: [] });
            //make sure add local activity is called after adding callback is complete, that is probably the animation issue
        });
    };

    return (
        <View style={styles.requestBox}>
            <View style={{width: 240, flexDirection: 'row', overflow: 'hidden'}}>
                <Animated.View style={slideStyle}>
                    <TextInput
                        style={[styles.activityText, { width: 240 }]}
                        value={textValue}
                        onChangeText={setTextValue}
                        placeholder={"What are you up to?"}
                        placeholderTextColor={'rgb(70, 70, 70)'}
                        onSubmitEditing={submitText}
                        autoFocus={true}
                        submitBehavior="submit"
                    />
                </Animated.View>
                <Animated.View style={slideStyle}>
                    <TextInput
                        style={[styles.activityText, { width: 240 }]}
                        ref={inputRef}
                        value={textValue}
                        onChangeText={setTextValue}
                        placeholder={"Any idea where?"}
                        placeholderTextColor={'rgb(70, 70, 70)'}
                        onSubmitEditing={submitText}
                        submitBehavior="submit"
                    />
                </Animated.View>
            </View>
            <TouchableOpacity onPress={() => addingCallback(false)}>
                <AntDesign name="close" size={30} color="rgb(70, 70, 70)" />
            </TouchableOpacity>
        </View>
    );
}


//Dark green box that contains activity request name, activity and time
function ActivityBox({ request } : { request: ActivityRequest }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const { getUserProperty, likeActivity } = useUser();

    const timePosted = formatTime(request.timePosted);

    useEffect(() => {
        const userId = getUserProperty("id");
        if(userId != null){
            setIsLiked(request.likes.includes(userId));
        }
        setLikeCount(request.likes.length);
    }, [])
    
    return (
        <View style={styles.requestBox}>
            <TouchableOpacity style={{width: 250}} onPress={() => router.navigate({ 
                    pathname: '/activity-detail-page',
                    params: { requestStr: JSON.stringify(request), userId: getUserProperty("id"), time: timePosted }
                })}>
                <Text style={styles.activityText}>{request.name} is down for {request.activity}!</Text>
                <Text style={styles.timeText}>{timePosted}</Text>
            </TouchableOpacity>
            {/* Like button with like count */}
            <View style={{flexDirection: 'column', alignItems: 'center'}}>
                <TouchableOpacity onPress={() => {
                    setIsLiked(true);
                    setLikeCount(likeCount + 1);
                    likeActivity(request.requestId);
                }} disabled={isLiked}>
                    {/* The like icon will be the outline only "like" icon when not liked yet, it will be the filled in "dislike" icon flipped vertically when liked */}
                    <AntDesign name={isLiked ? "dislike" : "like"} style={isLiked ? {transform: [{scaleY: -1}]} : {}} size={40} color='rgb(111, 111, 111)' />
                </TouchableOpacity>
                <TouchableOpacity style={{paddingHorizontal: 10}} onPress={() => router.navigate({ pathname: '/likes-page', params: { requestId: request.requestId, groupId: request.groupId }})}>
                    {likeCount > 0 && <Text style={styles.timeText}>{likeCount}</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

//Light green box that contains group name, also renders activity requests
export default function GroupBox({ group, addActivity }: GroupBoxProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [localActivityRequests, setLocalActivityRequests] = useState<ActivityRequest[]>([]);
    const [newActivityRequest, setNewActivityRequest] = useState<ActivityRequest>();
    //const [personNameAbbreviated, setPersonNameAbbreviated] = useState("");
    const contentHeight = useSharedValue(111);
    const currentHeight = useSharedValue(0);

    let animatedStyle = useAnimatedStyle(() => ({
        height: currentHeight.value
    }), [isAdding]);

    useEffect(() =>
    {
        setLocalActivityRequests(group.activityRequests);
        //const nameSplit = personName.split(" ");
        //Turns something like "Alex Young" into "Alex Y"
        //setPersonNameAbbreviated(nameSplit[0] + (nameSplit.length > 1 ? " " + nameSplit[1].charAt(0) : ""));
        //setPersonNameAbbreviated(nameSplit[0] + (nameSplit.length > 1 ? " " + nameSplit[1].charAt(0) : ""));
    }, []);

    useEffect(() => {
        if(isAdding){
            currentHeight.value = 0;
            currentHeight.value = withTiming(contentHeight.value, { duration: 250 });
        } else {
            currentHeight.value = withTiming(0, { duration: 250 });
        }
    }, [isAdding]);

    function showInput(){
        if(newActivityRequest){
            setLocalActivityRequests([...localActivityRequests, newActivityRequest]);
            setNewActivityRequest(undefined);
                
            //reset animation
            currentHeight.value = 0;
            currentHeight.value = withTiming(contentHeight.value, { duration: 250 });
        } else {
            setIsAdding(true);
        }
    }

    return (
        <View>
            <View style={styles.groupBox}>
                <TouchableOpacity onPress={() => router.navigate({ 
                    pathname: '/detail-page',
                    params: { name: group.name, desc: group.description, isPrivate: String(group.isPrivate), isSearchable: String(group.isSearchable), owner: group.owner, id: group.id, isJoined: "true", returnPath: '/status-page' }
                })}>
                    <View style={{width: 200}}>
                        <Text style={styles.text}>{group.name}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.requestButton} onPress={() => showInput()}>
                    <Text style={styles.requestButtonText}>Add activity</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={localActivityRequests}
                renderItem={({ item }) => <ActivityBox request={item}/>}
            />
            <Animated.View style={[animatedStyle, { overflow: 'hidden' }]}>
                {isAdding &&
                //temporary activity box with a text input field that will be filled in by the user
                    (newActivityRequest ?
                        <ActivityBox request={newActivityRequest}/>
                        :
                        <EmptyActivityBox addActivity={addActivity} addingCallback={setIsAdding} setNewActivity={setNewActivityRequest} groupId={group.id}/>
                    )
                }
            </Animated.View>
        </View>
    );
}

//Group box that shows up in search page with the "Join group" button
export function SearchGroupBox({ group } : SearchGroupBoxProps){
    const [isJoined, setIsJoined] = useState(false);
    const [requestStatus, setRequestStatus] = useState<boolean>(false);

    const { addUserGroup, getUserProperty } = useUser();

    useEffect(() =>
    {
        setIsJoined(group.isJoined);
        if(group.isPrivate){
            setRequestStatus(group.isJoined ? true : group.requestStatus);
        }
    }, []);

    return (
        <View>
            <View style={styles.groupBox}>
                <TouchableOpacity onPress={() => router.navigate({ 
                    pathname: '/detail-page',
                    params: { name: group.name, desc: group.description, isPrivate: String(group.isPrivate), isSearchable: "true", id: group.id, owner: group.owner, isJoined: String(isJoined), returnPath: '/search-page' }
                })}>
                    <View style={{width: 200}}>
                        <Text style={styles.text}>{group.name}</Text>
                    </View>
                </TouchableOpacity>
                { group.isPrivate ?
                <TouchableOpacity style={styles.requestButton} onPress={() => { 
                        setRequestStatus(true);
                        addJoinRequest(group.id, getUserProperty("id"), getUserProperty("name"));
                    }} disabled={requestStatus}>
                    <Text style={styles.requestButtonText}>{requestStatus ? (isJoined ? "Joined" : "Requested") : "Request"}</Text>
                </TouchableOpacity>
                :
                <TouchableOpacity style={styles.requestButton} onPress={() => { 
                        setIsJoined(true);
                        addUserGroup(group.id);
                    }} disabled={isJoined}>
                    <Text style={styles.requestButtonText}>{isJoined ? "Joined" : "Join group"}</Text>
                </TouchableOpacity>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    groupBox: {
        width: '100%',
        //height: 100,
        backgroundColor:'rgb(0, 105, 62)',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal: 25,
        paddingVertical: 20,
        alignItems: 'center',
        color: 'rgb(255, 255, 255)'
    },
    requestButton: {
        height: 50,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 3,
        borderColor: 'rgb(211, 211, 211)', 
    },
    requestButtonText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 16,
        fontFamily: 'InstrumentSans-Medium'
    },
    requestBox: {
        width: 'auto',
        //height: 90,
        marginHorizontal: 10,
        backgroundColor:'rgb(18, 49, 43)',
        borderRadius: 10,
        marginBottom: 10,
        flexDirection:'row',
        justifyContent:'space-between',
        paddingVertical: 20,
        paddingHorizontal: 25,
        minHeight: 101,
        alignItems: 'center',
        color: 'rgb(255, 255, 255)',
    },
    text: {
        color: 'rgb(211, 211, 211)',
        fontSize: 25,
        fontFamily: 'InstrumentSans-Medium'
    },
    activityText: {
        color: 'rgb(211, 211, 211)',
        fontSize: 18,
        fontFamily: 'InstrumentSans-Medium'
    },
    timeText: {
        color: 'rgb(111, 111, 111)',
        fontSize: 15,
        fontFamily: 'InstrumentSans-Medium'
    }
});