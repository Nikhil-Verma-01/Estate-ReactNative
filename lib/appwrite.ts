import {Account, Avatars, Client, OAuthProvider} from "react-native-appwrite";
import * as Linking from 'expo-linking';
import {openAuthSessionAsync} from 'expo-web-browser';

export const config = {
    platform: 'com.nik.estate',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!)

export const avatar = new Avatars(client);
export const account = new Account(client); 

export async function login() {
    try {
       const redirectUri = Linking.createURL('/');

       const response = await account.createOAuth2Token(
        OAuthProvider.Google, 
        redirectUri
       )

       if(!response){
        console.error("Failed to get OAuth2 token response");
        throw new Error('Failed to login: No response from OAuth2 token creation');
        }

       //!Sometimes you are on moblie application and accidently you find yourself of moblie browser within the pp
       const browserResult = await openAuthSessionAsync(
        response.toString(), //** This response from Google
        redirectUri
       )

       console.log("Browser session result type:", browserResult.type);

       if(browserResult.type !== 'success'){
        console.error("Browser session failed:", browserResult);
        throw new Error('Failed to login');
        }

       const url = new URL(browserResult.url);
       console.log("Callback URL received:", url.toString());

       const secret= url.searchParams.get('secret')?.toString();
       const userId = url.searchParams.get('userId')?.toString();

       console.log("Extracted UserId:", userId);
       console.log("Secret extracted:", secret ? "Yes (value hidden)" : "No");

       if(!secret || !userId){
        console.error("Missing secret or usreId in callback URL");
        throw new Error('Failed to login: Missing authentication parameters');
       }
       console.log("Creating session with userId and secret...");

       const session = await account.createSession(userId!, secret);

       if(!session) throw new Error('Failed to create a session')

        return true;

    } catch (error) {
        console.error("Login process failed with error", error);
        if(error instanceof Error){
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return false; 
    }
}

export async function logout(){
    try {
        console.log("Attempting to logout...");
        await account.deleteSession('current');
        console.log("Logout successfully");
        return true;
    } catch (error) {
        console.error("Logout failed:", error);
        return false;
    }
}

export async function getCurrentUser(){
    try {
        console.log("Fetching current user...");
        const response = await account.get();
        console.log("Current user fetch response:", response ? "Successful" : "Failed");

        if(response.$id){
             console.log("Generating avatar for user:", response.name);
            const userAvatar = avatar.getInitials(response.name);

            return{
                ...response,
                avatar: userAvatar.toString(),
            }
        }
        return response;
    } catch (error) {
        console.error("Failed to get current user:", error);
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 401) {
                console.log("User not authenticated");
            }
        }
        return null;
    }
}
