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

import {
  ISurvey123CreateSuccess,
  ISurvey123CreateParams,
  ISurvey123CreateError
} from "@esri/solution-common";
import * as restRequest from "@esri/arcgis-rest-request";
import { createSurvey } from "../../src/helpers/create-survey";
import * as utils from "../../../common/test/mocks/utils";

// ------------------------------------------------------------------------------------------------------------------ //

describe("createSurvey", () => {
  // atob is undefined in node
  if (typeof window !== "undefined") {
    const MOCK_USER_SESSION = utils.createRuntimeMockUserSession();

    const params = {
      title: "My title",
      tags: ["myTag"],
      typeKeywords: ["myTypekeyword"],
      description: "My description",
      form: {},
      username: "myusername",
      token: "mytoken",
      portalUrl: "https://myportal.arcgis.com",
      thumbnailFile: utils.getSampleImage()
    } as ISurvey123CreateParams;

    it("should resolve a ISurvey123CreateResult when successful", done => {
      const response = {
        success: true,
        id: "2c36d3679e7f4934ac599051df22daf6",
        featureService: {
          source: {
            itemId: "3c36d3679e7f4934ac599051df22daf6"
          }
        },
        formItemInfo: {
          ownerFolder: "4c36d3679e7f4934ac599051df22daf6"
        }
      } as ISurvey123CreateSuccess;
      const expected = {
        formId: "2c36d3679e7f4934ac599051df22daf6",
        featureServiceId: "3c36d3679e7f4934ac599051df22daf6",
        folderId: "4c36d3679e7f4934ac599051df22daf6"
      };
      const requestSpy = spyOn(restRequest, "request").and.resolveTo(response);
      return createSurvey(params, MOCK_USER_SESSION)
        .then(result => {
          expect(requestSpy.calls.count()).toEqual(1);
          expect(requestSpy.calls.first().args).toEqual([
            "https://survey123.arcgis.com/api/survey/create",
            {
              httpMethod: "POST",
              authentication: MOCK_USER_SESSION,
              params: {
                f: "json",
                ...params
              }
            }
          ]);
          expect(result).toEqual(expected);
          done();
        })
        .catch(e => done.fail(e));
    });

    it("should support overriding survey123 url", done => {
      const response = {
        success: true,
        id: "2c36d3679e7f4934ac599051df22daf6",
        featureService: {
          source: {
            itemId: "3c36d3679e7f4934ac599051df22daf6"
          }
        },
        formItemInfo: {
          ownerFolder: "4c36d3679e7f4934ac599051df22daf6"
        }
      } as ISurvey123CreateSuccess;
      const expected = {
        formId: "2c36d3679e7f4934ac599051df22daf6",
        featureServiceId: "3c36d3679e7f4934ac599051df22daf6",
        folderId: "4c36d3679e7f4934ac599051df22daf6"
      };
      const requestSpy = spyOn(restRequest, "request").and.resolveTo(response);
      return createSurvey(
        params,
        MOCK_USER_SESSION,
        "https://survey123qa.arcgis.com"
      )
        .then(result => {
          expect(requestSpy.calls.first().args).toEqual([
            "https://survey123qa.arcgis.com/api/survey/create",
            {
              httpMethod: "POST",
              authentication: MOCK_USER_SESSION,
              params: {
                f: "json",
                ...params
              }
            }
          ]);
          expect(result).toEqual(expected);
          done();
        })
        .catch(e => done.fail(e));
    });

    it("should reject with an error when unsuccessful", done => {
      const response = {
        success: false,
        error: { message: "Something went awry" }
      } as ISurvey123CreateError;
      const requestSpy = spyOn(restRequest, "request").and.resolveTo(response);
      return createSurvey(params, MOCK_USER_SESSION).then(
        _ => {
          done.fail("should have rejected");
        },
        e => {
          expect(e.message).toEqual(
            "Failed to create survey: Something went awry"
          );
          done();
        }
      );
    });
  }
});
