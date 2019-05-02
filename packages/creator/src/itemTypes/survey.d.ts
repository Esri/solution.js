/**
 * Return a list of items this survey depends on.
 * We just return an empty array because the deployment
 * process for a Survey will utilize the S123 API, which
 * handles creating the feature services etc etc
 */
export declare function extractDependencies(model: any): string[];
