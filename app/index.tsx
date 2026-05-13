import * as WebBrowser from 'expo-web-browser';
import LoginPage from "./login-page";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  
    return (
        <LoginPage/>
    );
}