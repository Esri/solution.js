import { ICreateItemFromTemplateResponse } from "@esri/solution-common";

export function generateEmptyCreationResponse(
  templateType: string
): ICreateItemFromTemplateResponse {
  return {
    id: "",
    type: templateType,
    postProcess: false
  };
}
