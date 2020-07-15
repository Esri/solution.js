import {
  IItemTemplate,
  SERVER_NAME,
  placeholder,
  setProp,
  templatizeTerm,
  fail
} from "@esri/solution-common";
import { UserSession } from "@esri/solution-common";
import { getProp } from "@esri/hub-common";
import { findUrls } from "./findUrls";
import { handleServiceRequests } from "./handleServiceRequests";
/**
 *
 * @param itemTemplate
 * @param authentication
 * @param portalUrl
 * @private
 */

export function templatizeDatasources(
  itemTemplate: IItemTemplate,
  authentication: UserSession,
  portalUrl: string
): Promise<IItemTemplate> {
  return new Promise<IItemTemplate>((resolve, reject) => {
    const dataSources: any = getProp(
      itemTemplate,
      "data.dataSource.dataSources"
    );
    if (dataSources && Object.keys(dataSources).length > 0) {
      const pendingRequests = new Array<Promise<void>>();
      Object.keys(dataSources).forEach(k => {
        const ds: any = dataSources[k];
        setProp(ds, "portalUrl", placeholder(SERVER_NAME));
        const itemId: any = getProp(ds, "itemId");
        if (getProp(ds, "url")) {
          if (itemId) {
            const layerId = ds.url.substr(
              (ds.url as string).lastIndexOf("/") + 1
            );
            ds.itemId = templatizeTerm(
              itemId,
              itemId,
              ".layer" + layerId + ".itemId"
            );
          }
          const urlResults: any = findUrls(
            ds.url,
            portalUrl,
            [],
            [],
            authentication
          );
          pendingRequests.push(
            new Promise<void>((resolveReq, rejectReq) => {
              handleServiceRequests(
                urlResults.serviceRequests,
                urlResults.requestUrls,
                urlResults.testString
              ).then(
                response => {
                  ds.url = response;
                  resolveReq();
                },
                e => rejectReq(fail(e))
              );
            })
          );
        } else {
          if (itemId) {
            ds.itemId = templatizeTerm(itemId, itemId, ".itemId");
          }
        }
      });
      Promise.all(pendingRequests).then(
        () => resolve(itemTemplate),
        e => reject(fail(e))
      );
    } else {
      resolve(itemTemplate);
    }
  });
}
