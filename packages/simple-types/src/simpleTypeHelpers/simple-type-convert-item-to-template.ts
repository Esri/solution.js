import * as common from "@esri/solution-common";
import * as dashboard from "../dashboard";
import * as form from "../form";
import * as notebook from "../notebook";
import * as webmap from "../webmap";
import * as webmappingapplication from "../webmappingapplication";
import * as workforce from "../workforce";
import * as quickcapture from "../quickcapture";

export function simpleTypeConvertItemToTemplate(
  solutionItemId: string,
  itemInfo: any,
  authentication: common.UserSession
): Promise<common.IItemTemplate> {
  return new Promise<common.IItemTemplate>((resolve, reject) => {
    // Init template
    const itemTemplate: common.IItemTemplate = common.createInitializedItemTemplate(
      itemInfo
    );

    // Templatize item info property values
    itemTemplate.item.id = common.templatizeTerm(
      itemTemplate.item.id,
      itemTemplate.item.id,
      ".itemId"
    );

    // Request related items
    const relatedPromise = common.getItemRelatedItemsInSameDirection(
      itemTemplate.itemId,
      "forward",
      authentication
    );

    // Perform type-specific handling
    let dataPromise = Promise.resolve({});
    switch (itemInfo.type) {
      case "Dashboard":
      case "Feature Service":
      case "Project Package":
      case "Workforce Project":
      case "Web Map":
      case "Web Mapping Application":
      case "Notebook":
        dataPromise = new Promise((resolveJSON, rejectJSON) => {
          common
            .getItemDataAsJson(itemTemplate.itemId, authentication)
            .then(json => resolveJSON(json), rejectJSON);
        });
        break;
      case "Form":
        dataPromise = common.getItemDataAsFile(
          itemTemplate.itemId,
          itemTemplate.item.name,
          authentication
        );
        break;
      case "QuickCapture Project":
        dataPromise = common.getItemResourcesFiles(
          itemTemplate.itemId,
          authentication
        );
        break;
    }

    // Errors are handled as resolved empty values; this means that there's no `reject` clause to handle, hence:
    // tslint:disable-next-line:no-floating-promises
    Promise.all([dataPromise, relatedPromise]).then(
      responses => {
        const [itemDataResponse, relatedItemsResponse] = responses;
        itemTemplate.data = itemDataResponse;
        const relationships = relatedItemsResponse;

        // Save the mappings to related items & add those items to the dependencies, but not WMA Code Attachments
        itemTemplate.dependencies = [] as string[];
        itemTemplate.relatedItems = [] as common.IRelatedItems[];

        relationships.forEach(relationship => {
          /* istanbul ignore else */
          if (relationship.relationshipType !== "WMA2Code") {
            itemTemplate.relatedItems!.push(relationship);
            relationship.relatedItemIds.forEach(relatedItemId => {
              if (itemTemplate.dependencies.indexOf(relatedItemId) < 0) {
                itemTemplate.dependencies.push(relatedItemId);
              }
            });
          }
        });

        let wrapupPromise = Promise.resolve();
        let webappPromise = Promise.resolve(itemTemplate);
        switch (itemInfo.type) {
          case "Dashboard":
            dashboard.convertItemToTemplate(itemTemplate, authentication);
            break;
          case "Form":
            // Store the form's data in the solution resources, not in template
            itemTemplate.data = null;
            form.convertItemToTemplate(itemTemplate);

            wrapupPromise = new Promise(
              (resolveFormStorage, rejectFormStorage) => {
                common
                  .storeFormItemFiles(
                    itemTemplate,
                    itemDataResponse,
                    solutionItemId,
                    authentication
                  )
                  .then(formFilenames => {
                    // update the templates resources
                    itemTemplate.resources = itemTemplate.resources.concat(
                      formFilenames
                    );
                    resolveFormStorage();
                  }, rejectFormStorage);
              }
            );
            break;
          case "Notebook":
            notebook.convertNotebookToTemplate(itemTemplate);
            break;
          case "Web Map":
            webappPromise = webmap.convertItemToTemplate(
              itemTemplate,
              authentication
            );
            break;
          case "Web Mapping Application":
            if (itemDataResponse) {
              webappPromise = webmappingapplication.convertItemToTemplate(
                itemTemplate,
                authentication
              );
            }
            break;
          case "Workforce Project":
            workforce.convertItemToTemplate(itemTemplate);
            break;
          case "QuickCapture Project":
            webappPromise = quickcapture.convertItemToTemplate(itemTemplate);
            break;
        }

        wrapupPromise.then(
          () => {
            webappPromise.then(resolve, err => reject(common.fail(err)));
          },
          err => reject(common.fail(err))
        );
      },
      error => {
        reject(error);
      }
    );
  });
}
