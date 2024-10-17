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

import JSZip from "jszip";
import { TZipObjectContent, IZipObjectContentItem } from "./interfaces";
import { createMimeTypedFile } from "./resources/copyDataIntoItem";
import { getBlob } from "./resources/get-blob";
import { UserSession } from "./arcgisRestJS";

// ------------------------------------------------------------------------------------------------------------------ //

/**
 * Converts a blob to a zip file.
 *
 * @param blob Blob to convert
 * @returns Promise resolving to zip object
 */
export async function blobToZipObject(blob: Blob): Promise<JSZip> {
  const zipObject = new JSZip();
  return zipObject.loadAsync(blob);
}

/**
 * Fetches a zip object.
 *
 * @param formZipFilePath Path to the zip file
 * @param authentication Credentials to zip file
 * @returns Promise resolving to zip object
 */
export async function fetchZipObject(formZipFilePath: string, authentication: UserSession): Promise<JSZip> {
  return blobToZipObject(await getBlob(formZipFilePath, authentication));
}

/**
 * Gets the contents of the files in the zip.
 *
 * @param zip Zip file
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @param blobExtensions Array of file extensions to treat as blobs; defaults to
 * ["png", "jpeg", "jpg", "gif", "svg", "xls", "xlsx"]
 * @returns Promise that resolves to an array of objects containing the file name and contents
 */
export async function getZipObjectContents(
  zipObject: JSZip,
  filesOfInterest: string[] = [],
  blobExtensions: string[] = ["png", "jpeg", "jpg", "gif", "svg", "xls", "xlsx"],
): Promise<IZipObjectContentItem[]> {
  const extractedZipFiles: IZipObjectContentItem[] = [];
  const fileContentsRetrievalPromises: Array<Promise<TZipObjectContent>> = [];
  zipObject.forEach((relativePath, file) => {
    const getContents = async () => {
      if (filesOfInterest.length === 0 || filesOfInterest.includes(relativePath)) {
        const fileType = blobExtensions.includes(relativePath.split(".").pop()) ? "blob" : "string";
        const fileContentsFetch = file.async(fileType);
        fileContentsRetrievalPromises.push(fileContentsFetch);
        extractedZipFiles.push({
          file: relativePath,
          content: await fileContentsFetch,
        });
      }
    };
    void getContents();
  });
  await Promise.all(fileContentsRetrievalPromises);

  // Sort the files by name because the order of the files in the zip object is not guaranteed
  return extractedZipFiles.sort((a, b) => a.file.localeCompare(b.file));
}

/**
 * Converts a JSON object of keys (filenames)/content (stringified JSON) to a zip object.
 *
 * @param zippedFileJson JSON object to convert
 * @returns Created zip object
 */
export function jsonFilesToZipObject(zippedFileJson: any): JSZip {
  const zipObject = new JSZip();
  Object.keys(zippedFileJson).forEach((key) => {
    zipObject.file(key, zippedFileJson[key]);
  });
  return zipObject;
}

/**
 * Converts a JSON object to a zip object.
 *
 * @param zippedFileName Name of the file in the zip
 * @param zippedFileJson JSON object to convert
 * @returns Created zip object
 */
export function jsonToZipObject(zippedFileName: string, zippedFileJson: any): JSZip {
  const zipObject = new JSZip();
  zipObject.file(zippedFileName, JSON.stringify(zippedFileJson));
  return zipObject;
}

/**
 * Converts a JSON object to a zip file.
 *
 * @param zippedFileName Name of the file in the zip file
 * @param zippedFileJson JSON object to convert
 * @param filename Name to use for zip file; ".zip" added if missing
 * @returns Promise resolving to zip file
 */
export async function jsonToZipFile(zippedFileName: string, zippedFileJson: any, filename: string): Promise<File> {
  const zipObject = jsonToZipObject(zippedFileName, zippedFileJson);
  return zipObjectToZipFile(zipObject, filename);
}

/**
 * Extracts files of interest from a zip object, calls a supplied function to modify them, and
 * restores the files into the zip object.
 *
 * @param modificationCallback Function that modifies the specified files
 * @param zip Zip file that contains the files to modify; modified in place
 * @param filesOfInterest Array of file names to extract from the zip file. If empty, all files are extracted.
 * @returns Promise that resolves to the modified zip file if the swizzle was successful
 */
export async function modifyFilesinZipObject(
  modificationCallback: (zipContentStr: IZipObjectContentItem) => TZipObjectContent,
  zipObject: JSZip,
  filesOfInterest: string[] = [],
): Promise<JSZip> {
  // Get the contents of the form.json file
  const extractedZipFiles = await getZipObjectContents(zipObject, filesOfInterest);

  extractedZipFiles.forEach((extractedZipFile) => {
    // Run the modification callback
    const content = modificationCallback(extractedZipFile);

    // Update the zip file
    zipObject.file(extractedZipFile.file, content);
  });

  return Promise.resolve(zipObject);
}

/**
 * Converts a zip object to a zip file.
 *
 * @param zipObject Zip object
 * @param filename Name to use for zip file; ".zip" added if missing
 * @returns Promise resolving to zip file
 */
export async function zipObjectToZipFile(zipObject: JSZip, filename: string): Promise<File> {
  const completeFilename = filename.endsWith(".zip") ? filename : `${filename}.zip`;

  return createMimeTypedFile({
    blob: await zipObject.generateAsync({ type: "blob" }),
    filename: completeFilename,
    mimeType: "application/zip",
  });
}
