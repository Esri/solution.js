/*!
 | XSS Filter Evasion Examples
*/
/*--------------------------------------------------------------------------------------------------------------------*/

export interface IXSSTestCase {
  label: string;
  example: string;
  cleanedHtml: string;
  cleanedNoHtml: string;
}

export const testCases: IXSSTestCase[] = [
  {
    // Example from https://github.com/google/caja/wiki/JsHtmlSanitizer
    // By Kevin Reid
    // License: Apache 2.0 (https://github.com/google/caja/blob/master/LICENSE.txt)
    label: "JsHtmlSanitizer",
    example:
      '<b>hello</b><img src="http://asdf"><a href="javascript:alert(0)"><script src="http://dfd"></script>',
    cleanedHtml:
      '<b>hello</b><img src="http://asdf"><a href>&lt;script src="http://dfd"&gt;&lt;/script&gt;',
    cleanedNoHtml: "hello"
  },
  {
    // Example from "When Security Features Collide" (http://blog.portswigger.net/2017/10/when-security-features-collide.html)
    // By James Kettle
    label: "When Security Features Collide 1",
    example: '<a href="mailto:b" a/b/c>hover</a>',
    cleanedHtml: '<a href="mailto:b">hover</a>',
    cleanedNoHtml: "hover"
  },
  {
    // Example from "When Security Features Collide" (http://blog.portswigger.net/2017/10/when-security-features-collide.html)
    // By James Kettle
    label: "When Security Features Collide 2",
    example: '<a href="mailto:a" onmouseover/="alert(1)">hover</a>',
    cleanedHtml: '<a href="mailto:a">hover</a>',
    cleanedNoHtml: "hover"
  },
  {
    // Example from "When Security Features Collide" (http://blog.portswigger.net/2017/10/when-security-features-collide.html)
    // By James Kettle
    label: "When Security Features Collide 3",
    example: '<a href="mailto:a" onmouseover/="alert/(1)">hover</a>',
    cleanedHtml: '<a href="mailto:a">hover</a>',
    cleanedNoHtml: "hover"
  },
  {
    // Example from "When Security Features Collide" (http://blog.portswigger.net/2017/10/when-security-features-collide.html)
    // By James Kettle
    label: "When Security Features Collide 4",
    example:
      '<select><noembed></select><script x="a@b"a>y="a@b"//a@b%0a\u0061lert(1)</script x>',
    cleanedHtml:
      '&lt;select&gt;&lt;noembed&gt;&lt;/select&gt;&lt;script x="a@b"a&gt;y="a@b"//a@b%0aalert(1)&lt;/script x&gt;',
    cleanedNoHtml: ""
  },
  {
    // Example from devtopia issue 12899
    // By Tao Ruan
    // License: Apache 2.0 (http://www.apache.org/licenses/LICENSE-2.0)
    label: "ontoggle",
    example: '><details/open/ontoggle=alert("XSS")>',
    cleanedHtml: '&gt;&lt;details/open/ontoggle=alert("XSS")&gt;',
    cleanedNoHtml: "&gt;"
  }
];
