import { app, BrowserWindow, ipcMain, session } from "electron";
import * as path from "path";

import { getAuthorizationCookie, sendRequest } from "./authorization/submit";

function createWindow() {
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            contextIsolation: false,            // protect against prototype pollution
            preload: path.join(__dirname, "preload.js"),
        },
    })

    mainWindow.loadFile(path.join(__dirname, "../index.html")).then();
}

app.whenReady().then(() => {
    createWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    session.defaultSession.cookies.get({name: "authorization"})
        .then((cookies: any) => {
            console.log(cookies)
        }).catch((error: any) => {
        console.log(error)
    });
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

ipcMain.on("authorization:submit", async (event: any, username: string, password: string) => {
    let rawRelease: any;
    let rawError: any;

    await sendRequest(username, password)
        .then((release: any) => rawRelease = release)
        .catch((error: any) => rawError = error)

    let returnValue: any;

    if (rawRelease !== undefined) {
        let [jsonData, statusCode] = rawRelease;

        if (jsonData != undefined && statusCode === 200) {
            let cookie = getAuthorizationCookie(jsonData);
            session.defaultSession.cookies.set(cookie)
                .then(() => {
                    // success
                }, (error: any) => {
                    console.error(error)
                })
        }
        returnValue = statusCode;
    } else {
        rawError = new Error(rawError);
        console.log(rawError);
        returnValue = rawError;
    }
    event.sender.send("authorization:response", returnValue);
});

