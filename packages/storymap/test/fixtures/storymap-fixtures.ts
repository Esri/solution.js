/** @license
 * Copyright 2020 Esri
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

import { IModel } from "@esri/hub-common";

/**
 * Cherry Blossom Example Storymap Json
 */
export const CherryBlossoms = {
  item: {
    id: "bce0eca488ab47a3b25f63ddca34e679",
    owner: "hannah.storymaps",
    orgId: "nzS0F0zdNLvs7nc8",
    created: 1585761046000,
    modified: 1586793927000,
    guid: null,
    name: null,
    title: "The Cherry Blossoms of Washington, D.C. ",
    type: "StoryMap",
    typeKeywords: [
      "arcgis-storymaps",
      "smdraftresourceid:draft_1586793923030.json",
      "smpublisheddate:1586793923026",
      "smstatuspublished",
      "smversiondraft:20.2.0",
      "smversionpublished:20.2.0",
      "StoryMap",
      "Web Application"
    ],
    description: null,
    tags: [""],
    snippet:
      "An annual attraction, here's how these springtime favorites came to be in the District.",
    thumbnail: "thumbnail/ago_downloaded.jpg",
    documentation: null,
    extent: [],
    categories: [],
    spatialReference: null,
    accessInformation: null,
    licenseInfo: null,
    culture: "en-us",
    properties: null,
    url:
      "https://storymaps.arcgis.com/stories/bce0eca488ab47a3b25f63ddca34e679",
    proxyFilter: null,
    access: "public",
    size: 10900658,
    appCategories: [],
    industries: [],
    languages: [],
    largeThumbnail: null,
    banner: null,
    screenshots: [],
    listed: false,
    commentsEnabled: true,
    numComments: 0,
    numRatings: 0,
    avgRating: 0,
    numViews: 3076,
    scoreCompleteness: 50,
    groupDesignations: null
  },
  data: {
    root: "n-RsTmDd",
    nodes: {
      "n-jdcuW7": {
        type: "image",
        data: {
          image: "r-EAs04K",
          caption: "",
          alt: ""
        },
        config: {
          placement: {
            type: "fill",
            fill: {
              x: 0.42484662576687116,
              y: 0.4826530612244898
            },
            fit: {
              color: "backgroundColor"
            }
          }
        }
      },
      "n-0dqpsv": {
        type: "storycover",
        data: {
          type: "sidebyside",
          title: "The Cherry Blossoms of Washington, D.C. ",
          summary:
            "An annual attraction, here's how these springtime favorites came to be in the District.",
          byline: "Esri's StoryMaps team",
          titlePanelPosition: "end"
        },
        children: ["n-jdcuW7"]
      },
      "n-Jo21rM": {
        type: "navigation",
        data: {
          links: [
            {
              nodeId: "n-VuqCvf"
            },
            {
              nodeId: "n-GAmcKm"
            }
          ]
        },
        config: {
          isHidden: true
        }
      },
      "n-AW00-l": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "<strong><em>Author's note</em></strong><em>: Given the current COVID-19 pandemic, please stay inside. The maps and photos in this story are intended to educate, entertain, and provide a sort of virtual tour. They should not prompt you to head to the Tidal Basin, or some other public gathering place—the peak bloom is behind us anyway. We hope you can get out and enjoy the trees in all their glory next year. Thank you. </em>"
        }
      },
      "n-iCbtsg": {
        type: "separator"
      },
      "n-h2iSa8": {
        type: "text",
        data: {
          text:
            "If you've ever been to Washington, D.C. in late March or early April, you've likely noticed an abundance of cherry trees spreading their pink and white petals all over town—especially down around the Tidal Basin. These arboreal blossoms draw thousands upon thousands to the United States capital each year, with locals and tourists alike getting out to admire the city's surest sign that spring has arrived.",
          type: "paragraph"
        }
      },
      "n-gXFevk": {
        type: "image",
        data: {
          image: "r-tF3IWl",
          caption:
            "<p>Light leaks through blossoms on the National Mall, creating a dreamy scene. <em>Photo: Ross Donihue</em></p>",
          alt: ""
        },
        config: {
          size: "standard"
        }
      },
      "n-G75_k_": {
        type: "text",
        data: {
          text:
            "You probably know that these trees are native to Japan, where they are a cultural icon. But the story of how they came to decorate much of the D.C. cityscape isn't quite as commonly known. The rather fascinating tale is complete with a cast of characters from the early 20th century, diplomatic opportunity, a do-over, and a few plot advancements that took place decades after the story began.",
          type: "paragraph"
        }
      },
      "n-JOWIiD": {
        type: "separator"
      },
      "n-VuqCvf": {
        type: "text",
        data: {
          type: "h2",
          text: "A brief history"
        }
      },
      "n-uX-nCS": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "A key figure in the effort to bring cherry trees to D.C. was David Fairchild, a food explorer with the U.S. Department of Agriculture."
        }
      },
      "n-2pOwfb": {
        type: "image",
        data: {
          image: "r-SVYo3b",
          caption:
            '<p>David Fairchild (left) receives an award for "distinguishing services in plant introduction." <em>Photo: </em><a href="https://www.loc.gov/pictures/item/2016875988/" rel="noopener noreferrer" target="_blank"><em>Harris &amp; Ewing via the Library of Congres</em></a><em>s</em></p>',
          alt: ""
        },
        config: {
          size: "float"
        }
      },
      "n-3VbZSa": {
        type: "text",
        data: {
          text:
            "By the early 1900s, Fairchild had already made a name for himself, having brought to the United States a number of previously-foreign-but-now-favorite plant species, among them avocados (from Chile), mangoes (from India), and peaches (from China).",
          type: "paragraph"
        }
      },
      "n-_EtKBU": {
        type: "text",
        data: {
          text:
            "While in Japan in 1902, Fairchild had his first encounter with the cherry tree. The centuries-old Japanese practice of <em>hanami</em>—which includes outdoor gatherings and parties each spring to admire the blossoming trees—struck a chord with the American explorer.",
          type: "paragraph"
        }
      },
      "n-fDP1yY": {
        type: "text",
        data: {
          text:
            "So, in 1908, Fairchild began campaigning for cherry trees to be an integral part of the effort to beautify areas of the nation's capital that, at the time, were considered eyesores.",
          type: "paragraph"
        }
      },
      "n--HDZ6g": {
        type: "text",
        data: {
          type: "quote",
          text:
            "<em>President William Howard Taft saw cherry trees as a chance to improve diplomatic relations with Japan.</em>"
        }
      },
      "n-NaVTq7": {
        type: "image",
        data: {
          image: "r-lsJgXf",
          caption:
            '<p>Eliza Ruhaman Scidmore. <em>Photo: </em><a href="https://www.nps.gov/media/photo/gallery-item.htm?pg=0&amp;id=9176D2F3-1DD8-B71B-0B5400E25B73466B&amp;gid=91699FB1-1DD8-B71B-0B080DB0FC6034F3" rel="noopener noreferrer" target="_blank"><em>National Park Service</em></a></p>',
          alt: ""
        },
        config: {
          size: "float"
        }
      },
      "n-lqgwmb": {
        type: "text",
        data: {
          text:
            "Fairchild, it’s worth noting, was not the first to suggest cherry trees be brought to the United States. In the late 1800s, Eliza Ruhaman Scidmore had made the same suggestion to U.S. Army officials, and had continued to suggest it for more than two decades, though up to that point no one had found the argument compelling.",
          type: "paragraph"
        }
      },
      "n-BqVoQt": {
        type: "text",
        data: {
          text:
            "Attitudes seemed to have changed when Fairchild raised the issue a few years later. By 1909, Fairchild and Scidmore had even found an ally for the cause in the first lady, Helen Taft. And her husband, President William Howard Taft, saw the proposal as a chance to improve diplomatic relations with Japan, which had been on rocky footing due to American prejudice against Japanese immigrants in the early 20th century.",
          type: "paragraph"
        }
      },
      "n-JcNcQK": {
        type: "image",
        data: {
          image: "r-9kG4Sc",
          caption:
            '<p>The Tafts in a White House automobile. <em>Photo: </em><a href="https://www.loc.gov/resource/cph.3c32298/" rel="noopener noreferrer" target="_blank"><em>Barnett McFee via Library of Congress</em></a></p>',
          alt: ""
        },
        config: {
          size: "full"
        }
      },
      "n-ZX4OjP": {
        type: "text",
        data: {
          text:
            "The opportunity to cement an appreciation for its culture in the U.S. capital was too good for Japan to pass up. Yukio Ozaki, the mayor of Tokyo at the time, quickly set about finding 300 exemplary specimens of <em>sakura</em>, Japan’s flowering trees. But by the time the trees were loaded upon a U.S.-bound ship, 300 had become 2,000.",
          type: "paragraph"
        }
      },
      "n-0wyRbh": {
        type: "image",
        data: {
          image: "r-KP6GzQ",
          caption:
            '<p>Yukio Ozaki and his wife. <em>Photo: </em><a href="https://www.nps.gov/subjects/cherryblossom/images/Osaki.jpg?maxwidth=650&amp;autorotate=false" rel="noopener noreferrer" target="_blank"><em>National Park Service</em></a></p>',
          alt: ""
        },
        config: {
          size: "float"
        }
      },
      "n-0DWJRy": {
        type: "text",
        data: {
          text:
            "A month-long journey across the Pacific, though, took a toll on the fragile, densely packed trees. When inspected upon arrival, several types of diseases were found festering in the tree roots. Amid fears of importing new plant-plaguing diseases into the U.S., the trees were ultimately burned in late January, 1910.",
          type: "paragraph"
        }
      },
      "n-c4RPTn": {
        type: "text",
        data: {
          text:
            "When he heard the news, Ozaki promptly agreed to send another shipment of trees, this time with extra precautions taken to ensure their health upon delivery. A second ship departed for the U.S., this time carrying 3,000 trees, which passed inspection with flying colors.",
          type: "paragraph"
        }
      },
      "n-ZUX_ZQ": {
        type: "text",
        data: {
          type: "quote",
          text:
            "<em>Those wishing to see the original pair of trees planted in D.C. can find them near the end of 17th street SW.</em>"
        }
      },
      "n-96zr6E": {
        type: "expressmap",
        data: {
          map: "r-g5lLgB",
          alt: "",
          caption:
            "<p>A few details about the two shipments of cherry trees from Japan to the U.S.</p>"
        }
      },
      "n-Db0WYt": {
        type: "text",
        data: {
          text:
            "Helen Taft and the Viscountess Chinda—the wife of the Japanese Ambassador to the U.S.—planted the first two cherry trees in a small ceremony on March 27, 1912. The remaining trees were planted around the Tidal Basin and in East Potomac Park, though the process of planting them all lasted through 1920. ",
          type: "paragraph"
        }
      },
      "n-x7JfNV": {
        type: "text",
        data: {
          text:
            "Those wishing to see the original pair of trees can find them near the end of 17th street SW. Look for a bronze plaque beneath the trees to know you’ve found the right spot.",
          type: "paragraph"
        }
      },
      "n-sCZt91": {
        type: "image",
        data: {
          image: "r-jh8Dwb",
          caption:
            '<p>The commemorative plaque marking the planting of the first two cherry trees in D.C. <em>Photo: </em><a href="https://www.flickr.com/photos/bootbearwdc/294210170" rel="noopener noreferrer" target="_blank"><em>David King</em></a></p>',
          alt: ""
        },
        config: {
          size: "standard"
        }
      },
      "n-EG6gXc": {
        type: "text",
        data: {
          text:
            "Several decades later, 3,800 more trees were gifted by Japan to another U.S. first lady, Lady Bird Johnson, to support her own efforts to beautify Washington. Today, many of these trees are planted around the grounds of the Washington Monument. Additional rounds of tree plantings have occurred intermittently since then, with the latest being a group of 400 planted from 2002-2006.",
          type: "paragraph"
        }
      },
      "n-DWhCV5": {
        type: "text",
        data: {
          text:
            "But the sending of trees has not been a one-way transaction. In 1915, after seeing how the American public had become smitten with the cherry trees, the U.S. government sent Japan a shipment of flowering dogwoods as a token of their gratitude.",
          type: "paragraph"
        }
      },
      "n-jKRNWd": {
        type: "text",
        data: {
          type: "quote",
          text:
            "<em> An additional 3,800 trees were gifted by Japan to another U.S. first lady, Lady Bird Johnson.</em>"
        }
      },
      "n-jzADlI": {
        type: "text",
        data: {
          text:
            "Then, in 1982, Japanese horticulturalists took cuttings from the original 1912 trees back to Japan, helping preserve important genetic characteristics after many Japanese trees had been destroyed. Similar cuttings were again taken in 1997. This cyclical gifting is a testament to the relationship formed through the efforts of Fairchild, Scidmore, the Tafts, Ozaki, and others many years earlier.",
          type: "paragraph"
        }
      },
      "n-HxLT5P": {
        type: "separator"
      },
      "n-GAmcKm": {
        type: "text",
        data: {
          type: "h2",
          text: "The cherry trees today"
        }
      },
      "n-08g2S-": {
        type: "text",
        data: {
          text:
            "With so many additional plantings, cherry trees are now found throughout the District of Columbia.",
          type: "paragraph"
        }
      },
      "n-_E2aHV": {
        type: "webmap",
        data: {
          alt: "",
          caption:
            '<p>Squares represent the density of cherry trees throughout. D.C. (Note: <a href="https://caseytrees.org/2019/03/heres-our-updated-d-c-cherry-blossom-map/" rel="noopener noreferrer" target="_blank">Data</a> does not include trees on private property)</p>',
          map: "r-7cde2828cb7042e39930412313935372",
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0_5375",
              title: "TreeGridSummary_1km small scale",
              visible: true
            },
            {
              id: "TreeGridSummary_2km_6064",
              title: "TreeGridSummary_2km",
              visible: true
            }
          ],
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8602743.871937152,
            ymin: 4691881.010548611,
            xmax: -8549084.970763162,
            ymax: 4722073.697106625
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8575914.421350157,
            y: 4706977.353827618
          },
          zoom: 11,
          viewpoint: {
            rotation: 0,
            scale: 144447.92746803342,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8575914.421350157,
              y: 4706977.353827618
            }
          }
        }
      },
      "n-Oq5nTU": {
        type: "image",
        data: {
          image: "r-UGqRD3",
          caption:
            "<p>A closeup of Yoshino cherry blossoms. <em>Photo: Ross Donihue</em></p>",
          alt: ""
        },
        config: {
          size: "float"
        }
      },
      "n-oj2ZAu": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "Some areas certainly boast a higher concentration of cherry trees than others, but in most places you won't have to wander too far before coming across at least one tree sporting the signature blossoms in springtime."
        }
      },
      "n-E7BJGc": {
        type: "text",
        data: {
          text:
            "Not all trees will look the same, however. The District contains dozens of different types of cherry trees, each with its own distinct blossoms. The Yoshino variety is certainly the most common. You can identify it by its clusters of small white flowers and a somewhat almond scent.",
          type: "paragraph"
        }
      },
      "n-Q3pa68": {
        type: "image",
        data: {
          image: "r-qIMiD3",
          caption: "",
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-dePE7F": {
        type: "text",
        data: {
          text:
            "The area of the city that draws the biggest crowds has traditionally been the Tidal Basin, where trees crowd the water's edge in a scene that begs to be photographed.",
          type: "paragraph"
        },
        config: {
          size: "wide"
        }
      },
      "n-Ef2I0Y": {
        type: "image",
        data: {
          image: "r-hdIC7H",
          caption:
            '<p><em>Photo: </em><a href="https://unsplash.com/photos/NMLv5HQZnK4" rel="noopener noreferrer" target="_blank"><em>Mark Tegethoff on Unsplash</em></a></p>',
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-Fl-nlu": {
        type: "immersive-narrative-panel",
        data: {
          position: "start",
          size: "medium"
        },
        children: ["n-Q3pa68", "n-dePE7F", "n-Ef2I0Y"]
      },
      "n-jOyABh": {
        type: "webmap",
        data: {
          alt: "",
          caption: "Cherry Blossoms (Simple)",
          map: "r-7cde2828cb7042e39930412313935372",
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0_5375",
              title: "TreeGridSummary_1km small scale",
              visible: true
            },
            {
              id: "TreeGridSummary_2km_6064",
              title: "TreeGridSummary_2km",
              visible: true
            }
          ],
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8577745.279386217,
            ymin: 4704243.86850847,
            xmax: -8574377.266091375,
            ymax: 4706138.077404079
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8576061.272738796,
            y: 4705190.972956275
          },
          zoom: 15,
          viewpoint: {
            rotation: 0,
            scale: 9027.995466752089,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8576061.272738796,
              y: 4705190.972956275
            }
          }
        }
      },
      "n-CAag3z": {
        type: "immersive-slide",
        data: {
          transition: "fade"
        },
        children: ["n-Fl-nlu", "n-jOyABh"]
      },
      "n-MGkTs-": {
        type: "image",
        data: {
          image: "r-9mzhMw",
          caption: "",
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-lbAEbZ": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "Just south of the Basin is East Potomac Park, which is lined by a multitude of different kinds of trees, including the dramatic weeping cherry (pictured below). The variety here is a noticeable departure from the homogeny of trees around the Tidal Basin."
        },
        config: {
          size: "wide"
        }
      },
      "n-nLUXg-": {
        type: "image",
        data: {
          image: "r-8KlGav",
          caption:
            '<p><em>Photo: </em><a href="https://www.flickr.com/photos/22711505@N05/8643694968" rel="noopener noreferrer" target="_blank"><em>Ron Cogswell</em></a></p>',
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-w3Q5R2": {
        type: "immersive-narrative-panel",
        data: {
          position: "start",
          size: "medium"
        },
        children: ["n-MGkTs-", "n-lbAEbZ", "n-nLUXg-"]
      },
      "n-fNbV-u": {
        type: "webmap",
        data: {
          alt: "",
          caption: "Cherry Blossoms (Simple)",
          map: "r-7cde2828cb7042e39930412313935372",
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0_5375",
              title: "TreeGridSummary_1km small scale",
              visible: true
            },
            {
              id: "TreeGridSummary_2km_6064",
              title: "TreeGridSummary_2km",
              visible: true
            }
          ],
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8578146.171592016,
            ymin: 4701040.597236307,
            xmax: -8571414.922326155,
            ymax: 4704829.015027527
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8574780.546959085,
            y: 4702934.806131917
          },
          zoom: 14,
          viewpoint: {
            rotation: 0,
            scale: 18055.990933504178,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8574780.546959085,
              y: 4702934.806131917
            }
          }
        }
      },
      "n-mCalaH": {
        type: "immersive-slide",
        data: {
          transition: "fade"
        },
        children: ["n-w3Q5R2", "n-fNbV-u"]
      },
      "n-fwiOt9": {
        type: "image",
        data: {
          image: "r-GWYxWH",
          caption: "",
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-WcP69S": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "Head to the neighborhoods in Northwest DC, like Foxhall Village, and you'll find many streets lined with cherry trees. Their abundance dramatically changes the neighborhood feel as winter transitions into spring."
        },
        config: {
          size: "wide"
        }
      },
      "n-GrXSY7": {
        type: "image",
        data: {
          image: "r-mo0Lcl",
          caption: "<p><em>Photo: Ross Donihue</em></p>",
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-yxIFaC": {
        type: "immersive-narrative-panel",
        data: {
          position: "start",
          size: "medium"
        },
        children: ["n-fwiOt9", "n-WcP69S", "n-GrXSY7"]
      },
      "n-mEq5_V": {
        type: "webmap",
        data: {
          alt: "",
          caption: "Cherry Blossoms (Simple)",
          map: "r-7cde2828cb7042e39930412313935372",
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0_5375",
              title: "TreeGridSummary_1km small scale",
              visible: true
            },
            {
              id: "TreeGridSummary_2km_6064",
              title: "TreeGridSummary_2km",
              visible: true
            }
          ],
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8584758.885294087,
            ymin: 4708380.930876596,
            xmax: -8578027.636028226,
            ymax: 4712169.348667815
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8581393.260661157,
            y: 4710275.139772206
          },
          zoom: 14,
          viewpoint: {
            rotation: 0,
            scale: 18055.990933504178,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8581393.260661157,
              y: 4710275.139772206
            }
          }
        }
      },
      "n-EZeMge": {
        type: "immersive-slide",
        data: {
          transition: "fade"
        },
        children: ["n-yxIFaC", "n-mEq5_V"]
      },
      "n-Znh6qr": {
        type: "image",
        data: {
          image: "r-a98LEI",
          caption: "",
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-hZr8-E": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            "On the west side of town, blooming cherry trees make for a lovely entrance to Kenilworth Aquatic Gardens. A variety of other plant species will be in bloom there, too."
        },
        config: {
          size: "wide"
        }
      },
      "n-V3_GsJ": {
        type: "image",
        data: {
          image: "r-4kKc3b",
          caption:
            '<p><em>Photo: </em><a href="https://www.nps.gov/keaq/spring-into-life.htm" rel="noopener noreferrer" target="_blank"><em>National Park Service</em></a></p>',
          alt: ""
        },
        config: {
          size: "wide"
        }
      },
      "n-56dgvm": {
        type: "immersive-narrative-panel",
        data: {
          position: "start",
          size: "medium"
        },
        children: ["n-Znh6qr", "n-hZr8-E", "n-V3_GsJ"]
      },
      "n-6nRdcV": {
        type: "webmap",
        data: {
          alt: "",
          caption: "Cherry Blossoms (Simple)",
          map: "r-7cde2828cb7042e39930412313935372",
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0_5375",
              title: "TreeGridSummary_1km small scale",
              visible: true
            },
            {
              id: "TreeGridSummary_2km_6064",
              title: "TreeGridSummary_2km",
              visible: true
            }
          ],
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8567315.140506089,
            ymin: 4707952.763229,
            xmax: -8563947.127211247,
            ymax: 4709846.972124609
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8565631.133858668,
            y: 4708899.867676805
          },
          zoom: 15,
          viewpoint: {
            rotation: 0,
            scale: 9027.995466752089,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8565631.133858668,
              y: 4708899.867676805
            }
          }
        }
      },
      "n-PAr8CJ": {
        type: "immersive-slide",
        data: {
          transition: "fade"
        },
        children: ["n-56dgvm", "n-6nRdcV"]
      },
      "n-A9QCFy": {
        type: "immersive",
        data: {
          type: "sidecar",
          subtype: "floating-panel",
          narrativePanelPosition: "start"
        },
        children: ["n-CAag3z", "n-mCalaH", "n-EZeMge", "n-PAr8CJ"]
      },
      "n-mn9ekI": {
        type: "text",
        data: {
          type: "paragraph",
          text:
            'Whether you\'re a D.C. native, or the city\'s spring bloom still sits unchecked on your bucket list, if you\'ve made it this far you\'ll perhaps know a bit more about Washington\'s cherry blossoms than you did when you started reading. Still eager to learn more? <a href="https://storymaps.arcgis.com/stories/77e8b0e3d393497190735e03f05b2d69" rel="noopener noreferrer" target="_blank">This story</a> from the Smithsonian can help satiate your curiosity:'
        }
      },
      "n-atyjQM": {
        type: "embed",
        data: {
          url:
            "https://storymaps.arcgis.com/stories/77e8b0e3d393497190735e03f05b2d69",
          embedSrc:
            "https://cdn.embedly.com/widgets/media.html?a=0&src=https%3A%2F%2Fstorymaps.arcgis.com%2Fstories%2F77e8b0e3d393497190735e03f05b2d69&display_name=ArcGIS+StoryMaps&url=https%3A%2F%2Fstorymaps.arcgis.com%2Fstories%2F77e8b0e3d393497190735e03f05b2d69&image=https%3A%2F%2Fwww.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2F77e8b0e3d393497190735e03f05b2d69%2Finfo%2Fthumbnail%2Fago_downloaded.jpg%2F&key=88b6786539b84dd89cd29d1d50728eea&type=text%2Fhtml&schema=arcgis",
          title: "Cherry Blossoms of Smithsonian Gardens",
          description:
            "At Smithsonian Gardens, not only do we have the iconic Yoshino cherry, but also 5 other varieties of ornamental cherries.",
          providerUrl: "https://storymaps.arcgis.com",
          thumbnailUrl:
            "https://www.arcgis.com/sharing/rest/content/items/77e8b0e3d393497190735e03f05b2d69/info/thumbnail/ago_downloaded.jpg/",
          caption: "Cherry Blossoms of Smithsonian Gardens",
          embedType: "link",
          display: "card",
          width: 800,
          alt: "",
          hasPlaceholderOpenButton: true
        }
      },
      "n-LhuEHt": {
        type: "text",
        data: {
          type: "h3",
          text: "Other related reading:"
        }
      },
      "n-lfHLdX": {
        type: "embed",
        data: {
          url:
            "https://storymaps.arcgis.com/stories/93571cdb10b040158aa43fa9ab1755ee",
          embedSrc:
            "https://cdn.embedly.com/widgets/media.html?a=0&src=https%3A%2F%2Fstorymaps.arcgis.com%2Fstories%2F93571cdb10b040158aa43fa9ab1755ee&display_name=ArcGIS+StoryMaps&url=https%3A%2F%2Fstorymaps.arcgis.com%2Fstories%2F93571cdb10b040158aa43fa9ab1755ee&image=https%3A%2F%2Fwww.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2F93571cdb10b040158aa43fa9ab1755ee%2Finfo%2Fthumbnail%2Fago_downloaded.jpg%2F%3Fw%3D400%26d%3D1568042263235&key=88b6786539b84dd89cd29d1d50728eea&type=text%2Fhtml&schema=arcgis",
          title: "Celebrating Great Trees",
          description: "A gallery of botanical hall-of-famers.",
          providerUrl: "https://storymaps.arcgis.com",
          thumbnailUrl:
            "https://www.arcgis.com/sharing/rest/content/items/93571cdb10b040158aa43fa9ab1755ee/info/thumbnail/ago_downloaded.jpg/?w=400&d=1568042263235",
          caption: "Celebrating Great Trees",
          embedType: "link",
          display: "card",
          width: 800,
          alt: "",
          hasPlaceholderOpenButton: true
        }
      },
      "n-39Jlha": {
        type: "embed",
        data: {
          url:
            "https://storymaps.arcgis.com/collections/9224445996ed47d18027588509665242",
          embedSrc:
            "https://cdn.embedly.com/widgets/media.html?a=0&src=https%3A%2F%2Fstorymaps.arcgis.com%2Fcollections%2F9224445996ed47d18027588509665242&display_name=ArcGIS+StoryMaps&url=https%3A%2F%2Fstorymaps.arcgis.com%2Fcollections%2F9224445996ed47d18027588509665242&image=https%3A%2F%2Fwww.arcgis.com%2Fsharing%2Frest%2Fcontent%2Fitems%2F9224445996ed47d18027588509665242%2Finfo%2Fthumbnail%2Fthumbnail1584654877021.png%2F&key=88b6786539b84dd89cd29d1d50728eea&type=text%2Fhtml&schema=arcgis",
          title: "Virtual adventures",
          description:
            "From street art to the Met, mountain climbing to a game drive, these virtual adventures are the next best thing to being there.",
          providerUrl: "https://storymaps.arcgis.com",
          thumbnailUrl:
            "https://www.arcgis.com/sharing/rest/content/items/9224445996ed47d18027588509665242/info/thumbnail/thumbnail1584654877021.png/",
          caption: "Virtual adventures",
          embedType: "link",
          display: "card",
          width: 800,
          alt: "",
          hasPlaceholderOpenButton: true
        }
      },
      "n-VE_O8c": {
        type: "text",
        data: {
          text: "About this story",
          type: "h4"
        }
      },
      "n-1pS3r-": {
        type: "text",
        data: {
          text:
            '<em>The Cherry Blossoms of Washington, D.C.</em> was created by the StoryMaps team with ArcGIS StoryMaps. You can learn more about this digital storytelling tool, and try it for yourself,&nbsp;<a href="https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/overview" rel="noopener noreferrer" target="_blank">here</a>. If you\'d like more stories like this delivered right to your inbox, be sure to sign up for our&nbsp;<a href="https://go.esri.com/planet-story-maps" rel="noopener noreferrer" target="_blank">monthly newsletter</a>.',
          type: "paragraph"
        }
      },
      "n-8lPfwp": {
        type: "attribution",
        data: {
          content: "<strong>Cartography</strong>",
          attribution:
            '<a href="https://twitter.com/InfiniteCoop" rel="noopener noreferrer" target="_blank">Cooper Thomas</a>'
        }
      },
      "n-Kom3u4": {
        type: "attribution",
        data: {
          content: "<strong>Data</strong>",
          attribution:
            '<a href="https://caseytrees.org/2019/03/heres-our-updated-d-c-cherry-blossom-map/" rel="noopener noreferrer" target="_blank">Casey Trees</a>'
        }
      },
      "n-i2DD4a": {
        type: "attribution",
        data: {
          content: "<strong>Writing</strong>",
          attribution:
            '<a href="https://www.esri.com/arcgis-blog/author/hwilber-storymaps/" rel="noopener noreferrer" target="_blank">Hannah Wilber</a>'
        }
      },
      "n-HYU88Q": {
        type: "credits",
        children: ["n-VE_O8c", "n-1pS3r-", "n-8lPfwp", "n-Kom3u4", "n-i2DD4a"]
      },
      "n-RsTmDd": {
        type: "story",
        data: {
          storyTheme: "r-CP59M3",
          storyLogoResource: "r-apIbmc",
          storyLogoLink:
            "https://www.esri.com/en-us/arcgis/products/arcgis-storymaps/overview",
          storyLogoAlt: "Visit the StoryMaps website"
        },
        config: {
          gaid: "UA-26529417-1",
          isPublishedDateHidden: false,
          isSocialIconsHidden: false
        },
        children: [
          "n-0dqpsv",
          "n-Jo21rM",
          "n-AW00-l",
          "n-iCbtsg",
          "n-h2iSa8",
          "n-gXFevk",
          "n-G75_k_",
          "n-JOWIiD",
          "n-VuqCvf",
          "n-uX-nCS",
          "n-2pOwfb",
          "n-3VbZSa",
          "n-_EtKBU",
          "n-fDP1yY",
          "n--HDZ6g",
          "n-NaVTq7",
          "n-lqgwmb",
          "n-BqVoQt",
          "n-JcNcQK",
          "n-ZX4OjP",
          "n-0wyRbh",
          "n-0DWJRy",
          "n-c4RPTn",
          "n-ZUX_ZQ",
          "n-96zr6E",
          "n-Db0WYt",
          "n-x7JfNV",
          "n-sCZt91",
          "n-EG6gXc",
          "n-DWhCV5",
          "n-jKRNWd",
          "n-jzADlI",
          "n-HxLT5P",
          "n-GAmcKm",
          "n-08g2S-",
          "n-_E2aHV",
          "n-Oq5nTU",
          "n-oj2ZAu",
          "n-E7BJGc",
          "n-A9QCFy",
          "n-mn9ekI",
          "n-atyjQM",
          "n-LhuEHt",
          "n-lfHLdX",
          "n-39Jlha",
          "n-HYU88Q"
        ]
      }
    },
    resources: {
      "r-EAs04K": {
        type: "image",
        data: {
          resourceId: "1585762887076.jpeg",
          provider: "item-resource",
          height: 3024,
          width: 4032
        }
      },
      "r-tF3IWl": {
        type: "image",
        data: {
          resourceId: "1585761720740.jpeg",
          provider: "item-resource",
          height: 800,
          width: 1200
        }
      },
      "r-SVYo3b": {
        type: "image",
        data: {
          resourceId: "1585764517408.jpeg",
          provider: "item-resource",
          height: 818,
          width: 1024
        }
      },
      "r-lsJgXf": {
        type: "image",
        data: {
          resourceId: "1585765088745.jpeg",
          provider: "item-resource",
          height: 409,
          width: 315
        }
      },
      "r-9kG4Sc": {
        type: "image",
        data: {
          resourceId: "1585765372270.png",
          provider: "item-resource",
          height: 1440,
          width: 2560
        }
      },
      "r-KP6GzQ": {
        type: "image",
        data: {
          resourceId: "1585765934455.jpeg",
          provider: "item-resource",
          height: 336,
          width: 500
        }
      },
      "r-g5lLgB": {
        type: "expressmap",
        data: {
          itemId: "expressmap_1585766802431.json"
        }
      },
      "r-jh8Dwb": {
        type: "image",
        data: {
          resourceId: "1585767419733.jpeg",
          provider: "item-resource",
          height: 597,
          width: 1006
        }
      },
      "r-7cde2828cb7042e39930412313935372": {
        type: "webmap",
        data: {
          extent: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            xmin: -8623420.129440807,
            ymin: 4680262.559012363,
            xmax: -8528408.71325951,
            ymax: 4733692.148642873
          },
          center: {
            spatialReference: {
              latestWkid: 3857,
              wkid: 102100
            },
            x: -8575914.421350159,
            y: 4706977.353827618
          },
          zoom: 10,
          viewpoint: {
            rotation: 0,
            scale: 288895.85493606684,
            targetGeometry: {
              spatialReference: {
                latestWkid: 3857,
                wkid: 102100
              },
              x: -8575914.421350159,
              y: 4706977.353827618
            }
          },
          mapLayers: [
            {
              id: "1711dd3268c-layer-0",
              title: "DC Cherry Trees",
              visible: true
            },
            {
              id: "1711dd3268c-layer-0_2551",
              title: "DC Cherry Trees || Glow",
              visible: true
            },
            {
              id: "TreeGridSummary_025km_6294",
              title: "TreeGridSummary_025km",
              visible: true
            },
            {
              id: "TreeGrid_Summary_05km_5981",
              title: "TreeGrid_Summary_05km",
              visible: true
            },
            {
              id: "1712757ba1e-layer-0",
              title: "TreeGridSummary_1km",
              visible: true
            }
          ],
          itemId: "7cde2828cb7042e39930412313935372",
          itemType: "Web Map",
          type: "default"
        }
      },
      "r-UGqRD3": {
        type: "image",
        data: {
          resourceId: "1585769105055.jpeg",
          provider: "item-resource",
          height: 800,
          width: 1200
        }
      },
      "r-qIMiD3": {
        type: "image",
        data: {
          resourceId: "1585864002821.jpeg",
          provider: "item-resource",
          height: 1380,
          width: 1200
        }
      },
      "r-hdIC7H": {
        type: "image",
        data: {
          resourceId: "1585770096361.jpeg",
          provider: "item-resource",
          height: 3512,
          width: 4682
        }
      },
      "r-9mzhMw": {
        type: "image",
        data: {
          resourceId: "1585864046012.jpeg",
          provider: "item-resource",
          height: 1380,
          width: 1200
        }
      },
      "r-8KlGav": {
        type: "image",
        data: {
          resourceId: "1585770454038.jpeg",
          provider: "item-resource",
          height: 1331,
          width: 2047
        }
      },
      "r-GWYxWH": {
        type: "image",
        data: {
          resourceId: "1585864069735.jpeg",
          provider: "item-resource",
          height: 1380,
          width: 1200
        }
      },
      "r-mo0Lcl": {
        type: "image",
        data: {
          resourceId: "1585770901238.jpeg",
          provider: "item-resource",
          height: 797,
          width: 1200
        }
      },
      "r-a98LEI": {
        type: "image",
        data: {
          resourceId: "1585864091231.jpeg",
          provider: "item-resource",
          height: 1380,
          width: 1200
        }
      },
      "r-4kKc3b": {
        type: "image",
        data: {
          resourceId: "1585771018601.jpeg",
          provider: "item-resource",
          height: 800,
          width: 1200
        }
      },
      "r-CP59M3": {
        type: "story-theme",
        data: {
          themeId: "slate",
          themeBaseVariableOverrides: {}
        }
      },
      "r-apIbmc": {
        type: "image",
        data: {
          resourceId: "1585762946779.png",
          provider: "item-resource",
          height: 128,
          width: 128
        }
      }
    }
  }
} as IModel;
