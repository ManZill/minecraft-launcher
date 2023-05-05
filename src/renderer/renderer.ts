const { ipcRenderer } = require('electron');

document.getElementById("submit_button")?.addEventListener("click", () => {
    let mailInput = <HTMLInputElement>document.getElementById("mail_input");
    let passwordInput = <HTMLInputElement>document.getElementById("password_input");
    ipcRenderer.send("authorization:submit", mailInput.value, passwordInput.value);
    ipcRenderer.on("authorization:response", (event: any, response: any) => {
        console.log(response);
    })
});