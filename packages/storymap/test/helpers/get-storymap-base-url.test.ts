import { getStoryMapBaseUrl } from "../../src/helpers/get-storymap-base-url";
import * as getSubdomainModule from "../../src/helpers/get-storymap-subdomain";
import { UserSession } from "@esri/arcgis-rest-auth";

describe("getStoryMapBaseUrl :: ", () => {
  it("for ago, returns the env specific base url", () => {
    const subdomainSpy = spyOn(
      getSubdomainModule,
      "getStoryMapSubdomain"
    ).and.returnValue("storymapsqa");
    const url = getStoryMapBaseUrl({} as UserSession);
    expect(url).toBe(
      "https://storymapsqa.arcgis.com",
      "should construct the ago url"
    );
    expect(subdomainSpy.calls.count()).toBe(1, "should get the subdomain");
  });

  it("for portal, returns the correct url", () => {
    const subdomainSpy = spyOn(
      getSubdomainModule,
      "getStoryMapSubdomain"
    ).and.returnValue(null);
    const url = getStoryMapBaseUrl({
      portal: "https://dev0004025.esri.com/portal/sharing/rest"
    } as UserSession);
    expect(url).toBe(
      "https://dev0004025.esri.com/portal/apps/storymaps",
      "should construct the portal url"
    );
    expect(subdomainSpy.calls.count()).toBe(1, "should get the subdomain");
  });
});
