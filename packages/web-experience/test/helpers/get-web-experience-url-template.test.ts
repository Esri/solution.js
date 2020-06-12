import * as getSubdomainModule from "../../src/helpers/get-experience-subdomain";
import { getWebExperiencepUrlTemplate } from "../../src/helpers/get-web-experience-url-template";
import { UserSession } from "@esri/arcgis-rest-auth";
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
