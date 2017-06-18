/**
 * Created by tvansteenbergen on 2017-03-09.
 *
 * This is the WebPageWithPassword for webpages having two password-fields: new and verify.
 * We are trying to generate a new password, copy it to both fields and submit the form.
 *
 * Example sites:
 * - fsfe.org: Log in an go to Application Settings
 * - sourcerers.nl
 */
class NewAndVerifyPassword extends AbstractForm {
    thisSite: Site;

    constructor(thisSite, pwdInputs) {
        super();
        this.thisSite = thisSite;

        // Now let me ask the Opfes-password, generate the password and put it in the new and verify passwordfields.
        let shortMessage = `Opfes says: get a new password for userid '${thisSite.getUserId()}'`;
        let message = ``;
        AbstractForm.showPopupForm(shortMessage, message, pwdInputs[0], true);
        document.getElementById('OPFES_popup_password').focus();
        document.getElementById('OPFES_popup_password').addEventListener('keydown', function (e) {
            if (e.which == 13 || e.keyCode == 13) {
                NewAndVerifyPassword.generatePasswordAndSave(thisSite, pwdInputs);
            }
        });
        document.getElementById('OPFES_popup_submit').addEventListener('click', function () {
            NewAndVerifyPassword.generatePasswordAndSave(thisSite, pwdInputs);
        });
    }

    protected static generatePasswordAndSave(thisSite: Site, pwdInputs) {
        let opfesPassword: string = (<HTMLInputElement>document.getElementById('OPFES_popup_password')).value;
        let submitButton: HTMLElement;
        let generatedPassword: string;

        AbstractForm.hidePopupForm();
        if (opfesPassword !== null && opfesPassword !== "") {
            thisSite.setSequenceNr(thisSite.getSequenceNr() + 1);
            generatedPassword = SiteService.getSitePassword(thisSite, opfesPassword);
            console.log(`pwd: ${generatedPassword}`);
            pwdInputs[0].value = generatedPassword;
            pwdInputs[1].value = generatedPassword;
            submitButton = <HTMLElement>pwdInputs[0].form.querySelector('[type="submit"]');//works at lots, for instance: gavelsnipe.com, npmjs.com
            if (!submitButton) {
                submitButton = <HTMLElement>pwdInputs[0].form.querySelector('[class*="submit"]');//works at for instance jetbrains.com
            }
            if (!submitButton) {
                submitButton = <HTMLElement>pwdInputs[0].form.querySelector('[id*="submit"]');//works at for instance ...??
            }
            if (submitButton) { // If the submitbutton is found: click it!
                SiteService.persist(thisSite);//Since you changed the sequencenr of this site, save it!
                submitButton.click();
            }
        }
    }
}
