/** @license
 * Copyright 2024 Esri
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
 * Provides tests for zip file helper functions.
 */

import * as generalHelpers from "../src/generalHelpers";
import * as interfaces from "../src/interfaces";
import * as utils from "./mocks/utils";
import * as zipUtils from "../src/zip-utils";
import * as getBlobUtil from "../src/resources/get-blob";
import JSZip from "jszip";

// ------------------------------------------------------------------------------------------------------------------ //

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // default is 5000 ms

let MOCK_USER_SESSION: interfaces.UserSession;

beforeEach(() => {
  MOCK_USER_SESSION = utils.createRuntimeMockUserSession();
});

describe("Module `zip-utils`", () => {

  describe("fetchZipObject", () => {
    it("fetches a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      spyOn(getBlobUtil, "getBlob").and.returnValue(getSampleFormZipBlob(itemId));

      const zip = await zipUtils.fetchZipObject(itemId, MOCK_USER_SESSION);
      const zipFiles = await zipUtils.getZipObjectContents(zip);
      expect(zipFiles.length).toBe(7);
    });
  });

  describe("getZipObjectContents", () => {
    it("returns the contents of a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = generateFormZipObject(itemId);
      const zipFiles = await zipUtils.getZipObjectContents(zip);
      expect(zipFiles.length).toBe(7);
    });

    it("returns just two files out of a zip object", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = generateFormZipObject(itemId);
      const zipFiles = await zipUtils.getZipObjectContents(zip, ["esriinfo/form.info", "esriinfo/form.json"]);
      expect(zipFiles.length).toBe(2);
      expect(zipFiles[0].file).toBe("esriinfo/form.info");
      expect(zipFiles[1].file).toBe("esriinfo/form.json");
    });
  });

  describe("modifyFilesinZipObject", () => {
    const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";

    it("applies a function to all files in the zip", async () => {
      let zip = generateFormZipObject(itemId);
      const zipFileContents = await zipUtils.getZipObjectContents(zip);
      const zipFiles: string[] = zipFileContents.map((zipFile) => zipFile.file);

      const zipFilesModified: string[] = [];
      zip = await zipUtils.modifyFilesinZipObject(
        (zipFile: interfaces.IZipObjectContentItem) => {
          zipFilesModified.push(zipFile.file);
          return zipFile.content;
        }, zip
      );

      expect(zipFilesModified).toEqual(zipFiles);
    });
  });

  describe("zipObjectToZipFile", () => {
    it("converts a zip object to a zip file with full filename", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = generateFormZipObject(itemId);
      const zipFile = await zipUtils.zipObjectToZipFile(zip, "Fred.zip");
      expect(zipFile.name).toEqual("Fred.zip");
      expect(zipFile.type).toEqual("application/zip");
    });

    it("converts a zip object to a zip file with partial filename", async () => {
      const itemId = "2f56b3b59cdc4ac8b8f5de0399887e1e";
      const zip = generateFormZipObject(itemId);
      const zipFile = await zipUtils.zipObjectToZipFile(zip, "Fred");
      expect(zipFile.name).toEqual("Fred.zip");
      expect(zipFile.type).toEqual("application/zip");
    });
  });

});

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Compares the contents of two zip files.
 *
 * @param zip1 First zip file
 * @param zip2 Second zip file
 * @returns A promise resolving to be true if the zip files are equal, false otherwise
 */
export async function compareZips(
  zip1: JSZip,
  zip2: JSZip
): Promise<boolean> {
  const zip1Files = await zipUtils.getZipObjectContents(zip1);
  const zip2Files = await zipUtils.getZipObjectContents(zip2);

  if (zip1Files.length !== zip2Files.length) {
    console.log("length mismatch", zip1Files.length, zip2Files.length);
    return Promise.resolve(false);
  }

  for (let i = 0; i < zip1Files.length; i++) {
    const zip1File = zip1Files[i];
    const zip2File = zip2Files[i];

    if (zip1File.file !== zip2File.file) {
      console.log("path mismatch", zip1File.file, zip2File.file);
      return Promise.resolve(false);
    }

    if (zip1File.content !== zip2File.content) {
      console.log("content mismatch", zip1File.content, zip2File.content);
      return Promise.resolve(false);
    }
  }

  return Promise.resolve(true);
}

/**
 * Generates a partial collection of files that represent a Survey123 form.
 *
 * @param id ID of the form
 * @param includeWebhooks Whether to include webhooks in the form.json file
 * @returns Zip file containing form files
 */
export function generateFormZipObject(
  id: string,
  includeWebhooks: boolean = true
): JSZip {
  /*
  There are 7 items in the file as reported by zipObject.forEach:
    "esriinfo/",
    "esriinfo/form.info",
    "esriinfo/form.itemInfo",
    "esriinfo/form.json",
    "esriinfo/form.webform",
    "esriinfo/form.xml",
    "esriinfo/forminfo.json"
  */
  const zip = new JSZip();
  includeWebhooks
    ? zip.file("esriinfo/form.info", `{"displayInfo":{"map":{"coordinateFormat":null,"defaultType":{"name":""},"home":{"latitude":null,"longitude":null,"zoomLevel":0},"preview":{"coordinateFormat":null,"zoomLevel":0}}},"notificationsInfo":{"webhooks":[{"name":"TestWebhook","url":"https://fred.maps.arcgis.com/${id}/link"},{"name":"TestWebhook","url":"https://workflow.arcgis.com/org1234567890/${id}/webhooks"}]}}`)
    : zip.file("esriinfo/form.info", `{"displayInfo":{"map":{"coordinateFormat":null,"defaultType":{"name":""},"home":{"latitude":null,"longitude":null,"zoomLevel":0},"preview":{"coordinateFormat":null,"zoomLevel":0}}}}`);
  zip.file("esriinfo/form.itemInfo", `{"id":"${id}","created":1705691185000,"isOrgItem":true,"modified":1705691194000,"guid":null,"name":"${id}","title":"Untitled survey","type":"Form","typeKeywords":["Draft","Form","Survey123","Survey123 Hub","xForm"]}`);
  zip.file("esriinfo/form.json", `{"layerName":"survey","portalUrl":"https://www.arcgis.com","questions":[{"id":"field_1","position":0,"fieldName":"untitled_question_1","name":"untitled_question_1","type":"esriQuestionTypeText","isRequired":false,"fieldType":"esriFieldTypeString","validation":{"valueRange":{"isEnabled":false},"inputMask":{"isEnabled":false,"customFormat":""}},"label":"Untitled question 1","description":null}],"notificationsInfo":{},"version":"3.19"}`);
  zip.file("esriinfo/form.webform", `{"form":"<form autocomplete=\"off\" novalidate=\"novalidate\" class=\"or clearfix\" dir=\"ltr\" data-form-id=\"survey\">\n<!--This form was created by transforming an ODK/OpenRosa-flavored (X)Form using an XSL stylesheet created by Enketo LLC.--><section class=\"form-logo\"></section><h3 dir=\"auto\" id=\"form-title\">survey</h3>\n  \n  \n    <label class=\"question non-select \"><span lang=\"\" class=\"question-label active\" id=\"idm1660384\">&lt;p&gt;Survey title not set&lt;/p&gt;</span><span lang=\"\" class=\"or-hint active\" id=\"idm1659952\">&lt;p&gt;Description content for the survey&lt;/p&gt;</span><input type=\"text\" name=\"/xls-${id}/generated_note_form_title\" data-type-xml=\"string\" readonly=\"\" id=\"idm1652688\"></label>\n    <label class=\"question non-select \"><span lang=\"\" class=\"question-label active\" id=\"idm1658944\">Submit</span><input type=\"text\" name=\"/xls-${id}/generated_note_form_submit_text\" data-type-xml=\"string\" readonly=\"\" id=\"idm1659376\"></label>\n    <label class=\"question non-select \"><span lang=\"\" class=\"question-label active\" id=\"idm1657936\">&lt;a target='_blank' style='color:#000000;' href='https://www.esri.com/products/survey123'&gt;Powered by ArcGIS Survey123&lt;/a&gt;</span><input type=\"text\" name=\"/xls-${id}/generated_note_form_footer\" data-type-xml=\"string\" readonly=\"\" id=\"idm1658368\"></label>\n    <label class=\"question non-select \"><span lang=\"\" class=\"question-label active\" id=\"idm1656928\">&lt;p style=\"text-align:center;\"&gt;&lt;br&gt;&lt;/p&gt;&lt;p style=\"text-align:center;\"&gt;&lt;img alt=\"Green check icon\" src=\"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGZpbGw9IiMzMTg3MkUiIGN4PSIzMiIgY3k9IjMyIiByPSIzMiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0yMi42NjEgMzAuMjQ2bDUuMTgyIDQuOTg3TDQxLjU1MiAyMiA0NSAyNS40NjEgMjcuNzQ3IDQyIDE5IDMzLjQ5OHoiLz48L2c+PC9zdmc+\"&gt;&lt;/p&gt;&lt;p style=\"text-align:center;\"&gt;&lt;br&gt;&lt;/p&gt;&lt;p style=\"text-align:center;\"&gt;&lt;strong style=\"font-size:16px;\"&gt;&lt;p style=\"text-align:center;\"&gt;Thank you.&lt;/p&gt;&lt;p style=\"text-align:center;\"&gt;Your response was submitted successfully.&lt;/p&gt;&lt;/strong&gt;&lt;/p&gt;</span><input type=\"text\" name=\"/xls-${id}/generated_note_prompt_submitted\" data-type-xml=\"string\" readonly=\"\" id=\"idm1657360\"></label>\n    <label class=\"question non-select \"><span lang=\"\" class=\"question-label active\" id=\"idm1664048\">Untitled question 1</span><input type=\"text\" name=\"/xls-${id}/untitled_question_1\" data-type-xml=\"string\" id=\"idm1664480\"></label>\n    <label class=\"question non-select or-appearance-multiline\"><span lang=\"\" class=\"question-label active\" id=\"idm1662896\">Untitled question 2</span><textarea name=\"/xls-${id}/untitled_question_2\" data-type-xml=\"string\" id=\"idm1663472\"></textarea></label>\n  \n<fieldset id=\"or-calculated-items\" style=\"display:none;\"><label class=\"calculation non-select \"><input type=\"hidden\" name=\"/xls-${id}/meta/instanceID\" data-calculate=\"concat('uuid:', uuid())\" data-type-xml=\"string\" id=\"idm1654128\"></label></fieldset></form>","model":"<model><instance>\n        <xls-${id} xmlns:esri=\"http://esri.com/xforms\" xmlns:jr=\"http://openrosa.org/javarosa\" xmlns:orx=\"http://openrosa.org/xforms\" xmlns:odk=\"http://www.opendatakit.org/xforms\" id=\"survey\">\n          <generated_note_form_title/>\n          <generated_note_form_submit_text/>\n          <generated_note_form_footer/>\n          <generated_note_prompt_submitted/>\n          <untitled_question_1/>\n          <untitled_question_2/>\n          <meta>\n            <instanceID/>\n          </meta>\n        </xls-${id}>\n      </instance></model>","languageMap":{},"transformerVersion":"2.3.0"}`);
  zip.file("esriinfo/form.xml", `<?xml version="1.0"?>
        <h:html xmlns:esri="http://esri.com/xforms" xmlns="http://www.w3.org/2002/xforms" xmlns:h="http://www.w3.org/1999/xhtml" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:jr="http://openrosa.org/javarosa" xmlns:orx="http://openrosa.org/xforms" xmlns:odk="http://www.opendatakit.org/xforms">
          <h:head>
            <h:title>survey</h:title>
            <model>
              <instance>
                <xls-${id} id="survey">
                  <generated_note_form_title/>
                  <generated_note_form_submit_text/>
                  <generated_note_form_footer/>
                  <generated_note_prompt_submitted/>
                  <untitled_question_1/>
                  <untitled_question_2/>
                  <meta>
                    <instanceID/>
                  </meta>
                </xls-${id}>
              </instance>
              <bind nodeset="/xls-${id}/generated_note_form_title" readonly="true()" type="string"/>
              <bind nodeset="/xls-${id}/generated_note_form_submit_text" readonly="true()" type="string"/>
              <bind nodeset="/xls-${id}/generated_note_form_footer" readonly="true()" type="string"/>
              <bind nodeset="/xls-${id}/generated_note_prompt_submitted" readonly="true()" type="string"/>
              <bind nodeset="/xls-${id}/untitled_question_1" type="string"/>
              <bind nodeset="/xls-${id}/untitled_question_2" type="string"/>
              <bind nodeset="/xls-${id}/meta/instanceID" type="string" readonly="true()" calculate="concat('uuid:', uuid())"/>
            </model>
          </h:head>
          <h:body>
          </h:body>
        </h:html>
      `);
  zip.file("esriinfo/forminfo.json", `{"name":"form","type":"xform"}`);
  return zip;
}

/**
 * Generates a sample zip file and returns it as a blob.
 *
 * @param id Item id to use in the zip file
 * @returns Promise resolving to the blob
 */
export async function getSampleFormZipBlob(
  id: string,
  includeWebhooks: boolean = true
): Promise<Blob> {
  return await generateFormZipObject(id, includeWebhooks).generateAsync({ type: "blob" })
}

/**
 * Generates a sample zip file and returns it as a file.
 *
 * @param id Item id to use in the zip file
 * @returns Promise resolving to the file
 */
export async function getSampleFormZipFile(
  id: string,
  filename: string,
  includeWebhooks: boolean = true
): Promise<File> {
  return generalHelpers.blobToFile(await getSampleFormZipBlob(id, includeWebhooks), filename);
}