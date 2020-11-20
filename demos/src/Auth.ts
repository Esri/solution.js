/** @license
 * Copyright 2018 Esri
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Auth manages an authenticated connection to ArcGIS.
 *
 * @module Auth
 */

//#region Interfaces
import esriConfig from "esri/config";
import IdentityManager from "esri/identity/IdentityManager";
import OAuthInfo from "esri/identity/OAuthInfo";
import * as Portal from "esri/portal/Portal";

export interface IPortalSubset {
  name: string;
  id: string;
  restUrl: string;
  portalUrl: string;
  urlKey: string;
  hostName: string;
  orgUrl: string;
}

export interface IPortalUserSubset {
  fullName: string;
  username: string;
  culture: string;
  thumbnailUrl: string;
  privileges: string[];
}

interface IPortalUserWithPrivileges extends __esri.PortalUser {
  privileges: string[];
}

//#endregion
// ------------------------------------------------------------------------------------------------------------------ //

export class Auth {

  private _clientId: string;
  private _credential: __esri.Credential | null = null;
  private _portal: Portal;
  private _portalSubset: IPortalSubset | null = null;
  private _portalUrl: string;
  private _isOnline: boolean;
  private _portalUserSubset: IPortalUserSubset | null = null;

  public constructor(
    clientId: string,
    portalURL: string
  ) {
    const paramsOnLoad = new URLSearchParams(window.location.search);
    this._clientId = clientId;
    this._isOnline = window.location.origin.indexOf('.arcgis.com') > -1;

    // Use origin for the portal Url if its on arcgis.com domain
    // Else use the portalUrl passed in as the default. Default is https://www.arcgis.com

    this._portalUrl = this._isOnline ? window.location.origin : portalURL;
    esriConfig.portalUrl = this._portalUrl;

    const info = new OAuthInfo({
      appId: clientId,
      popup: false, // inline redirects don't require any additional app configuration
      portalUrl: this._portalUrl,
      preserveUrlHash: true
    });

    const useSignInPage = paramsOnLoad.has("from_switcher");

    IdentityManager.useSignInPage = useSignInPage;
    IdentityManager.registerOAuthInfos([info]);

    this._portal = new Portal.default({ url: this._portalUrl });

  }

  public init(
  ): Promise<Auth> {
    const self = this;
    return new Promise<Auth>(resolve => {
      // Persist logins when the page is refreshed
      IdentityManager.checkSignInStatus(self._portalUrl + "/sharing")
        .then(
          (response: __esri.Credential) => {
            self._credential = response;

            this._portal.authMode = "immediate";

            // Once portal is loaded, user signed in
            this._portal.load().then(
              () => {
                self._portalSubset = {
                  name: this._portal.name,
                  id: this._portal.id,
                  restUrl: this._portal.restUrl,
                  portalUrl: this._portal.url,
                  urlKey: this._portal.urlKey,
                  hostName: this._portal.portalHostname,
                  orgUrl: this._getOrgUrl(this._portal.url, this._portal.urlKey, this._portal.customBaseUrl)
                };

                self._portalUserSubset = {
                  fullName: this._portal.user.fullName,
                  username: this._portal.user.username,
                  culture: this._portal.user.culture?.toLowerCase() || "en",
                  thumbnailUrl: this._portal.user.thumbnailUrl ||
                    this._portal.url + "/home/js/arcgisonline/css/images/no-user-thumb.jpg",
                  privileges: (this._portal.user as IPortalUserWithPrivileges).privileges
                };

                resolve(self);
              },
              () => {
                self._clearPrivateStorage();
                resolve(self);
              });
          },
          () => {
            self._clearPrivateStorage();
            resolve(self);
          }
        );
    });
  }

  get SignedIn(
  ): boolean {
    return this._credential !== null;
  }

  get Credential(
  ): __esri.Credential | null {
    return this._credential;
  }

  get PortalUrl(
  ): string {
    return this._portalUrl;
  }

  get PortalSubset(
  ): IPortalSubset | null {
    return this._portalSubset;
  }

  get PortalUserSubset(
  ): IPortalUserSubset | null {
    return this._portalUserSubset;
  }

  get PortalUserOrg(
  ): string | null {
    return this._portalSubset && this._portalSubset.id;
  }

  get PortalUserName(
  ): string {
    return (this._portalUserSubset && this._portalUserSubset.username) || "";
  }

  get PortalUserCulture(
  ): string {
    return (this._portalUserSubset && this._portalUserSubset.culture) || "";
  }

  get PortalUserPrivileges(
  ): string[] {
    let privileges = [] as string[];
    if (this._portalUserSubset && this._portalUserSubset.privileges) {
      privileges = this._portalUserSubset.privileges;
    }
    return privileges;
  }

  public signIn(
  ) {
    // Triggers page refresh, so
    // tslint:disable-next-line: no-floating-promises
    IdentityManager.getCredential((this._portalSubset?.portalUrl ?? this._portalUrl) + "/sharing")
    .then(
      () => {
        // Got a credential without a redirect
        window.location.reload();
      }
    );
  }

  public signOut(
  ): void {
    let redirectUrl = "https://" + this._portalSubset?.hostName;
    if (window.location.hostname === this._portalSubset?.hostName) {
      // User is logged into App at www.arcgis.com/apps/solutions/ path
      // redirect to portal index url
      redirectUrl += "/index.html";
    }
    else if (this._portalSubset?.urlKey && window.location.hostname.indexOf(this._portalSubset?.urlKey) > -1) {
      // User is logged into App at orgurlkey.maps.arcgis.com/apps/solutions/
      // Redirect to portal home url
      redirectUrl = window.location.origin + "/home/index.html";
    }
    else {
      redirectUrl = this._portalUrl;
    }

    // N.B.: This closes the app and redirects to a new page
    this._signOutAndRedirect(redirectUrl);
  }

  public switchAccount(
  ): void {
    if (this._isOnline){
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.append("from_switcher", "true");
      const updatedParams = currentParams.toString();
      const redirectUri = encodeURIComponent(`https://${this.PortalSubset?.hostName}${window.location.pathname}?${updatedParams}${window.location.hash}`);
      const url = "https://" + this.PortalSubset?.hostName +
        `/home/pages/Account/manage_accounts.html#client_id=${this._clientId}&redirect_uri=${redirectUri}`;
      window.open(url, "_blank");
    }
    else{
      this._signOutAndRedirect(window.location.href);
    }
  }

  public _signOutAndRedirect(
    redirectUrl: string
  ): void {
    // N.B.: This closes the app and redirects to specified page
    const restUrl: string = this._portalSubset?.restUrl ?? this._portalUrl + "/sharing/rest";
    const signOutUrl =
      `${restUrl}/oauth2/signout?client_id=${this._clientId}&redirect_uri=${redirectUrl}`;
    this._clearPrivateStorage();
    IdentityManager.destroyCredentials();
    window.location.replace(signOutUrl);
  }

  private _clearPrivateStorage(
  ): void {
    this._credential = null;
    this._portalSubset = null;
    this._portalUserSubset = null;
  }

  private _getOrgUrl(
    portalUrl: string,
    portalUrlKey: string,
    portalCustomBaseUrl: string,
  ): string {
    if (portalUrlKey && portalCustomBaseUrl) {
      return window.location.protocol + "//" + portalUrlKey + "." + portalCustomBaseUrl;
    }
    else {
      return portalUrl;
    }
  }

}
