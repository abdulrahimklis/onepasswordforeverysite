/**
 * Created by Tim on 12-2-2017.
 * 'Userdata' is in the browser's/app's memory and contains the user's sites-information as well as
 * any other data like configuration settings that the user can have set (none so far, june '17)
 *
 * UserData can be im- or exported to a local file, default named 'yourUserData.json'
 */

let polyglot = new Polyglot();
// import {en} from "./translations/en";
// import {fr} from "./translations/fr";
let en = {
    "OPFES_TITLE": "OPFES - One password for every site",
    "COPY_FILE": "Copy File",
    "DATA": "Data",
    "OVERWRITE_CURRENT_USERDATA": "This will overwrite your current userdata.",
    "LOADING_YOUR_DATAFILE": "Loading your datafile. Event's target is: %{file}",
    "DOWNLOAD_DATA": "This will copy the sites and their related properties to a file for you to store on your local drive"
};
let fr = {
    "OPFES_TITLE": "OPFES - Un mot de passe pour chaque site",
    "COPY_FILE": "Copier un fichier",
    "DATA": "Les données",
    "OVERWRITE_CURRENT_USERDATA": "Cela remplacera votre data actuelle.",
    "DOWNLOAD_DATA": "Cela copiera les sites et leurs propriétés connexes dans un fichier que vous devez stocker sur votre lecteur local"
};
let textstrings = {
    "OPFES_TITLE": "OPFES - Een wachtwoord voor iedere website",
    "COPY_FILE": "Kopieer het Bestand",
    "DATA": "Data",
    "OVERWRITE_CURRENT_USERDATA": "Dit overschrijft jouw userdata.",
    "DOWNLOAD_DATA": "Hiermee maak je een kopie naar je pc/telefoon/laptop met daarin al jouw userdata, waaronder jouw userid's en websites.",
};
polyglot.extend(textstrings);
// let lang:object;

interface IUserData {
    sites: Site[],
    // TODO, when we start using this for apps as well, add:
    // "app": App[],
}

const userDataDefaultFileName: string = "yourUserData.json";

class UserData implements IUserData {
    public get sites(): Site[] {
        return this._sites;
    }

    public set sites(value: Site[]) {
        this._sites = value;
    }

    constructor(private _sites: Site[]) {
        this._sites = _sites;
    }

    /**
     * This function gets called for every key/value pair in the object's result-string after it’s been JSON.parsed
     * This function turns the given result-string into a UserData object having valid Site objects instead of string-values
     *
     * @param key
     * @param value if this contains a stringified UserData-instance, a UserData-instance will get returned
     * @returns {Site[]|any}
     */
    static reviver(key, value): any {
        if (key !== "") {
            return value;
        }//@Todo: create a sanitizer for checking if each value has the format needed for reviving a UserData Object
        let sites: Site[] = []; //the target array of sites
        if (value !== '' && value !== null) {
            let sitesArray: String[] = value._sites; //the source array of sites
            if (sitesArray == undefined) {
                sitesArray = value.sites
            } //the source array of sites
            for (let key in sitesArray) {
                // let remark: string = (sitesArray[key]["remark"]) ? sitesArray[key]["remark"] : "asdf";
                let site: Site = new Site(
                    sitesArray[key]["domain"],
                    sitesArray[key]["userId"],
                    sitesArray[key]["salt"],
                    sitesArray[key]["sequenceNr"],
                    sitesArray[key]["maxPwdChars"],
                    sitesArray[key]["allowedSpecialCharacters"],
                    new Date(sitesArray[key]["lastUsed"]),
                    sitesArray[key]["remark"]
                );
                sites.push(site);
            }
        }
        return new UserData(sites);

        // TODO, when we start using this for apps as well, change this to:
        // return new UserData(sites, apps);
    }

    /**
     * This function retrieves the current userData from the localStorage.
     *
     * @returns {any} if the stored value can get revived, a UserData instance is returned, otherwise the value itself is returned
     */
    static retrieve() {
        let result = JSON.parse(localStorage.getItem("OPFES_UserData"), UserData.reviver);
        console.log(`
            Your localData is now retrieved from your browser's memory into Opfes' memory.
            This is called from:
        `);
        // console.trace();
        // if (result['_sites'].length === 0){
        // chrome.storage.local.get("_sites",function(){}); //NB: Asynchronous call!!
        // }
        return result;
    }

    /**
     * Store the userData to the LocalStorage, for using in the toolbar-form
     * and to chrome.storage.local for use in the popupform, which cannot access the LocalStorage
     */
    persist() {
        let stringifiedUserData: string = JSON.stringify(this);
        localStorage.setItem("OPFES_UserData", stringifiedUserData);
        chrome.storage.local.set(this); //Copied of the localStorage
        console.log(`Your localData is now updated to ${stringifiedUserData}.`);
    }

    /**
     * This function uploads the UserData from your local pc into memory
     */
    static upload(file: File) {
        let reader = new FileReader();
        reader.onload = function (e) {
            if(!window.confirm(`${polyglot.t("OVERWRITE_CURRENT_USERDATA")}`)){return}//Popup is part of a bugfix. See https://github.com/TimvanSteenbergen/onepasswordforeverysite/issues/51
            console.log(`${polyglot.t("LOADING_YOUR_DATAFILE", {file: e.target})}`);
            // todo cast e.target to its type: let data = (<FileReader>e.target).result;
            let dataString: string = (<FileReader>e.target).result;
            let userData: UserData = JSON.parse(dataString, UserData.reviver);
            let sites: Site[] = userData.sites;

            let dataTableHTML: string = `
                <table id='locallyStoredUserData' border='1px solid brown' style="background-color: red; color: white">
                    <thead>
                        <td>domain</td>
                        <td>userid</td>
                        <td>salt</td>
                        <td>seq.nr</td>
                        <td>#chars</td>
                        <td>allowed</td>
                        <td>used at</td>
                        <td>remark</td>
                    </thead>`;
            for (let site of sites) {
                dataTableHTML += `
                    <tr><td>${site.getDomain()}</td>
                                  <td>${site.getUserId()}</td>
                                  <td>${site.getSalt()}</td>
                                  <td>${site.getSequenceNr()}</td>
                                  <td>${site.getMaxPwdChars()}</td>
                                  <td>${site.getAllowedSpecialCharacters()}</td>
                                  <td>${site.getLastUsed().getFullYear()}-${site.getLastUsed().getMonth() + 1}-${site.getLastUsed().getDate()}</td>
                                  <td>${site.getRemark()}</td>
                               </tr>`;
            }
            dataTableHTML += '</table>';
            let localStoredUserDataElement = document.getElementById('OPFES_localStoredUserData');
            localStoredUserDataElement.innerHTML = dataTableHTML;
            userData.persist();
        };

        reader.readAsText(file);//attempts to read the file in question.
        // console.log('The File ' + file.name + ' is now uploaded to your localData');
    }

    /**
     * This function downloads the UserData to your local pc
     */
    static download() {
        let userData: UserData = UserData.retrieve();
        //@todo encrypt this exportData

        if (confirm(`${polyglot.t("DOWNLOAD_DATA")}.`)) {
            let data = `text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(userData))}`;
            let downloadSitesLink = document.createElement('a');
            downloadSitesLink.href = `data:${data}`;
            downloadSitesLink.download = "data.json";
            downloadSitesLink.click();
            console.log(`You have downloaded the userdata containing your user-id's but not your passwords.`)
        }
    }

    /**
     * This function downloads the UserData to your local pc
     */
    static downloadPasswords() {
        let document = self.document
            // only get URL when necessary in case Blob.js hasn't defined it yet
            , get_blob = function () {
                return self.Blob;
            };
        let userData: UserData = UserData.retrieve();
        let sites: Site[] = userData.sites;
        let sitePassword: string;
        let passwordData: {site: Site, sitePassword: string}[] = [];
        let yourOnlyPassword = (<HTMLInputElement>self.document.getElementById('OPFES_InputAppPassword')).value;
        if (!yourOnlyPassword) {
            alert('First enter your password in the field "Your only password".');
            return;
        }
        if (confirm(`This will give you a file containing your user-id and password for the sites that you have visited.
        This is useful for your own peace of mind and if you need your password without having OPFES helping you.
        On the other hand: downloading this file is a security-risc.
        Anyone stealing this file can use your user-id\'s and passwords on your sites.`)
        ) {
            let BB = get_blob();
            for (let site of sites) {
                sitePassword = SiteService.getSitePassword(site, yourOnlyPassword);
                passwordData.push({site, sitePassword});
            }
            let exportData: string = JSON.stringify(passwordData);
            saveAs(
                new BB([exportData], {type: "text/plain;charset=" + document.characterSet}),
                userDataDefaultFileName,
                true
            );

            alert(`This site is in your hands now, containing your user-id's and passwords'. Keep it safe.`);
            console.log(`You have downloaded the userdata containing your user-id's and passwords.`)
        }
        //@todo encrypt this exportData
    }
}
