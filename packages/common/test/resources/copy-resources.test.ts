import * as copyResourceModule from "../../src/resources/copy-resource";
import * as fetchMock from "fetch-mock";
import * as utils from "../mocks/utils";
import * as interfaces from "../../src/interfaces";

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});
describe("copyResource :: ", () => {
  const baseUrl = utils.PORTAL_SUBSET.restUrl;
  it("copies resource", done => {
    const source = {
      url: `${baseUrl}/content/items/c6732556e299f1/resources/image.png`,
      authentication: MOCK_USER_SESSION
    };
    const destination = {
      itemId: "itm1234567890",
      folder: "storageFolder",
      filename: "storageFilename.png",
      authentication: MOCK_USER_SESSION
    };
    const updateUrl = `${baseUrl}/content/users/casey/items/${destination.itemId}/addResources`;
    const expected = { success: true, id: destination.itemId };

    fetchMock
      .post(source.url, utils.getSampleImage(), { sendAsJson: false })
      .post(updateUrl, expected);
    return copyResourceModule
      .copyResource(source, destination)
      .then((response: any) => {
        expect(response).toEqual(expected);
        done();
      }, done.fail);
  });
  it("handles inexplicable response", done => {
    const source = {
      url: `${baseUrl}/content/items/c6732556e299f1/resources/image.png`,
      authentication: MOCK_USER_SESSION
    };
    const destination = {
      itemId: "itm1234567890",
      folder: "storageFolder",
      filename: "storageFilename.png",
      authentication: MOCK_USER_SESSION
    };

    fetchMock.post(
      source.url,
      new Blob(["[1, 2, 3, 4, ]"], { type: "text/plain" }),
      { sendAsJson: false }
    );
    return copyResourceModule
      .copyResource(source, destination)
      .then(() => {
        done.fail();
      })
      .catch(ex => {
        done();
      });
  });

  it("handles inability to get resource", done => {
    const base = utils.PORTAL_SUBSET.restUrl;
    const source = {
      url: `${base}/content/items/c6732556e299f1/resources/image.png`,
      authentication: MOCK_USER_SESSION
    };
    const destination = {
      itemId: "itm1234567890",
      folder: "storageFolder",
      filename: "storageFilename.png",
      authentication: MOCK_USER_SESSION
    };

    fetchMock.post(source.url, 500);
    return copyResourceModule
      .copyResource(source, destination)
      .then(resp => {
        done.fail();
      })
      .catch(ex => {
        done();
      });
  });

  it("handles inability to copy resource, hard error", done => {
    const source = {
      url:
        utils.PORTAL_SUBSET.restUrl +
        "/content/items/c6732556e299f1/resources/image.png",
      authentication: MOCK_USER_SESSION
    };
    const destination = {
      itemId: "itm1234567890",
      folder: "storageFolder",
      filename: "storageFilename.png",
      authentication: MOCK_USER_SESSION
    };
    const fetchUrl =
      utils.PORTAL_SUBSET.restUrl +
      "/content/items/c6732556e299f1/resources/image.png";
    const updateUrl =
      utils.PORTAL_SUBSET.restUrl +
      "/content/users/casey/items/itm1234567890/addResources";
    const expected = 500;

    fetchMock
      .post(fetchUrl, utils.getSampleImage(), { sendAsJson: false })
      .post(updateUrl, expected);
    return copyResourceModule
      .copyResource(source, destination)
      .then(r => {
        done.fail();
      })
      .catch(ex => {
        done();
      });
  });
});
