import * as copyResourceModule from "../../src/resources/copy-resource";
import * as fetchMock from "fetch-mock";
import * as utils from "../mocks/utils";
import * as interfaces from "../../src/interfaces";
import * as mockItems from "../mocks/agolItems";
import { getBlob } from "../../src/resources/get-blob";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

const SERVER_INFO = {
  currentVersion: 10.1,
  fullVersion: "10.1",
  soapUrl: "http://server/arcgis/services",
  secureSoapUrl: "https://server/arcgis/services",
  owningSystemUrl: "https://myorg.maps.arcgis.com",
  authInfo: {}
};

describe("getBlob", () => {
  if (typeof window !== "undefined") {
    it("can get a blob from a URL", done => {
      const url: string = "https://myserver/images/thumbnail.png";

      const getUrl = "https://myserver/images/thumbnail.png";
      const expectedServerInfo = SERVER_INFO;
      const expected = mockItems.getAnImageResponse();
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(getUrl + "/rest/info", expectedServerInfo)
        .post(getUrl, expected, { sendAsJson: false });

      getBlob(url, MOCK_USER_SESSION).then(response => {
        expect(response).toEqual(expected);
        done();
      }, done.fail);
    });

    it("can handle an error from the REST endpoint request.request", done => {
      const url: string = "https://myserver/images/thumbnail.png";

      const getUrl = "https://myserver/images/thumbnail.png";
      const expectedServerInfo = SERVER_INFO;
      fetchMock
        .post(utils.PORTAL_SUBSET.restUrl + "/info", expectedServerInfo)
        .post(getUrl + "/rest/info", expectedServerInfo)
        .post(getUrl, 503);
      getBlob(url, MOCK_USER_SESSION).then(
        () => done.fail(),
        () => done()
      );
    });
    it("handles undefined url", done => {
      return getBlob(undefined, MOCK_USER_SESSION).then(
        () => done.fail(),
        () => done()
      );
    });
  }
});
