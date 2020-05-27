import {
  UserSession,
  IItemUpdate,
  jsonToBlob,
  updateItem
} from "@esri/solution-common";

export function updateNotebookData(
  itemId: string,
  data: any,
  authentication: UserSession
): Promise<any> {
  const updateOptions: IItemUpdate = {
    id: itemId,
    data: jsonToBlob(data)
  };
  return updateItem(updateOptions, authentication);
}
