/**
 * Created by tvansteenbergen on 2017-03-09.
 *
 * This is what I do every time you visit any page:
 * - I check if this site allows you to log on.
 * - If not: I do nothing
 * - If so: I check in your userData if you have logged in to this site before.
 * -        If not: You need to log in the old-fashioned way, change your password with my help and log in again.
 * -        If so: I retrieve your userid for this site and copy the value to the user-id's inputfield.
 * -               I add my own version of the password-field
 * -               I put your userid, that you have used before on this site, in the user-id's inputfield
 */
(function () {
    // if (thisIsLoginForm) {
    //     if(thisFormHasOneUseridInputAndOnePasswordInput){
    //         let PasswordForm: PasswordForm = new LoginForm;
    //     } else {
    //         // This is a LoginForm with an unknown format, so:
    //         Do nothing
    //     }
    // } else if (thisIsPasswordChangeForm) {
    //     if(thisFormHasCurrentNewVerify){
    //         let PasswordForm: PasswordForm = new ChangeForm;
    //     } else {
    //         // This is a changepasswordForm with an unknown format, so:
    //         Do nothing
    //     }
    // } else { // This is page without any password form
    //    Do Nothing
    // }
    let pwdInputs = getVisiblePwdInputFields();
    function getVisiblePwdInputFields(maxPwdInputs = 5) {
        let inputElements = document.getElementsByTagName("input");
        let cnt = 0;
        let pwdInputs = [];
        for (let i = 0; i < inputElements.length; i++) {
            if (inputElements[i].type.toLowerCase() === `password`
                && inputElements[i].id.substring(0, 5) !== `OPFES`
                && !isHidden(inputElements[i])) {
                // We found a password field! Let's add it to our collection:
                pwdInputs[cnt++] = inputElements[i];
                if (cnt > maxPwdInputs)
                    return pwdInputs;
            }
        }
        return pwdInputs;
    }
    if (!pwdInputs) {
        //There are no password-fields on this page, so for this page I do nothing.
        return;
    }
    for (let pwdCounter = 0; pwdCounter < pwdInputs.length; pwdCounter++) {
        if (pwdCounter > 2)
            return; //With more then three password-input-fields this tool has no use.
        let thisSite;
        let addedLightbox = document.createElement(`div`);
        let overlay = document.createElement(`div`);
        addedLightbox.id = "OPFES_loginForm_form";
        addedLightbox.innerHTML =
            "<h1>Hi, Opfes here. </h1>" +
                "<p>On this site you have logged in previously with user-id '<span id='OPFES_userid'></span>'.</p>" +
                "<p>Enter your Opfes-password to log in: <input id='OPFES_UserPassword' type='password' placeholder='____'>" +
                "   <input id='OPFES_SubmitPassword' type='submit' value='Login'></p>" +
                "<p><input id='OPFES_Cancel' type='button' value='Close this popup and show this sites regular login-form'></p>" +
                "";
        document.body.appendChild(addedLightbox);
        overlay.id = "OPFES_loginForm_overlay";
        document.body.appendChild(overlay);
        if (pwdCounter == 0) {
            chrome.storage.local.get("_sites", function (response) {
                // Look for the user-id in the userData...
                let userNameInputValue;
                let yourSites = (response._sites) ? response._sites : [];
                let generatedPassword;
                for (let site of yourSites) {
                    if (window.location.href.indexOf(site.domain) >= 0) {
                        thisSite = new Site(site.domain, site.salt, site.userId, site.sequenceNr, site.maxPwdChars, site.allowedSpecialCharacters, site.lastUsed, site.remark);
                    }
                }
                if (!thisSite) {
                    //First time opfes comes to this site, so user needs to log in the old-fashioned way, change her/his password using opfes and log in again.
                    thisSite = new Site(SiteService.getDomain(window.location.href));
                }
                userNameInputValue = thisSite.getUserId();
                //todo: Make Finding the username-inputfield as smart as possible
                //... and put it in the user-id inputfield
                let userNameInput = getVisibleUserIdElement('input[type="text"][id*=user]');
                if (!userNameInput) {
                    userNameInput = getVisibleUserIdElement('input[type="text"][id*=User]');
                }
                if (!userNameInput) {
                    userNameInput = getVisibleUserIdElement('input[type="text"][id*=id]');
                }
                if (!userNameInput) {
                    userNameInput = getVisibleUserIdElement('input[type="text"][id*=Id]');
                }
                if (!userNameInput) {
                    userNameInput = getVisibleUserIdElement('input');
                }
                if (userNameInputValue !== '') {
                    if (userNameInput) {
                        userNameInput.value = userNameInputValue;
                    }
                    else {
                    }
                }
                else {
                }
                //todo integrate this better into the rest of the code
                if (pwdInputs.length === 1) {
                    // then let me ask the Opfes-password, generate the password and put it in the passwordfield.
                    document.getElementById('OPFES_userid').innerHTML = thisSite.getUserId();
                    document.getElementById('OPFES_loginForm_form').style.display = 'block';
                    document.getElementById('OPFES_loginForm_overlay').style.display = 'block';
                    document.getElementById('OPFES_UserPassword').focus();
                    // event.stopPropagation();
                    document.getElementById('OPFES_SubmitPassword').addEventListener('click', function () {
                        let opfesPassword = document.getElementById('OPFES_UserPassword').value;
                        let submitButton;
                        document.body.removeChild(document.getElementById('OPFES_loginForm_form'));
                        document.body.removeChild(document.getElementById('OPFES_loginForm_overlay'));
                        if (opfesPassword !== null && opfesPassword !== "") {
                            generatedPassword = SiteService.getSitePassword(thisSite, opfesPassword);
                            pwdInputs[0].value = generatedPassword;
                            // alert (generatedPassword);
                            submitButton = pwdInputs[0].form.querySelector('[type="submit"]'); //works at lots, for instance: gavelsnipe.com, npmjs.com
                            if (!submitButton) {
                                submitButton = pwdInputs[0].form.querySelector('[class*="submit"]'); //works at for instance jetbrains.com
                            }
                            if (!submitButton) {
                                submitButton = pwdInputs[0].form.querySelector('[id*="submit"]'); //works at for instance ...
                            }
                            if (submitButton) {
                                // document.body.appendChild(pwdInputs[0].form);
                                // alert(submitButton.click());
                                // submitButton.click();
                                if (typeof jQuery != 'undefined') {
                                    // jQuery is loaded => print the version
                                    alert(jQuery.fn.jquery);
                                }
                                pwdInputs[0].form.submit();
                            }
                        }
                    });
                    document.getElementById('OPFES_Cancel').addEventListener('click', function () {
                        document.body.removeChild(document.getElementById('OPFES_loginForm_form'));
                        document.body.removeChild(document.getElementById('OPFES_loginForm_overlay'));
                    });
                }
                //This function returns the userNameInput. The first visible inputElement in the password-wrapping form
                function getVisibleUserIdElement(selectorString) {
                    // Get the form wrapping the passwordfield
                    let loginForm = pwdInputs[0].form;
                    // let selectorStart: string = (typeof loginForm.id == "string" && loginForm.id !== "")
                    //     ? ("#" + loginForm.id + " ")
                    //     : "form ";
                    // let selectorString: string = selectorStart + selectorTail;
                    //Todo Kill Annie
                    let inputElements = loginForm.querySelectorAll(selectorString);
                    if (inputElements) {
                        for (let i = 0; i < inputElements.length; i++) {
                            if (!isHidden(inputElements[i])) {
                                // We found a password field! Let's add it to our collection:
                                return inputElements[i];
                            }
                        }
                    }
                }
            });
        }
    }
    // This function checks if the given element is visible
    // Returns a boolean
    function isHidden(el) {
        return (el.offsetParent === null);
    }
})();
//# sourceMappingURL=LoginElement.js.map