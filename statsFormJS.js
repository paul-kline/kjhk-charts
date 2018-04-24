totalsongs = 0;
rotationsongs = 0;
manuallylogged = 0;
elapsedHours = 0;
/*
 * This function counts some things and shows it.
 */
function getStats(everything, songs) {
  totalsongs = 0;
  rotationsongs = 0;
  manuallylogged = 0;
  everything.forEach(function(thing) {
    totalsongs++;
    if (thing.rotation == 1) {
      rotationsongs++;
    }
    if (thing.manual == 1) {
      manuallylogged++;
    }
  });
  document.getElementById("stats").innerHTML = "Stats:<br>";
  $("#stats").append(
    "Rotation per hour: " + rotationsongs / elapsedHours + "<br>"
  );
  $("#stats").append(
    "Percent CD/Records: " + manuallylogged / totalsongs * 100 + "%<br>"
  );
  console.log("songs length:" + songs.length);
  console.log("everything length: " + everything.length);
  $("#stats").append(
    "Uniqueness Ratio: " +
      songs.length / everything.length +
      " A perfect score of '1' would indicate no song was ever repeated."
  );
}

function getStatsPromise(everything, songs) {
  return new Promise((resolve, reject) => {
    try {
      getStats(everything, songs);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}
/*
 * Takes an array. Not used??
 */
function findWithPropVal(somearray) {
  var result = [];
  somearray.forEach(function(element) {
    var meetsReq = true;
    for (var i = 1; i < arguments.length - 1; i = i + 2) {
      var prop = arguments[i];
      var val = arguments[i + 1];
      if (element[prop] != val) {
        meetsReq = false;
        break;
      }
    }
    if (meetsReq) {
      result.push(element);
    }
  });
  return meetsReq;
}

/*
 * Takes an array of objects and a property, creates groups based on the
 * different values in that property domain, and
 * RETURNS: an array of the first object from each group with a new property 
 * called 'plays' that is the number of times there was an object with that
 * property value.
 * @param {type} input the list of objects
 * @param {type} prop the property to count
 * @returns {Array|consolidate.result} see above.
 */
function consolidate(input, prop) {
  var result = [];
  var propGroups = myGroupBy(input, prop);
  for (groupname in propGroups) {
    var newobj = propGroups[groupname][0];
    for (var i = 1; i < propGroups[groupname].length; i++) {
      newobj.plays += propGroups[groupname][i].plays;
      if (newobj.central_time < propGroups[groupname][i].central_time) {
        newobj.central_time = propGroups[groupname][i].central_time;
      }
    }
    result.push(newobj);
  }
  return result;
}

function consolidatePromise(input, prop) {
  return new Promise((resolve, reject) => {
    try {
      var x = consolidate(input, prop);
      if (x !== undefined) {
        resolve(x);
      } else {
        reject(
          "result of getUniquesWCountAndMostRecentPromise called on: " +
            input +
            " and " +
            prop +
            " was undefined."
        );
      }
    } catch (e) {
      reject(e);
    }
  });
}

/*
 * 
 * @param {type} inputArray takes an array and 
 * any number of optional parameters that are properties of objects in the
 * input array and it removes them all!!
 * @returns {unresolved} what you gave me, with the properties removed.
 */
function removeProperties(inputArray) {
  for (var i = 1; i < arguments.length; i++) {
    // console.log("deleting field: " + arguments[i]);
    for (var j = 0; j < inputArray.length; j++) {
      inputArray[j][arguments[i]] = undefined;
      delete inputArray[j][arguments[i]];
    }
  }
  return inputArray;
}

/*
 * 
 * @param {type} input
 * @returns {Array|getUniquesWCountAndMostRecent.resultp} an array of unique 
 * songs with the added "plays" property
 */
function getUniquesWCountAndMostRecent(input, prop) {
  //groups by the artists
  var groupedByArtist = myGroupBy(input, "artist");
  var resultp = [];
  //for each artist A..
  for (var artist in groupedByArtist) {
    //makes groups for all the songs by this artist A
    var uniqueSonggroups = myGroupBy(groupedByArtist[artist], prop);
    //for each song S by A artist...
    for (var onesong in uniqueSonggroups) {
      var songGroup = uniqueSonggroups[onesong];
      var bestsong = songGroup[0];
      //I think this just finds the most recently played song,
      //and we're gunna use that one because it makes the most
      //sense to use the most recent one to show.
      for (var i = 1; i < songGroup.length; i++) {
        if (songGroup[i].central_time > bestsong.central_time) {
          bestsong = songGroup[i];
        }
      }

      //add a property to our representative play called "plays" that
      //is the number of times this song got played.
      bestsong["plays"] = songGroup.length;
      resultp.push(bestsong);
    }
  }
  return resultp;
}

function getUniquesWCountAndMostRecentPromise(input, prop) {
  return new Promise((resolve, reject) => {
    try {
      var x = getUniquesWCountAndMostRecent(input, prop);
      if (x !== undefined) {
        resolve(x);
      } else {
        reject(
          "result of getUniquesWCountAndMostRecentPromise called on: " +
            input +
            " and " +
            prop +
            " was undefined."
        );
      }
    } catch (e) {
      reject(e);
    }
  });
}
/*
 * takes an array of objects and a properties. 
 * 
 * RETURNS an object with properties that are
 * the VALUES of the property listed and the key
 * is an array of all the objects that had that property. :)
 */
function myGroupBy(input, prop) {
  var groups = {};
  input.forEach(function(x) {
    if (groups[x[prop]] === undefined) {
      var handled = false;
      if (typeof x[prop] === "string") {
        for (possible in groups) {
          if (possible.toUpperCase().trim() == x[prop].toUpperCase().trim()) {
            groups[possible].push(x);
            handled = true;
            break;
          }
        }
      }
      if (!handled) {
        groups[x[prop]] = [x];
      }
    } else {
      groups[x[prop]].push(x);
    }
  });
  return groups;
}

function myGroupByPromise(input, prop) {
  return new Promise((resolve, reject) => {
    try {
      var x = myGroupBy(input, prop);
      if (x !== undefined) {
        resolve(x);
      } else {
        reject(
          "result of myGroupBy called on: " +
            input +
            " and " +
            prop +
            " was undefined."
        );
      }
    } catch (e) {
      reject(e);
    }
  });
}
/*
 * 
 * @param {type} input converts stupid gravity forms data into 
 * proper field named data.
 * @returns {Array|convert.resu} array of each play instance.
 */
function convert(input) {
  //    var FIELD_MAPPING = {
  //        artist   : 2,
  //        album    : 3,
  //        song     : 4,
  //        rotation : 6
  //    };
  //    var uniqueDates = [];
  //    input.forEach(function (x) {
  //        if ($.inArray(x.central_time, uniqueDates) == -1) {
  //            uniqueDates.push(x.central_time);
  //        }
  //    })
  //alert("uniques: " + uniqueDates);

  /* First we group by the central_time, we do this because the information
     * for each song is stupidly thrown into one giant mess of a database.
     * The only way to group all the info about ONE particular play is 
     * to create 'groups' based on the EXACT time, since the info for a song
     * is all added at once.
     */
  var datedgroups = myGroupBy(input, "central_time");
  //dategroups is songs.
  var resu = [];
  //for each date-time instance (group of song play info)..
  for (var prop in datedgroups) {
    //give me the info we have about this song.
    var songBlob = datedgroups[prop];
    var newEntry = {};
    //loop through the stupid field names wp gravity forms gave us.
    //Gravity forms is stupid.
    //and map it to what it really means.
    songBlob.forEach(function(entryBefore) {
      // alert(typeof entryBefore.field_number);
      switch (parseInt(entryBefore.field_number)) {
        case 6:
          newEntry.rotation = entryBefore.value;
          break;
        case 2:
          newEntry.artist = entryBefore.value;
          break;
        case 3:
          newEntry.album = entryBefore.value;
          break;
        case 4:
          newEntry.song = entryBefore.value;
          break;
        default:
          alert("unexpected num: " + entryBefore.field_number + " found.");
          break;
      }
    });
    newEntry.central_time = songBlob[0].central_time;
    newEntry.user_agent = songBlob[0].user_agent == "API" ? "API" : "manual";
    resu.push(newEntry);
  }
  //    var resustr = "";
  //    resu.forEach(function (x) {
  //        resustr += x + "\n";
  //    })
  // alert("resu " + resustr);
  return resu;
}

/*
 * I'm not sure. makes a table somehow.
 */
function convertToTable(obj, dat, shouldScroll, sortByls) {
  var columns = [];
  for (prop in dat[0]) {
    var thing = {};
    thing.title = prop;
    thing.data = prop;
    columns.push(thing);
  }

  var settings = {};
  settings.columns = columns;
  settings.data = dat;
  settings.retrieve = true;
  settings.select = { style: "single" };
  settings.colReorder = true;
  settings.autoWidth = false;
  if (shouldScroll) {
    settings.deferRender = true;
    settings.scrollY = 300;
    settings.scrollCollapse = true;
    settings.scroller = true;
  }
  if (sortByls != undefined) {
    var arr = [];
    sortByls.forEach(function(sorter) {
      arr.push([sorter.col, sorter.dir]);
    });
    if (arr.length > 0) {
      settings.order = arr;
    }
  }
  obj.DataTable(settings);
  //alert("json parsed:" + res);
  //                if (shouldScroll) {
  //                    obj.DataTable({
  //                        columns: columns,
  //                        data: dat,
  //                        retrieve: true,
  //                        select: {
  //                            style: 'single'
  //                        },
  //                        colReorder: true,
  //                        deferRender: true,
  //                        scrollY: 300,
  //                        scrollCollapse: true,
  //                        scroller: true
  //
  //
  //                    });
  //                } else {
  //                    obj.DataTable({
  //                        columns: columns,
  //                        data: dat,
  //                        retrieve: true,
  //                        select: {
  //                            style: 'single'
  //                        },
  //                        colReorder: true,
  //                    });
  //                }
}

function convertToTablePromise(obj, dat, shouldScroll, sortByls) {
  return new Promise((resolve, reject) => {
    try {
      convertToTable(obj, dat, shouldScroll, sortByls);
      resolve();
    } catch (e) {
      reject("error convertingToTable: " + e);
    }
  });
}

function performSubmit() {
  $("body").addClass("loading");
  // alert("hey there!");
  tableids = ["#everythingTable", "#songTable", "#albumTable", "#artistTable"];
  tableids.forEach(function(name) {
    try {
      if ($.fn.dataTable.isDataTable(name)) {
        console.log("destroying mytable");
        $(name)
          .DataTable()
          .destroy();
      }
    } catch (e) {
      console.log("failed to delete table: " + name + ": " + e);
    }
  });
  var times = [];
  var bigDates = [];
  $(".newDate").each(function(i, obj) {
    bigDates[i] = $(this).datepicker("getDate");
    var modayyear = [];
    modayyear = $(this)
      .val()
      .split("/");
    times[i] = modayyear[2] + "-" + modayyear[0] + "-" + modayyear[1];
  });
  $(".newTime").each(function(i, obj) {
    var tiger = $(this).timepicker("getTime");
    bigDates[i].setHours(tiger.getHours(), tiger.getMinutes());
    console.log("time: " + i + " " + bigDates[i]);
    var timearr = strTimeArray($(this).val());
    times[i] += " " + timearr[0] + ":" + timearr[1] + ":00";
  });
  var intervals = [];
  elapsedHours = 0;
  for (var i = 0; i < times.length; i = i + 2) {
    var gt = times[i];
    var lt = times[i + 1];
    var obj = {};
    obj["gt"] = gt;
    obj["lt"] = lt;
    elapsedHours += Math.max(0, bigDates[i + 1] - bigDates[i]);
    intervals.push(obj);
  }
  console.log("requesting these intervals:", intervals);
  elapsedHours = elapsedHours / (1000 * 60 * 60);
  console.log("elapsedTime: " + elapsedHours + " hours.");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
      var res = [];
      var res2 = [];
      var playTable = [];
      var artistTable = [];
      var albumTable = [];
      var justGo = true;
      var response = "";
      try {
        response = xhttp.responseText;
        res = JSON.parse(response);
        // console.log("here was successfully parsed response!", res);
        res2 = removeProperties(res, "id", "log_id", "auto_inc", "timestamp"); // convert(res);
        convertToTable($("#everythingTable"), res2, false, [
          { col: 0, dir: "desc" }
        ]);
      } catch (e) {
        console.log("failed to parse response: " + response);
        justGo = false;
        alert(e);
      }
      if (justGo) {
        new Promise((resolve, reject) => {});

        getUniquesWCountAndMostRecentPromise(clone(res2, false), "song")
          .then(playTable => {
            playTable = removeProperties(
              playTable,
              "djrealname",
              "djname",
              "program"
            );
            let statsPromise = getStatsPromise(res2, playTable);
            // console.log("play table length-1", playTable[0]);
            // xjj = playTable[0];
            let songTablePromise = convertToTablePromise(
              $("#songTable"),
              playTable,
              false,
              [{ col: Object.keys(playTable[0]).length - 1, dir: "desc" }]
            );
            let artistTablePromise = consolidatePromise(
              clone(playTable, false),
              "artist"
            ).then(artistTable => {
              artistTable = removeProperties(
                artistTable,
                "rotation",
                "album",
                "song",
                "user_agent",
                "song_length"
              );
              return convertToTablePromise(
                $("#artistTable"),
                artistTable,
                false,
                [{ col: Object.keys(artistTable[0]).length - 1, dir: "desc" }]
              );
            });

            let albumPromise = getUniquesWCountAndMostRecentPromise(
              clone(playTable),
              "album"
            ).then(albumTable => {
              // console.log("albumTable:\n");
              // console.log(albumTable);
              albumTable = removeProperties(
                albumTable,
                "song",
                "user_agent",
                "song_length"
              );
              return convertToTablePromise(
                $("#albumTable"),
                albumTable,
                false,
                [{ col: Object.keys(albumTable[0]).length - 1, dir: "desc" }]
              );
            });

            return Promise.all([
              statsPromise,
              songTablePromise,
              artistTablePromise,
              albumPromise
            ]);
          })
          .then(() => {
            $("body").removeClass("loading");
          })
          .catch(e => {
            alert("failed to create SOMETHING. aborting");
            justGo = false;
            console.log("this was the error: ");
            console.log(e);
            alert(e);
          });

        //                try {
        //                    playTable = getUniquesWCountAndMostRecent(clone(res2, false), "song");
        //                    getStats(res2, playTable);
        //                    convertToTable($("#songTable"), playTable, false, [{"col": 6, "dir": 'desc'}]);
        //                } catch (e) {
        //                    alert("failed to create songTable. aborting");
        //                    justGo = false;
        //                    alert(e);
        //                }
      }
      //            (async function () {
      //                if (justGo) {
      //                    try {
      //                        artistTable = consolidate(clone(playTable, false), "artist");
      //                        console.log("artistTableobj:\n");
      //                        console.log(artistTable);
      //                        artistTable = removeProperties(artistTable,
      //                                "rotation", "album", "song", "user_agent"
      //                                );
      //                        convertToTable($("#artistTable"), artistTable, false, [{"col": 2, "dir": 'desc'}]);
      //                    } catch (e) {
      //                        alert("failed to create ArtistTable. aborting");
      //                        justGo = false;
      //                        alert(e);
      //                    }
      //                }
      //            }
      //            )();
      //            //ALBUM------------------------------
      //            (async () => {
      //                if (justGo) {
      //                    try {
      //                        //this is done instead of the consolidate method because there
      //                        //are many albums with NA.
      //                        albumTable = getUniquesWCountAndMostRecent(clone(playTable), "album");
      //                        console.log("albumTable:\n");
      //                        console.log(albumTable);
      //                        albumTable = removeProperties(albumTable,
      //                                "song", "user_agent"
      //                                );
      //                        convertToTable($("#albumTable"), albumTable, false, [{"col": 4, "dir": 'desc'}]);
      //                    } catch (e) {
      //                        alert("failed to create AlbumTable. aborting");
      //                        justGo = false;
      //                        alert(e);
      //                        console.log(e);
      //                    }
      //                }
      //            })();
      //            $("body").removeClass("loading");
    }
  };
  xhttp.open("POST", "//kjhk.org/testing/djstats/kjhkmusicapi.php", true);
  xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhttp.send("intervals=" + JSON.stringify(intervals));
}

function getShifts() {
  var starttime = $("#startTime").val();
  var endtime = $("#endTime").val();
  var startdate = $("#startDate").val();
  var enddate = $("#endDate").val();
  var arrd1 = startdate.split("/");
  var time1arr = strTimeArray(starttime);
  // alert("start time: " + time1arr);
  var arrd2 = enddate.split("/");
  var time2arr = strTimeArray(endtime);
  var datestart1 = new Date(
    arrd1[2],
    arrd1[0] - 1,
    arrd1[1],
    time1arr[0],
    time1arr[1]
  );
  var datestart2 = new Date(
    arrd1[2],
    arrd1[0] - 1,
    arrd1[1],
    time2arr[0],
    time2arr[1]
  );
  var dateend1 = new Date(
    arrd2[2],
    arrd2[0] - 1,
    arrd2[1],
    time1arr[0],
    time1arr[1]
  );
  var dateend2 = new Date(
    arrd1[2],
    arrd2[0] - 1,
    arrd2[1],
    time2arr[0],
    time2arr[1]
  );
  var showArray = [];
  var tempDate1 = dateend1;
  var tempDate2 = dateend2;
  var limit = 500;
  while (tempDate1 >= datestart1 && limit > 0) {
    showArray.push(tempDate1);
    showArray.push(tempDate2);
    var d1 = new Date();
    var d2 = new Date();
    console.log(tempDate1);
    d1.setTime(tempDate1.getTime());
    d1.setDate(tempDate1.getDate() - 7);
    d2.setTime(tempDate2.getTime());
    d2.setDate(tempDate2.getDate() - 7);
    tempDate1 = d1;
    tempDate2 = d2;
    limit--;
  }
  if (limit < 2) {
    alert("limit reached!!");
  }
  var str = "";
  var strdates = [];
  var strtimes = [];
  for (var i = 0; i < showArray.length; i++) {
    var id1 = '"startDate' + i + '"';
    var newD = "<input id=" + id1 + ' class="newDate" type="text" />';
    //  $("#" + id1).before($(newD));
    str += newD;
    strdates.push(newD);
    var id2 = '"startTime' + i + '"';
    var newT = "<input id=" + id2 + ' class="newTime" type="text" />\n';
    strtimes.push(newT);
    str += newT;
    if (i % 2 == 1) {
      str += "<br>";
    } else {
      str += " to ";
    }
  }
  document.getElementById("mydiv").innerHTML = str;
  $("#mydiv").append('<button onclick="performSubmit()">submit</button>');
  setTimeout(function() {
    for (var i = 0; i < showArray.length; i++) {
      var id1 = "startDate" + i + "";
      //  $("#" + id1).before($(strdates[i]));
      $("#" + id1).datepicker();
      $("#" + id1).datepicker("setDate", showArray[i]);
      var id2 = "startTime" + i + "";
      $("#" + id2).timepicker();
      $("#" + id2).timepicker("setTime", showArray[i]);
    }
  }, 20);
}

function strTimeArray(str) {
  var arr = str.split(":");
  var addthis = 0;
  if (str.indexOf("pm") == -1) {
    //AM
    if (arr[0] == 12) {
      addthis = -12;
    }
  } else {
    //PM
    if (arr[0] == 12) {
      addthis = 0;
    } else {
      addthis = 12;
    }
  }

  var result = [];
  result.push(arr[0] * 1 + addthis);
  var numberPattern = /\d+/;
  result.push(arr[1].match(numberPattern));
  return result;
}
$(function() {
  $(".time").timepicker({ scrollDefault: "now" });
  $(".dater").datepicker();
  //    $('#startDate').datepicker("setDate", new Date(2016, 0, 19));
  //    $('#endDate').datepicker("setDate", new Date());
  quickSun();
});

let thresh = 200;
let lastT = Date.now();
$(window).resize(function() {
  if (Date.now() - lastT < thresh) {
    return;
  }
  tableids.forEach(function(x) {
    $(x).resize();
  });
  lastT = Date.now();
});
