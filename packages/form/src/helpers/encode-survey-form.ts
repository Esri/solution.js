import { cloneObject } from "@esri/solution-common";

export const encodeSurveyForm = function encodeForm(form: any) {
  const clone = cloneObject(form);
  const props = [
    ["header", "content"],
    ["subHeader", "content"],
    ["footer", "content"],
    ["settings", "thankYouScreenContent"]
  ];
  const encode = (
    obj: { [key: string]: string },
    key: string
  ): { [key: string]: string } => {
    if (obj && obj[key]) {
      obj[key] = encodeURIComponent(obj[key]);
    }
    return obj;
  };

  // encode props from array above
  props.forEach(([objKey, propKey]) => encode(clone[objKey], propKey));

  // encode question descriptions
  clone.questions = (clone.questions || []).map((question: any) =>
    encode(question, "description")
  );

  return clone;
};
