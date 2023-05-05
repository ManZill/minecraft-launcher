import { randomUUID } from "crypto";
import { net } from "electron";

export function getAuthorizationCookie(jsonData: string) {
    let json = JSON.parse(jsonData);
    return {
        url: "https://authserver.mojang.com",
        name: "authorization",
        value: `{
            accessToken: ${json['accessToken']},
            clientToken: ${json['clientToken']},
            selectedProfile: ${json['selectedProfile']},
            requestUser: ${true}
        }`
    };
}

export const sendRequest = async (username: string, password: string) =>
    new Promise((resolve, reject) => {
        let url = "authserver.mojang.com";
        let request = net.request({
            method: 'POST',
            protocol: 'https:',
            hostname: url,
            path: '/authenticate',

        })
        request.on('response', (response) => {
            let rawData: any;
            response.on('data', (data)=>{
                rawData = data;
            });
            response.on('end', () => {
                try {
                    const data = rawData
                    if(response.statusCode !== 200) {
                        return resolve([data, response.statusCode])
                    }
                    resolve([data, response.statusCode])
                } catch(e) {
                    reject(e)
                }
            });
        });

        request.write(GetAuthenticationBody(username, password));

        request.on('error', reject);
        request.end();
    });

function GetAuthenticationBody(username : string, password : string) {
    let token = randomUUID();
    return JSON.stringify({
        "agent": {                              // defaults to Minecraft
            "name": "Minecraft",                // For Mojang"s other game Scrolls, "Scrolls" should be used
            "version": 1                        // This number might be increased
                                                // by the vanilla client in the future
        },
        "username": username,                   // Can be an email address or player name for
                                                // unmigrated accounts
        "password": password,
        "clientToken": token,                   // optional
        "requestUser": true                     // optional; default: false; true adds the user object to the response
    });
}