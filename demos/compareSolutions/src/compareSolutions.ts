/** @license
 * Copyright 2023 Esri
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
// @esri/solution-common compareSolutions example

import * as common from "@esri/solution-common";

// ------------------------------------------------------------------------------------------------------------------ //

export async function compareSolutions(
  solutionId1: string,
  solutionId2: string,
  authentication: common.UserSession
): Promise<string> {
  if (!solutionId1 || !solutionId2) {
    return Promise.reject("Both Solution IDs need to be defined");
  }

  // Get the item information
  // (item.base: common.IItem)  text/plain JSON
  // (item.data: File)  */*
  // (item.thumbnail: File)  image/*
  // (item.metadata: File)  application/xml
  // (item.resources: File[])  list of */*
  // (item.fwdRelatedItems: common.IRelatedItems[])  list of forward relationshipType/relatedItems[] pairs
  // (item.revRelatedItems: common.IRelatedItems[])  list of reverse relationshipType/relatedItems[] pairs
  // (item.featureServiceProperties: IFeatureServiceProperties)
  const solutions: common.ICompleteItem[] = await Promise.all([
    common.getCompleteItem(solutionId1, authentication),
    common.getCompleteItem(solutionId2, authentication)
  ]);

  let html: string = "<div style='font-size:20px'>" +
    generateHeading(solutions[0].base.id, solutions[1].base.id) +
    "</div>";

  html += "<hr><h4>Base</h4>";
  html += showTextComparison(JSON.stringify(solutions[0].base, null, 2), JSON.stringify(solutions[1].base, null, 2));

  html += "<hr><h4>Data</h4>";
  html += showTextComparison(JSON.stringify(solutions[0].data, null, 2), JSON.stringify(solutions[1].data, null, 2));

  html += "<hr><h4>Thumbnail</h4>";
  html += await showFileComparison(solutions[0].thumbnail, solutions[0].thumbnail);

  html += "<hr><h4>Metadata</h4>";
  html += await showFileComparison(solutions[0].metadata, solutions[0].metadata);

  html += "<hr><h4>Resources</h4>";
  sortByFilename(solutions[0].resources);
  sortByFilename(solutions[1].resources);
  html += await showFileListComparison(solutions[0].resources, solutions[0].resources);

  html += "<hr><h4>Forward relationships</h4>";
  html += showTextComparison(JSON.stringify(solutions[0].fwdRelatedItems, null, 2), JSON.stringify(solutions[1].fwdRelatedItems, null, 2));

  html += "<hr><h4>Reverse relationships</h4>";
  html += showTextComparison(JSON.stringify(solutions[0].revRelatedItems, null, 2), JSON.stringify(solutions[1].revRelatedItems, null, 2));

  html += "<hr><h4>Feature service properties</h4>";
  html += showTextComparison(JSON.stringify(solutions[0].featureServiceProperties, null, 2), JSON.stringify(solutions[1].featureServiceProperties, null, 2));

  html += "<hr>";
  return Promise.resolve(html);
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Sorts a list of Files by filename.
 *
 * @param files File list to sort in place
 */
function sortByFilename(
  files: File[]
): void {
  files.sort(
    (file1: File, file2: File) => file1.name.localeCompare(file2.name)
  );
}

/**
 * Creates the HTML for a two-column heading.
 *
 * @param left Left column heading
 * @param right Right column heading
 *
 * @returns HTML for the columns
 */
function generateHeading(
  left: string,
  right: string
): string {
  return (
    wrapInHalfWidthColumn(left) +
    getColumnSeparator() +
    wrapInHalfWidthColumn(right)
  );
}

/**
 * Creates the HTML for a two-column display of a difference in file names or a single "matches" display.
 *
 * @param file1 Left column file
 * @param file2 Right column file
 *
 * @returns Promise resolving to the HTML for the columns
 */
async function showFileComparison(
  file1: File,
  file2: File,
): Promise<string> {
  if (file1?.name === file2?.name) {
    return Promise.resolve("<i>matches</i>");
  }

  let leftBlob = await showBlob(file1);
  let rightBlob = await showBlob(file2);

  return Promise.resolve(
    wrapInHalfWidthColumn(leftBlob) +
    getColumnSeparator() +
    wrapInHalfWidthColumn(rightBlob)
  );
}

/**
 * Creates the HTML for a two-column display of a difference in file names in a file list or a single "matches" display.
 *
 * @param filelist1 Left column files
 * @param filelist2 Right column files
 *
 * @returns Promise resolving to the HTML for the columns
 */
async function showFileListComparison(
  filelist1: File[],
  filelist2: File[],
): Promise<string> {
  let html = "";
  let iFilelist1 = 0;
  let iFilelist2 = 0;

  while (iFilelist1 < filelist1.length || iFilelist2 < filelist2.length) {
    if (iFilelist1 < filelist1.length && iFilelist2 < filelist2.length) {
      if (filelist1[iFilelist1].name === filelist2[iFilelist2].name) {
        ++iFilelist1;
        ++iFilelist2;
      } else if (filelist1[iFilelist1].name < filelist2[iFilelist2].name) {
        html += await showFileComparison(filelist1[iFilelist1], null);
        ++iFilelist1;
      } else {
        html += await showFileComparison(null, filelist2[iFilelist2]);
        ++iFilelist2;
      }
    } else if (iFilelist1 < filelist1.length) {
      html += await showFileComparison(filelist1[iFilelist1], null);
      ++iFilelist1;
    } else {
      html += await showFileComparison(null, filelist2[iFilelist2]);
      ++iFilelist2;
    }
  }

  // No differences logged
  if (!html) {
    html = "<i>matches</i>";
  }

  return Promise.resolve(html);
}

/**
 * Creates the HTML for a two-column display of differences between a pair of text blocks or a single "matches" display.
 *
 * @param text1 Left column text
 * @param text2 Right column text
 *
 * @return HTML for the columns
 */
function showTextComparison(
  text1: string,
  text2: string,
): string {
  const text1Lines = text1?.split("\n") || "";
  const text2Lines = text2?.split("\n") || "";

  let diff1 = "";
  let diff2 = "";

  // Compare lines up to the end of the smaller file
  const numLinesToCompare = Math.min(text1Lines.length, text2Lines.length);
  for (let i = 0; i < numLinesToCompare; i++) {
    if (text1Lines[i] !== text2Lines[i]) {
      diff1 += text1Lines[i] + "\n";
      diff2 += text2Lines[i] + "\n";
    }
  }

  // Add leftover lines
  if (text1Lines.length > numLinesToCompare) {
    for (let j = numLinesToCompare; j < text1Lines.length; j++) {
      diff1 += text1Lines[j] + "\n";
    }
  } else if (text2Lines.length > numLinesToCompare) {
    for (let k = numLinesToCompare; k < text2Lines.length; k++) {
      diff2 += text2Lines[k] + "\n";
    }
  }

  if (diff1 === diff2) {
    return "<i>matches</i>";
  } else {
    return (
      wrapInHalfWidthColumn(wrapInTextArea(diff1)) +
      getColumnSeparator() +
      wrapInHalfWidthColumn(wrapInTextArea(diff2))
    );
  }
}

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Returns the supplied filename with a leading space or an empty string.
 *
 * @param filename Filename to use; OK if undefined or null
 *
 * @returns Amended filename or an empty string
 */
function addFilename(filename: string): string {
  return filename ? "&nbsp;" + filename : "";
}

/**
 * Replaces certain property values in an object with ellipses to simplify its display.
 *
 * @param object Object to examine
 * @param propertiesToPrune Properties whose value is to be replaced with ellipses
 *
 * @returns Copy of object with any modifications
 */
function findAndPruneProperties(
  object: any,
  propertiesToPrune: string[]
): any {
  if (object == null || typeof object !== "object") {
    return object;
  }

  const updatedJson: any = {};
  Object.keys(object).forEach(
    (key: string) => {
      if (propertiesToPrune.includes(key)) {
        updatedJson[key] = "...";
      } else {
        updatedJson[key] = findAndPruneProperties(object[key], propertiesToPrune);
      }
    }
  );
  return updatedJson;
}

/**
 * Returns the HTML for the gap between two half-width columns.
 *
 * @param text Text to insert vertically in gap
 *
 * @returns div HTML
 */
function getColumnSeparator(
  text?: string
): string {
  return text?
    "<div style='width:2%;display:inline-block;' class='interstitial-text'>" + text + "</div>" :
    "<div style='width:2%;display:inline-block;'></div>";
}

/**
 * Creates the HTML for a blob.
 *
 * @param blob Blob or File to display
 *
 * @returns Promise resolving to HTML rendering blob
 */
function showBlob(
  blob: Blob,
  jsonMaxSize = 0,
  jsonPropertiesToPrune = [] as string[]
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  return new Promise<string>(resolve => {
    if (!blob || blob.size === 0) {
      resolve("<i>none</i>");
      return;
    }
    const file = blob as File;
    const filename = file.name || "";

    // Make sure that a JSON file has the right MIME type
    if (filename.endsWith(".json")) {
      blob = common.createMimeTypedFile({
        blob: file,
        filename: filename,
        mimeType: "application/json"
      });
    }

    if (blob.type === "application/json") {
      common.blobToJson(blob).then(
        json => {
          if (jsonMaxSize && blob.size > jsonMaxSize && jsonPropertiesToPrune.length > 0) {
            // Attempt to reduce size of JSON by removing specified properties
            json = findAndPruneProperties(json, jsonPropertiesToPrune);
          }
          resolve(
            wrapInTextArea(json) + addFilename(filename)
          );
        },
        error => resolve("<i>problem extracting JSON: " + error + "</i>")
      );
    } else if (
      blob.type.startsWith("text/plain") ||
      blob.type === "text/xml" ||
      blob.type === "application/xml"
    ) {
      common.blobToText(blob).then(
        text => resolve(wrapInTextArea(text) + addFilename(filename)),
        error => resolve("<i>problem extracting text: " + error + "</i>")
      );
    } else if (blob.type.startsWith("image/")) {
      let html =
        '<img src="' +
        window.URL.createObjectURL(blob) +
        '" style="max-width:256px;border:1px solid lightgray;"/>';
      if (filename) {
        html +=
          '&nbsp;&nbsp;&nbsp;&nbsp;<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          filename +
          '">' +
          filename +
          "</a>";
      }
      html += "</p>";
      resolve(html);
    } else {
      if (filename) {
        resolve(
          '<a href="' +
          window.URL.createObjectURL(file) +
          '" download="' +
          filename +
          '">' +
          filename +
          "</a>"
        );
      } else {
        resolve(
          '<a href="' +
          window.URL.createObjectURL(blob) +
          '">' +
          blob.type +
          "</a>"
        );
      }
    }
  });
}

/**
 * Creates the HTML for a half-width column using the supplied text.
 *
 * @param text Text to insert into column
 *
 * @returns div HTML
 */
function wrapInHalfWidthColumn(
  text: string
): string {
  return (
    "<div style='width:48%;display:inline-block;'>" +
    text +
    "</div>"
  );
}

/**
 * Creates the HTML for a textarea using the supplied text.
 *
 * @param text Text to insert into textarea
 *
 * @returns textarea HTML
 */
function wrapInTextArea(
  text: string
): string {
  return (
    "<textarea rows='10' style='width:99%;font-size:x-small'>" +
    text +
    "</textarea>"
  );
}

// ------------------------------------------------------------------------------------------------------------------ //
