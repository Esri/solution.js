/*
 | Copyright 2018 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

import TestLayout from "../fixtures/test-layout";
import { cloneObject } from "../../src/utils/object-helpers";
import {
  convertLayoutToTemplate,
  convertSection,
  convertRow,
  convertCard,
  convertFollowCard,
  convertEventListCard,
  convertItemGalleryCard,
  convertImageCard,
  convertJumbotronCard,
  extractAssets
} from "../../src/utils/layout-converter";

describe("Layout Converter", () => {
  it("should return null if passed null", () => {
    const result = convertLayoutToTemplate(null);
    expect(result).toBeNull();
  });
  it("should convert the layout", () => {
    const result = convertLayoutToTemplate(TestLayout);
    const layout = result.layout;
    // this is a very basic assertion, but we cover the sub-functions below
    expect(layout.sections.length).toEqual(
      TestLayout.sections.length,
      "should have same number of sections"
    );
    expect(result.assets.length).toEqual(2, "should return 2 assets");
  });

  it("should clone the footer if passed in", () => {
    const layout = cloneObject(TestLayout);
    layout.footer = {
      foo: "bar"
    };
    const result = convertLayoutToTemplate(layout);
    const footer = result.layout.footer;
    expect(footer).toEqual(layout.footer, "footer should be a clone");
    expect(footer).not.toBe(layout.footer, "should not be the same obj");
  });

  it("should work if no header is passed in", () => {
    const layout = cloneObject(TestLayout);
    delete layout.header;
    const result = convertLayoutToTemplate(layout);
    // this is a very basic assertion, but we cover the sub-functions below
    expect(layout.sections.length).toEqual(
      TestLayout.sections.length,
      "should have same number of sections"
    );
    expect(result.assets.length).toEqual(2, "should return 2 assets");
  });

  it("should convert a section", () => {
    const s = {
      containment: "fixed",
      isFooter: false,
      style: {
        background: {
          isFile: true,
          isUrl: false,
          state: "valid",
          display: {},
          transparency: 0,
          position: {
            x: "center",
            y: "center"
          },
          color: "transparent",
          fileSrc: "mcmaster.jpg",
          cropSrc: "hub-image-card-crop-i77o2qytl.png",
          cropId: "i77o2qytl"
        },
        color: "#ffffff"
      },
      rows: [
        {
          cards: [
            {
              component: {
                name: "jumbotron-card",
                settings: {
                  header: "Layout Templating",
                  subheader: "Test Site for Converting to Templates",
                  minHeight: "150",
                  showLocation: false,
                  imageUrl: "",
                  fileSrc: "",
                  cropSrc: "",
                  isUrl: true,
                  isFile: false,
                  state: "",
                  position: {
                    x: "center",
                    y: "center"
                  },
                  display: {},
                  showSearch: false
                }
              },
              width: 12
            }
          ]
        }
      ]
    };
    const result = convertSection(s);
    const section = result.section;
    const assets = result.assets;
    expect(assets.length).toEqual(2, "should have two assets");
    expect(assets[0]).toEqual(
      s.style.background.fileSrc,
      "should have fileSrc"
    );
    expect(assets[1]).toEqual(
      s.style.background.cropSrc,
      "should have cropSrc"
    );
    expect(section.containment).toEqual(
      "fixed",
      "section object should remain"
    );
    expect(section.rows.length).toEqual(1, "should have one row");
    expect(section.rows[0].cards.length).toEqual(
      1,
      "should have one card in first row"
    );
  });

  it("should convert a row", () => {
    const r = {
      cards: [
        {
          component: {
            name: "follow-initiative-card",
            settings: {
              initiativeId: "c5963a6bb6244eb8b8fb4f56cb0bef4c",
              callToActionText:
                "By following this initiative you will get updates about new events, surveys, and tools that you can use to help us achieve our goals.",
              callToActionAlign: "center",
              buttonText: "Follow",
              buttonAlign: "center",
              buttonStyle: "outline",
              unfollowButtonText: "Unfollow"
            }
          },
          width: 12
        }
      ]
    };
    const result = convertRow(r);
    expect(result.assets.length).toEqual(0, "should have no assets");
    const chkCard = result.cards[0];
    const srcCard = r.cards[0];
    expect(chkCard).not.toEqual(srcCard, "should return a clone");
    expect(chkCard.component.name).toEqual(
      srcCard.component.name,
      "name should be the same"
    );
  });

  describe("Card Converters", () => {
    it("should return a clone if card is not processed", () => {
      const c = {
        component: {
          name: "not-a-real-component",
          settings: {
            boo: "blarg"
          }
        }
      };
      const result = convertCard(c).card;
      expect(result).not.toBe(c, "should return a clone");
      expect(result.component.name).toEqual(
        c.component.name,
        "name should be the same"
      );
      expect(result.component.settings.boo).toEqual(
        c.component.settings.boo,
        "setting should be the same"
      );
    });

    it("should convert follow-card", () => {
      const c = {
        component: {
          name: "follow-initiative-card",
          settings: {
            initiativeId: "c5963a6bb6244eb8b8fb4f56cb0bef4c",
            callToActionText:
              "By following this initiative you will get updates about new events, surveys, and tools that you can use to help us achieve our goals.",
            callToActionAlign: "center",
            buttonText: "Follow",
            buttonAlign: "center",
            buttonStyle: "outline",
            unfollowButtonText: "Unfollow"
          }
        },
        width: 12
      };
      const result = convertFollowCard(c).card;
      expect(result.component.settings.initiativeId).toEqual(
        "{{initiative.id}}",
        "Should inject initiative id"
      );
      const r2 = convertCard(c).card;
      expect(r2.component.settings.initiativeId).toEqual(
        "{{initiative.id}}",
        "Should inject initiative id"
      );
    });

    it("should convert event list card", () => {
      const c = {
        component: {
          name: "event-list-card",
          settings: {
            calendarEnabled: true,
            defaultView: "calendar",
            eventListTitleAlign: "left",
            height: 500,
            listEnabled: true,
            showTitle: true,
            title: "List of Upcoming Events",
            initiativeIds: ["c5963a6bb6244eb8b8fb4f56cb0bef4c"]
          }
        },
        width: 12
      };
      const result = convertEventListCard(c).card;
      expect(result.component.settings.initiativeIds[0]).toEqual(
        "{{initiative.id}}",
        "Should inject initiative id"
      );
      const r2 = convertCard(c).card;
      expect(r2.component.settings.initiativeIds[0]).toEqual(
        "{{initiative.id}}",
        "Should inject initiative id"
      );
    });

    it("should convert gallery card", () => {
      const c = {
        component: {
          name: "items/gallery-card",
          settings: {
            query: {
              mode: "dynamic",
              num: 4,
              types: ["dataset"],
              tags: [] as any,
              groups: [
                {
                  title: "Maryland Socrata",
                  id: "9db8bf78132c44ae83131fd879c87881"
                },
                {
                  title: "Another",
                  id: "some-other-id"
                }
              ],
              ids: [] as any
            },
            display: {
              imageType: "Icons",
              viewText: "Explore",
              dropShadow: "medium",
              cornerStyle: "round"
            },
            version: 2,
            orgId: "97KLIFOSt5CxbiRI",
            siteId: ""
          }
        },
        width: 12
      };
      const result = convertItemGalleryCard(c).card;
      expect(result.component.settings.query.groups.length).toEqual(
        1,
        "only have one group"
      );
      expect(result.component.settings.query.groups[0].id).toEqual(
        "{{initiative.collaborationGroupId}}",
        "initaitive group"
      );
      expect(result.component.settings.query.groups[0].title).toEqual(
        "{{initiative.name}}",
        "initaitive group"
      );
      expect(result.component.settings.orgId).toEqual(
        "{{organization.id}}",
        "orgid"
      );
      expect(result.component.settings.siteId).toEqual("", "should be empty");
      const result2 = convertCard(c).card;
      expect(result2.component.settings.query.groups.length).toEqual(
        1,
        "only have one group"
      );
      expect(result2.component.settings.query.groups[0].id).toEqual(
        "{{initiative.collaborationGroupId}}",
        "initaitive group"
      );
      expect(result2.component.settings.query.groups[0].title).toEqual(
        "{{initiative.name}}",
        "initaitive group"
      );
      expect(result2.component.settings.orgId).toEqual(
        "{{organization.id}}",
        "orgid"
      );
      expect(result2.component.settings.siteId).toEqual("", "should be empty");
      c.component.settings.siteId = "3EF-SOME-ID";
      const result3 = convertItemGalleryCard(c).card;
      expect(result3.component.settings.siteId).toEqual(
        "{{appid}}",
        "Only set siteId if its set"
      );
      const result4 = convertCard(c).card;
      expect(result4.component.settings.siteId).toEqual(
        "{{appid}}",
        "Only set siteId if its set"
      );
    });

    it("should convert gallery with old format", () => {
      const c = {
        component: {
          name: "items/gallery-card",
          settings: {
            groups: [
              {
                title: "Maryland Socrata",
                id: "9db8bf78132c44ae83131fd879c87881"
              },
              {
                title: "Another",
                id: "some-other-id"
              }
            ],
            display: {
              imageType: "Icons",
              viewText: "Explore",
              dropShadow: "medium",
              cornerStyle: "round"
            },
            version: 2,
            orgId: "97KLIFOSt5CxbiRI",
            siteId: ""
          }
        },
        width: 12
      };
      const result = convertItemGalleryCard(c).card;
      expect(result.component.settings.groups.length).toEqual(
        1,
        "only have one group"
      );
      expect(result.component.settings.groups[0].id).toEqual(
        "{{initiative.collaborationGroupId}}",
        "initaitive group"
      );
      expect(result.component.settings.groups[0].title).toEqual(
        "{{initiative.name}}",
        "initaitive group"
      );
    });

    it("converts an image card", () => {
      const card = {
        component: {
          name: "image-card",
          settings: {
            src: "",
            fileSrc: "doge.jpg",
            cropSrc: "hub-image-card-crop-i8orjmsva.png",
            alt: "",
            caption: "",
            captionAlign: "center",
            hyperlink: "",
            hyperlinkTabOption: "new",
            isUrl: false,
            isFile: true,
            state: "valid",
            display: {
              position: {
                x: "left",
                y: "top"
              },
              reflow: true,
              crop: {
                transformAxis: "x"
              }
            },
            cropId: "i8orjmsva"
          }
        },
        width: 12
      };
      const result = convertImageCard(card);
      expect(result.assets.length).toEqual(2, "should have two assets");
      expect(result.assets[0]).toEqual(
        card.component.settings.fileSrc,
        "should have fileSrc"
      );
      expect(result.assets[1]).toEqual(
        card.component.settings.cropSrc,
        "should have cropSrc"
      );
      const result2 = convertCard(card);
      expect(result2.assets.length).toEqual(2, "should have two assets");
      expect(result2.assets[0]).toEqual(
        card.component.settings.fileSrc,
        "should have fileSrc"
      );
      expect(result2.assets[1]).toEqual(
        card.component.settings.cropSrc,
        "should have cropSrc"
      );
    });

    it("converts a jumbotron card", () => {
      const card = {
        component: {
          name: "jumbotron-card",
          settings: {
            header: "Layout Templating",
            subheader: "Test Site for Converting to Templates",
            minHeight: "150",
            showLocation: false,
            imageUrl: "",
            fileSrc: "turner-large.jpg",
            cropSrc: "hub-image-card-crop-i45dvu2pz.png",
            isUrl: false,
            isFile: true,
            state: "valid",
            position: {
              x: "center",
              y: "top"
            },
            display: {
              crop: {
                transformAxis: "x",
                position: {
                  x: 0,
                  y: 0
                },
                scale: {
                  current: 0,
                  original: 0
                },
                container: {
                  left: 20,
                  top: 15,
                  width: 860,
                  height: 527.421875
                },
                natural: {
                  width: 2048,
                  height: 1256
                },
                output: {
                  width: 820,
                  height: 512.421875
                },
                version: 2,
                rendered: {
                  width: 860,
                  height: 527.421875
                }
              }
            },
            showSearch: false,
            cropId: "i45dvu2pz"
          }
        },
        width: 12
      };
      const result = convertJumbotronCard(card);
      expect(result.assets.length).toEqual(2, "should have two assets");
      expect(result.assets[0]).toEqual(
        card.component.settings.fileSrc,
        "should have fileSrc"
      );
      expect(result.assets[1]).toEqual(
        card.component.settings.cropSrc,
        "should have cropSrc"
      );
      const result2 = convertCard(card);
      expect(result2.assets.length).toEqual(2, "should have two assets");
      expect(result2.assets[0]).toEqual(
        card.component.settings.fileSrc,
        "should have fileSrc"
      );
      expect(result2.assets[1]).toEqual(
        card.component.settings.cropSrc,
        "should have cropSrc"
      );
    });
  });

  describe("helper functions", () => {
    describe("extractAssets", () => {
      it("should return empty array if null object passed in", () => {
        const result = extractAssets({});
        expect(Array.isArray(result)).toBeTruthy("should return an array");
        expect(result.length).toEqual(0, "should be empty");
      });

      it("should return the fileSrc", () => {
        const result = extractAssets({
          fileSrc: "foo.png"
        });
        expect(Array.isArray(result)).toBeTruthy("should return an array");
        expect(result.length).toEqual(1, "should have one entry");
        expect(result[0]).toEqual("foo.png", "should have one entry");
      });

      it("should return the cropSrc", () => {
        const result = extractAssets({
          cropSrc: "foo.png"
        });
        expect(Array.isArray(result)).toBeTruthy("should return an array");
        expect(result.length).toEqual(1, "should have one entry");
        expect(result[0]).toEqual("foo.png", "should have one entry");
      });
    });
  });
});
