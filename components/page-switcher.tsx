import { StyleSheet, View } from "react-native";

export default function PageSwitcher(){
    return (
        <View style={styles.footer}>

        </View>
    )
}

const styles = StyleSheet.create({
    footer: {
        height: 100,
        marginHorizontal: 10,
        marginTop: -7,
        borderRadius: 10,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor: 'rgb(18, 49, 43)',
    }
});