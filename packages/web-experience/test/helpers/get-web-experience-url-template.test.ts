/** @license
 * Copyright 2020 Esri
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
import * as getSubdomainModule from "../../src/helpers/get-experience-subdomain";
import { getWebExperiencepUrlTemplate } from "../../src/helpers/get-web-experience-url-template";
import { UserSession } from "@esri/solution-common";
describe("getWebExperiencepUrlTemplate ::", () => {
  it("for ago returns templated url", () => {
    const subdomainSpy = spyOn(
      getSubdomainModule,
      "getExperienceSubdomain"
    ).and.returnValue("experienceqa");
    const url = getWebExperiencepUrlTemplate({} as UserSession);
    expect(url).toBe(
      "https://experienceqa.arcgis.com/experience/{{appid}}",
      "should construct the ago url"
    );
    expect(subdomainSpy.calls.count()).toBe(1, "should get the subdomain");
  });

  it("for portal, returns templated url", () => {
    const subdomainSpy = spyOn(
      getSubdomainModule,
      "getExperienceSubdomain"
    ).and.returnValue(null);
    const url = getWebExperiencepUrlTemplate({
      portal: "https://dev0004025.esri.com/portal/sharing/rest"
    } as UserSession);
    expect(url).toBe(
      "https://dev0004025.esri.com/portal/apps/experiencebuilder/?id={{appid}}",
      "should construct the portal url"
    );
    expect(subdomainSpy.calls.count()).toBe(1, "should get the subdomain");
  });
});
