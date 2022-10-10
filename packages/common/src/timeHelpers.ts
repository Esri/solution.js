/** @license
 * Copyright 2022 Esri
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

export function getPreferredTimeReference() {
  // //https://caniuse.com/?search=DateTimeFormat
  // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)

  // // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
  // var offset = new Date().getTimezoneOffset();
  // console.log(offset);

  const timeZone = _dojoFunc(new Date(new Date().getFullYear(), 0, 1)) ||
    _getTimeZoneName() || "Pacific Standard Time";
  const respectsDaylightSaving = _getRespectsDaylightSaving();
  return {
    preferredTimeReference: {
      timeZone,
      respectsDaylightSaving
    }
  };
}

function _getRespectsDaylightSaving() {
  const janTimeOffset = _getTimeOffset(0, 1);
  const octTimeOffset = _getTimeOffset(9, 1);
  return janTimeOffset !== octTimeOffset;
}

function _getTimeOffset(
  month: number, // 0 based
  day: number
) {
  const dateTimeFormat = new Intl.DateTimeFormat("en", {
    timeZoneName: "longOffset"
  });
  return dateTimeFormat.formatToParts(
    new Date(new Date().getFullYear(), month, day)
  ).find(formatted => formatted.type === "timeZoneName").value;
}

function _getTimeZoneName() {

  const timeOffset = _getTimeOffset(0, 1);

   const fullOffsetLookup = {
    "GMT-12:00": "Dateline Standard Time",
    "GMT-11:00": "Samoa Standard Time",
    "GMT-10:00": "Hawaiian Standard Time",
    "GMT-09:00": "Alaskan Standard Time",
    "GMT-08:00": "Pacific Standard Time",
    "GMT-07:00": "Mountain Standard Time",
    // "GMT-07:00": "Mexico Standard Time 2",
    // "GMT-07:00": "U.S. Mountain Standard Time",
    "GMT-06:00": "Central Standard Time",
    // "GMT-06:00": "Canada Central Standard Time",
    // "GMT-06:00": "Mexico Standard Time",
    // "GMT-06:00": "Central America Standard Time",
    "GMT-05:00": "Eastern Standard Time",
    // "GMT-05:00": "U.S. Eastern Standard Time",
    // "GMT-05:00": "S.A. Pacific Standard Time",
    "GMT-04:00": "Atlantic Standard Time",
    // "GMT-04:00": "S.A. Western Standard Time",
    // "GMT-04:00": "Pacific S.A. Standard Time",
    "GMT-03:30": "Newfoundland and Labrador Standard Time",
    "GMT-03:00": "E. South America Standard Time",
    // "GMT-03:00": "S.A. Eastern Standard Time",
    // "GMT-03:00": "Greenland Standard Time",
    "GMT-02:00": "Mid-Atlantic Standard Time",
    "GMT-01:00": "Azores Standard Time",
    // "GMT-01:00": "Cape Verde Standard Time",
    "GMT": "GMT Standard Time",
    // "GMT": "Greenwich Standard Time",
    "GMT+01:00": "Central Europe Standard Time",
    // "GMT+01:00": "Central European Standard Time",
    // "GMT+01:00": "Romance Standard Time",
    // "GMT+01:00": "W. Europe Standard Time",
    // "GMT+01:00": "W. Central Africa Standard Time",
    "GMT+02:00": "E. Europe Standard Time",
    // "GMT+02:00": "Egypt Standard Time",
    // "GMT+02:00": "FLE Standard Time",
    // "GMT+02:00": "GTB Standard Time",
    // "GMT+02:00": "Israel Standard Time",
    // "GMT+02:00": "South Africa Standard Time",
    "GMT+03:00": "Russian Standard Time",
    // "GMT+03:00": "Arab Standard Time",
    // "GMT+03:00": "E. Africa Standard Time",
    // "GMT+03:00": "Arabic Standard Time",
    "GMT+03:30": "Iran Standard Time",
    "GMT+04:00": "Arabian Standard Time",
    // "GMT+04:00": "Caucasus Standard Time",
    "GMT+04:30": "Transitional Islamic State of Afghanistan Standard Time",
    "GMT+05:00": "Ekaterinburg Standard Time",
    // "GMT+05:00": "West Asia Standard Time",
    "GMT+05:30": "India Standard Time",
    "GMT+05:45": "Nepal Standard Time",
    "GMT+06:00": "Central Asia Standard Time",
    // "GMT+06:00": "Sri Lanka Standard Time",
    // "GMT+06:00": "N. Central Asia Standard Time",
    "GMT+06:30": "Myanmar Standard Time",
    "GMT+07:00": "S.E. Asia Standard Time",
    // "GMT+07:00": "North Asia Standard Time",
    "GMT+08:00": "China Standard Time",
    // "GMT+08:00": "Singapore Standard Time",
    // "GMT+08:00": "Taipei Standard Time",
    // "GMT+08:00": "W. Australia Standard Time",
    // "GMT+08:00": "North Asia East Standard Time",
    "GMT+09:00": "Korea Standard Time",
    // "GMT+09:00": "Tokyo Standard Time",
    // "GMT+09:00": "Yakutsk Standard Time",
    "GMT+09:30": "A.U.S. Central Standard Time",
    // "GMT+09:30": "Cen. Australia Standard Time",
    "GMT+10:00": "A.U.S. Eastern Standard Time",
    // "GMT+10:00": "E. Australia Standard Time",
    // "GMT+10:00": "Tasmania Standard Time",
    // "GMT+10:00": "Vladivostok Standard Time",
    // "GMT+10:00": "West Pacific Standard Time",
    "GMT+11:00": "Central Pacific Standard Time",
    "GMT+12:00": "Fiji Islands Standard Time",
    // "GMT+12:00": "New Zealand Standard Time",
    "GMT+13:00": "Tonga Standard Time"
  };

  return fullOffsetLookup.hasOwnProperty(timeOffset) ? fullOffsetLookup[timeOffset] : "";

  // const offsetLookupName = {
  //   "Dateline Standard Time": "GMT-12:00",
  //   "Samoa Standard Time": "GMT-11:00",
  //   "Hawaiian Standard Time": "GMT-10:00",
  //   "Alaskan Standard Time": "GMT-09:00",
  //   "Pacific Standard Time": "GMT-08:00",
  //   "Mountain Standard Time": "GMT-07:00",
  //   "Mexico Standard Time 2": "GMT-07:00",
  //   "U.S. Mountain Standard Time": "GMT-07:00",
  //   "Central Standard Time": "GMT-06:00",
  //   "Canada Central Standard Time": "GMT-06:00",
  //   "Mexico Standard Time": "GMT-06:00",
  //   "Central America Standard Time": "GMT-06:00",
  //   "Eastern Standard Time": "GMT-05:00",
  //   "U.S. Eastern Standard Time": "GMT-05:00",
  //   "S.A. Pacific Standard Time": "GMT-05:00",
  //   "Atlantic Standard Time": "GMT-04:00",
  //   "S.A. Western Standard Time": "GMT-04:00",
  //   "Pacific S.A. Standard Time": "GMT-04:00",
  //   "Newfoundland and Labrador Standard Time": "GMT-03:30",
  //   "E. South America Standard Time": "GMT-03:00",
  //   "S.A. Eastern Standard Time": "GMT-03:00",
  //   "Greenland Standard Time": "GMT-03:00",
  //   "Mid-Atlantic Standard Time": "GMT-02:00",
  //   "Azores Standard Time": "GMT-01:00",
  //   "Cape Verde Standard Time": "GMT-01:00",
  //   "GMT Standard Time": "GMT",
  //   "Greenwich Standard Time": "GMT",
  //   "Central Europe Standard Time": "GMT+01:00",
  //   "Central European Standard Time": "GMT+01:00",
  //   "Romance Standard Time": "GMT+01:00",
  //   "W. Europe Standard Time": "GMT+01:00",
  //   "W. Central Africa Standard Time": "GMT+01:00",
  //   "E. Europe Standard Time": "GMT+02:00",
  //   "Egypt Standard Time": "GMT+02:00",
  //   "FLE Standard Time": "GMT+02:00",
  //   "GTB Standard Time": "GMT+02:00",
  //   "Israel Standard Time": "GMT+02:00",
  //   "South Africa Standard Time": "GMT+02:00",
  //   "Russian Standard Time": "GMT+03:00",
  //   "Arab Standard Time": "GMT+03:00",
  //   "E. Africa Standard Time": "GMT+03:00",
  //   "Arabic Standard Time": "GMT+03:00",
  //   "Iran Standard Time": "GMT+03:30",
  //   "Arabian Standard Time": "GMT+04:00",
  //   "Caucasus Standard Time": "GMT+04:00",
  //   "Transitional Islamic State of Afghanistan Standard Time": "GMT+04:30",
  //   "Ekaterinburg Standard Time": "GMT+05:00",
  //   "West Asia Standard Time": "GMT+05:00",
  //   "India Standard Time": "GMT+05:30",
  //   "Nepal Standard Time": "GMT+05:45",
  //   "Central Asia Standard Time": "GMT+06:00",
  //   "Sri Lanka Standard Time": "GMT+06:00",
  //   "N. Central Asia Standard Time": "GMT+06:00",
  //   "Myanmar Standard Time": "GMT+06:30",
  //   "S.E. Asia Standard Time": "GMT+07:00",
  //   "North Asia Standard Time": "GMT+07:00",
  //   "China Standard Time": "GMT+08:00",
  //   "Singapore Standard Time": "GMT+08:00",
  //   "Taipei Standard Time": "GMT+08:00",
  //   "W. Australia Standard Time": "GMT+08:00",
  //   "North Asia East Standard Time": "GMT+08:00",
  //   "Korea Standard Time": "GMT+09:00",
  //   "Tokyo Standard Time": "GMT+09:00",
  //   "Yakutsk Standard Time": "GMT+09:00",
  //   "A.U.S. Central Standard Time": "GMT+09:30",
  //   "Cen. Australia Standard Time": "GMT+09:30",
  //   "A.U.S. Eastern Standard Time": "GMT+10:00",
  //   "E. Australia Standard Time": "GMT+10:00",
  //   "Tasmania Standard Time": "GMT+10:00",
  //   "Vladivostok Standard Time": "GMT+10:00",
  //   "West Pacific Standard Time": "GMT+10:00",
  //   "Central Pacific Standard Time": "GMT+11:00",
  //   "Fiji Islands Standard Time": "GMT+12:00",
  //   "New Zealand Standard Time": "GMT+12:00",
  //   "Tonga Standard Time": "GMT+13:00"
  // };

  // const fullOffsetLookup = {
  //   "GMT-12:00": "Dateline Standard Time",
  //   "GMT-11:00": "Samoa Standard Time",
  //   "GMT-10:00": "Hawaiian Standard Time",
  //   "GMT-09:00": "Alaskan Standard Time",
  //   "GMT-08:00": "Pacific Standard Time",
  //   "GMT-07:00": "Mountain Standard Time",
  //   "GMT-07:00": "Mexico Standard Time 2",
  //   "GMT-07:00": "U.S. Mountain Standard Time",
  //   "GMT-06:00": "Central Standard Time",
  //   "GMT-06:00": "Canada Central Standard Time",
  //   "GMT-06:00": "Mexico Standard Time",
  //   "GMT-06:00": "Central America Standard Time",
  //   "GMT-05:00": "Eastern Standard Time",
  //   "GMT-05:00": "U.S. Eastern Standard Time",
  //   "GMT-05:00": "S.A. Pacific Standard Time",
  //   "GMT-04:00": "Atlantic Standard Time",
  //   "GMT-04:00": "S.A. Western Standard Time",
  //   "GMT-04:00": "Pacific S.A. Standard Time",
  //   "GMT-03:30": "Newfoundland and Labrador Standard Time",
  //   "GMT-03:00": "E. South America Standard Time",
  //   "GMT-03:00": "S.A. Eastern Standard Time",
  //   "GMT-03:00": "Greenland Standard Time",
  //   "GMT-02:00": "Mid-Atlantic Standard Time",
  //   "GMT-01:00": "Azores Standard Time",
  //   "GMT-01:00": "Cape Verde Standard Time",
  //   "GMT": "GMT Standard Time",
  //   "GMT": "Greenwich Standard Time",
  //   "GMT+01:00": "Central Europe Standard Time",
  //   "GMT+01:00": "Central European Standard Time",
  //   "GMT+01:00": "Romance Standard Time",
  //   "GMT+01:00": "W. Europe Standard Time",
  //   "GMT+01:00": "W. Central Africa Standard Time",
  //   "GMT+02:00": "E. Europe Standard Time",
  //   "GMT+02:00": "Egypt Standard Time",
  //   "GMT+02:00": "FLE Standard Time",
  //   "GMT+02:00": "GTB Standard Time",
  //   "GMT+02:00": "Israel Standard Time",
  //   "GMT+02:00": "South Africa Standard Time",
  //   "GMT+03:00": "Russian Standard Time",
  //   "GMT+03:00": "Arab Standard Time",
  //   "GMT+03:00": "E. Africa Standard Time",
  //   "GMT+03:00": "Arabic Standard Time",
  //   "GMT+03:30": "Iran Standard Time",
  //   "GMT+04:00": "Arabian Standard Time",
  //   "GMT+04:00": "Caucasus Standard Time",
  //   "GMT+04:30": "Transitional Islamic State of Afghanistan Standard Time",
  //   "GMT+05:00": "Ekaterinburg Standard Time",
  //   "GMT+05:00": "West Asia Standard Time",
  //   "GMT+05:30": "India Standard Time",
  //   "GMT+05:45": "Nepal Standard Time",
  //   "GMT+06:00": "Central Asia Standard Time",
  //   "GMT+06:00": "Sri Lanka Standard Time",
  //   "GMT+06:00": "N. Central Asia Standard Time",
  //   "GMT+06:30": "Myanmar Standard Time",
  //   "GMT+07:00": "S.E. Asia Standard Time",
  //   "GMT+07:00": "North Asia Standard Time",
  //   "GMT+08:00": "China Standard Time",
  //   "GMT+08:00": "Singapore Standard Time",
  //   "GMT+08:00": "Taipei Standard Time",
  //   "GMT+08:00": "W. Australia Standard Time",
  //   "GMT+08:00": "North Asia East Standard Time",
  //   "GMT+09:00": "Korea Standard Time",
  //   "GMT+09:00": "Tokyo Standard Time",
  //   "GMT+09:00": "Yakutsk Standard Time",
  //   "GMT+09:30": "A.U.S. Central Standard Time",
  //   "GMT+09:30": "Cen. Australia Standard Time",
  //   "GMT+10:00": "A.U.S. Eastern Standard Time",
  //   "GMT+10:00": "E. Australia Standard Time",
  //   "GMT+10:00": "Tasmania Standard Time",
  //   "GMT+10:00": "Vladivostok Standard Time",
  //   "GMT+10:00": "West Pacific Standard Time",
  //   "GMT+11:00": "Central Pacific Standard Time",
  //   "GMT+12:00": "Fiji Islands Standard Time",
  //   "GMT+12:00": "New Zealand Standard Time",
  //   "GMT+13:00": "Tonga Standard Time"
  // };
}

function _dojoFunc(/*Date*/dateObject){
	// summary:
	//		Get the user's time zone as provided by the browser
	// dateObject:
	//		Needed because the timezone may vary with time (daylight savings)
	// description:
	//		Try to get time zone info from toString or toLocaleString method of
	//		the Date object -- UTC offset is not a time zone.  See
	//		http://www.twinsun.com/tz/tz-link.htm Note: results may be
	//		inconsistent across browsers.

	var str = dateObject.toString(); // Start looking in toString
	var tz = ''; // The result -- return empty string if nothing found
	var match;

	// First look for something in parentheses -- fast lookup, no regex
	var pos = str.indexOf('(');
	if(pos > -1){
		tz = str.substring(++pos, str.indexOf(')'));
	}else{
		// If at first you don't succeed ...
		// If IE knows about the TZ, it appears before the year
		// Capital letters or slash before a 4-digit year
		// at the end of string
		var pat = /([A-Z\/]+) \d{4}$/;
		if((match = str.match(pat))){
			tz = match[1];
		}else{
		// Some browsers (e.g. Safari) glue the TZ on the end
		// of toLocaleString instead of putting it in toString
			str = dateObject.toLocaleString('en-US', { timeZone: 'America/Chicago' });
			// Capital letters or slash -- end of string,
			// after space
			pat = / ([A-Z\/]+)$/;
			if((match = str.match(pat))){
				tz = match[1];
			}
		}
	}

	// Make sure it doesn't somehow end up return AM or PM
	return (tz == 'AM' || tz == 'PM') ? '' : tz; // String
};