/**
 * Created by Tim van Steenbergen on 21-1-2017.
 */
// declare function SHA512(string): string;
let a: number = 1;
///<reference path="chrome/index.d.ts"/>

document.addEventListener('DOMContentLoaded', function () {

    const specialCharacters: string[] = ["/", "~", "@", "#", "%", "^", "(", ")", "_", "+", "-", "=", ".", ":", "?", "!", "{", "}"];

    let userData: UserData = JSON.parse(localStorage.getItem("OPFES_UserData"), UserData.reviver);
    if (userData.sites.length === 0) { //then show the Upload-button
        console.log(`Your userData in not yet in the browsers memory.`);
    } else { //then show the userData in the popup screen
        console.log(`Your userData is in the browser's memory.`);
        // document.getElementById('OPFES_InputGetUserData').hidden;
        OPFES_WorkWithUserData(userData);
    }

    /**
     * This function checks the characters input by the user as one of the AllowedSpecialCharacters.
     */
    function inputValidationForAllowedSpecialCharacters() {
        let inputValue: String = this.value;
        let letter:string = ``;
        for (letter of inputValue){
            if (specialCharacters.indexOf(letter) === -1){
                alert(`You tried to add a '${letter}', but the only possible characters in this field are ${specialCharacters}`);
                this.value = this.attributes['value'].value;
                return;
            }
        }
    }
    (<HTMLInputElement>document.getElementById('OPFES_InputAllowedSpecialCharacters')).addEventListener('keyup', function () {
        inputValidationForAllowedSpecialCharacters.call(this);
    });
    (<HTMLInputElement>document.getElementById('OPFES_InputAppPasswordShowHide')).addEventListener('click', function () {
        let elementId = this.id.substr(0, this.id.length - 8);
        let elementToToggle = document.getElementById(elementId);
        if (this.value == 'Show') {
            elementToToggle.setAttribute('type', 'text');
            this.value = 'Hide '
        } else {
            elementToToggle.setAttribute('type', 'password');
            this.value = 'Show'
        }
    });

    /**
     * This links the UserData-upload function to the export button
     */
    document.getElementById("OPFES_CopyDiskToLocalStorageButton").addEventListener("change", function (event) {
        event.preventDefault();
        UserData.upload((<HTMLInputElement>this).files[0]);
    }, false);

    /**
     * This links the UserData-download function to the export button
     */
    document.getElementById("OPFES_CopyLocalStorageToDiskButton").addEventListener("click", function (event) {
        event.preventDefault();
        UserData.download();
    }, false);

    /**
     * This links the UserData-download function to the export button
     */
    document.getElementById("OPFES_ChangeLanguageToFranceButton").addEventListener("click", function (event) {
        event.preventDefault();
        // UserData.changeLanguage();
    }, false);

    /**
     * This links the Password-download function to the export button
     */
    document.getElementById("OPFES_CopyPasswordsToDiskButton").addEventListener("click", function (event) {
        event.preventDefault();
        UserData.downloadPasswords();
    }, false);
}, false);

let OPFES_WorkWithUserData = function (userData: UserData) {
    console.log('addEventListener gestart en zo, userdata\'s eerste domein is ' + userData.sites[0].getDomain());

    showTheLocallyStoredData(userData, 5);
    setValueForElementDomain();
    function setValueForElementDomain() {
        let customerBrowser = get_browser();
        let myBrowser;
        if (customerBrowser.name === 'Chrome') {
            myBrowser = chrome;
        } else {
            myBrowser = browser;
        }
        myBrowser.tabs.query({active: true}, function (tabs) {
            let ourPopup = document;
            let domain = SiteService.getDomain(tabs[0].url);
            let domainElement = ourPopup.getElementById('OPFES_InputDomain');
            domainElement.setAttribute('value', domain);
            setValueForElements(domain);

            function setValueForElements(domain) {
                let userData = UserData.retrieve();
                let sites = userData.sites;
                for (let site of sites) {
                    if (site.getDomain() == domain) {
                        //Set the values of the other input-fields on the popup-screen
                        if (site.getUserId() != "") {
                            document.getElementById('OPFES_InputUserId').setAttribute('value', site.getUserId());
                        }
                        if (site.getSalt() != "") {
                            document.getElementById('OPFES_InputSalt').setAttribute('value', site.getSalt());
                        }
                        (<HTMLSelectElement>document.getElementById('OPFES_SelectMaxPwdChars')).selectedIndex = site.getMaxPwdChars() - 1;
                        if (site.getSequenceNr() != 0) {
                            (<HTMLSelectElement>document.getElementById('OPFES_SelectSequenceNr')).selectedIndex = site.getSequenceNr() - 1;
                        }
                        if (site.getRemark() != "") {
                            document.getElementById('OPFES_InputRemark').setAttribute('value', site.getRemark());
                        }
                        if (site.getAllowedSpecialCharacters() != "") {
                            document.getElementById('OPFES_InputAllowedSpecialCharacters').setAttribute('value', (site.getAllowedSpecialCharacters()));
                        }
                    }
                }
            }
        });
    }

    /**
     * This function retrieves the locally stored sites, changes the popup to:
     * - only show numOfLines of the sites
     * - show the "..." if some sites are not shown
     * @param userData
     * @param numOfSitesToShow Number of sites to show in the OnePasswordForEverySiteApp.html
     */
    function showTheLocallyStoredData(userData: UserData, numOfSitesToShow: number = 999999) {
        let sites: Site[] = userData.sites;
        let dataTableHTML: string = "<table id='locallyStoredUserData' border='1px solid brown'><thead><td>domain</td><td>userid</td><td>salt</td><td>seq.nr</td><td>#chars</td><td>allowed</td><td>used at</td></ts><td>remark</td></thead>";
        let sitesToShow = sites.slice(0, numOfSitesToShow);
        for (let site of sitesToShow) {
            dataTableHTML += `<tr><td>${site.getDomain()}</td>
                                 <td>${site.getUserId()}</td>
                                 <td>${site.getSalt()}</td>
                                 <td>${site.getSequenceNr()}</td>
                                 <td>${site.getMaxPwdChars()}</td>
                                 <td>${site.getAllowedSpecialCharacters()}</td>
                                 <td>${site.getLastUsed().getFullYear()} ${site.getLastUsed().getMonth() + 1} ${site.getLastUsed().getDate()}</td>
                                 <td>${site.getRemark()}</td>
                             </tr>`;
        }
        if (sites.length > numOfSitesToShow) {
            document.getElementById('OPFES_ShowAllTheLocallyStoredData').setAttribute('style', "display: inline");
        } else {
            document.getElementById('OPFES_ShowAllTheLocallyStoredData').setAttribute('style', "display: none");
        }
        dataTableHTML += '</table>';
        document.getElementById('OPFES_localStoredUserData').innerHTML = dataTableHTML;
    }

    document.getElementById('OPFES_ShowAllTheLocallyStoredData').addEventListener('click', function () {
        showTheLocallyStoredData(userData, 100000);
    });

    /* The functions for the buttons to Copy LocalStorage to disk and back again, (OPFES_CopyLocalStorageToDiskButton and
     * OPFES_CopyDiskToLocalStorageButton) are defined in their own files. */

    /*
     * Upon clicking the loginButton, generate the password using the domain-name, userId, salt  and sequenceNr,
     * show the password in a popup and save the (changed) domain-data to the LocalStorage,
     * N.B. of course not saving the password!
     */
    document.getElementById('OPFES_InputAppPassword').addEventListener('keydown', function (e) {
        if (e.which == 13 || e.keyCode == 13) {
            loginFromToolbar();
        }
    }, false);
    document.getElementById('OPFES_LoginButton').addEventListener('click', function () {
        loginFromToolbar();
    }, false);
    function loginFromToolbar() {
        let ourPopup = document;
        let site = new Site(
            (<HTMLInputElement>ourPopup.getElementById('OPFES_InputDomain')).value,
            (<HTMLInputElement>ourPopup.getElementById('OPFES_InputUserId')).value,
            (<HTMLInputElement>ourPopup.getElementById('OPFES_InputSalt')).value,
            +(<HTMLInputElement>ourPopup.getElementById('OPFES_SelectSequenceNr')).value,
            +(<HTMLSelectElement>ourPopup.getElementById('OPFES_SelectMaxPwdChars')).value,
            (<HTMLInputElement>ourPopup.getElementById('OPFES_InputAllowedSpecialCharacters')).value,
            new Date(Date.now()),
            (<HTMLInputElement>ourPopup.getElementById('OPFES_InputRemark')).value
        );

        let inputValueAppPassword = (<HTMLInputElement>ourPopup.getElementById('OPFES_InputAppPassword')).value;
        //save the sites data every time the password gets generated
        // siteService.add(site)
        let siteUpserted: boolean = false;
        for (let key in userData.sites) {
            if (userData.sites[key]["domain"] == site.getDomain()) {
                userData.sites[key] = site;
                siteUpserted = true;
            }
        }
        if (!siteUpserted) {
            userData.sites.push(site);
        }
        userData.persist();

        let sitePassword = SiteService.getSitePassword(site, inputValueAppPassword);
        let passwordElement = ourPopup.getElementById('OPFES_InputSitePassword');
        passwordElement.setAttribute("value", sitePassword);
        (<HTMLInputElement>passwordElement).select();
        (<HTMLInputElement>passwordElement).focus();
        let customerBrowser = get_browser();
        let customerBrowserName = customerBrowser.name.toLowerCase().replace(/[\s_.]/g, '');//Set in lowercase and remove any spaces, underscores and dots.
        if (customerBrowserName === `operamini` || customerBrowserName === `androidbrowser`) {//see http://caniuse.com/#search=execcommand. These two don't support execCommand yet
            window.prompt(
                `This is your password for this site for this user-id.\n\nTo copy the password to your clipboard: Ctrl+C or Cmd+C , Enter`,
                sitePassword
            );
        } else {
            // The execCommand('copy') does not seem to function in the toolbarForm.
            let successful = copyTextToClipboard(sitePassword);
            if (successful && false) {
                // window.alert(`Your password for this site for this user-id is:\n\n${sitePassword}\n\n It is copied to your clipboard. You can paste it in your password-field.`);
            } else {
                window.prompt(
                    `This is your password for this site for this user-id.\n\nTo copy the password to your clipboard: Ctrl+C or Cmd+C , Enter`,
                    sitePassword
                );
            }
        }
    }
};

/**
 * This function is supposed to copy the password to the clipboard, but is does not yet work at all.
 * Problem is that document.execCommand returns true while not having copied the text to the clipboard!
 * @param text
 */
function copyTextToClipboard(text) {
    try {
        let copyFrom: HTMLTextAreaElement = <HTMLTextAreaElement>document.createElement("copyFrom");
        copyFrom.setAttribute("value", text);
        (<HTMLBodyElement>document.querySelector('body')).appendChild(copyFrom);
        copyFrom.focus();
        document.execCommand('copy', true);
        copyFrom.remove();
        return true;
    }
    catch (ex) {
        return false;
    }
}
