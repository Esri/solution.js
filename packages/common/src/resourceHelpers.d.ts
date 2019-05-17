import * as auth from "@esri/arcgis-rest-auth";
export declare function generateSourceResourceUrl(portalSharingUrl: string, itemId: string, sourceResourceTag: string): string;
export declare function generateSourceMetadataUrl(portalSharingUrl: string, itemId: string): string;
export declare function generateSourceThumbnailUrl(portalSharingUrl: string, itemId: string, thumbnailUrlPart: string, isGroup?: boolean): string;
export declare function generateResourceStorageTag(itemId: string, sourceResourceTag: string): {
    folder: string;
    filename: string;
};
export declare function generateMetadataStorageTag(itemId: string): {
    folder: string;
    filename: string;
};
export declare function generateThumbnailStorageTag(itemId: string, thumbnailUrl: string): {
    folder: string;
    filename: string;
};
export declare function generateResourceTagFromStorage(storageResourceTag: string): {
    folder: string;
    filename: string;
};
export declare function copyResource(source: {
    url: string;
    requestOptions: auth.IUserRequestOptions;
}, destination: {
    itemId: string;
    folderName: string;
    filename: string;
    requestOptions: auth.IUserRequestOptions;
}): Promise<string>;
