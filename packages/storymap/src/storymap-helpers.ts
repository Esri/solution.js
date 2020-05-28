import * as common from "@esri/solution-common";

export function isClassicStoryMap(itemUrl?: string): boolean {
  const patterns = [
    /\/apps\/Cascade\//i,
    /\/apps\/MapJournal\//i,
    /\/apps\/MapSeries\//i,
    /\/apps\/MapTour\//i,
    /\/apps\/Shortlist\//i,
    /\/apps\/StoryMap\//i,
    /\/apps\/StoryMapBasic\//i,
    /\/apps\/StorytellingSwipe\//i
  ];
  return !!itemUrl && patterns.some(pattern => pattern.test(itemUrl));
}

export function isNextGenStoryMap(itemType: string): boolean {
  return itemType === "StoryMap";
}

export function isAStoryMap(itemType: string, itemUrl?: string): boolean {
  return isNextGenStoryMap(itemType) || isClassicStoryMap(itemUrl);
}
