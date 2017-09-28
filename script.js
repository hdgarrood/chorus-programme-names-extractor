
function getSpreadsheetId() {
  var url = document.getElementById('spreadsheet-url').value;
  if (!url) {
    appendPre("Please enter a spreadsheet URL.");
    return;
  }
  var re = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/;
  var match = re.exec(url);
  if (match && match[1]) {
    return match[1];
  } else {
    appendPre("Unable to locate the spreadsheet");
  }
}

// This is horribly anglocentric
function compareNames(a, b) {
  var a_ = a.toUpperCase().split(" ");
  var b_ = b.toUpperCase().split(" ");
  if (a_[1] > b_[1]) {
    return 1;
  } else if (a_[1] < b_[1]) {
    return -1;
  } else {
    if (a_[0] > b_[0]) {
      return 1;
    } else if (a_[0] < b_[0]) {
      return -1;
    } else {
      return 0;
    }
  }
}

// Given a papaparse parse result, generate a string of programme names. Note
// that 'headers' must be set to true in the parse config.
function generateProgrammeNamesString(parse) {
  var voiceParts = ["Soprano", "Alto", "Tenor", "Bass"];

  if (parse.data.length === 0) {
    error("The provided CSV file was invalid/empty; have people responded yet?");
    return;
  } else if (!parse.data[0].hasOwnProperty("Name")) {
    error("No 'Name' column found in CSV data");
    return;
  } else if (!parse.data[0].hasOwnProperty("Voice part")) {
    error("No 'Voice part' column found in CSV data");
    return;
  }

  var namesBySection = voiceParts.map(x => []);

  parse.data.forEach((row, idx) => {
    var voice = row["Voice part"]
    var voiceIdx = voiceParts.indexOf(voice);
    if (voiceIdx === -1) {
      error("Unrecognised voice part on row " + idx + ": " + voice);
    } else {
      namesBySection[voiceIdx].push(row["Name"]);
    }
  });

  namesBySection.map(section => section.sort(compareNames));

  var result = [];

  voiceParts.forEach((sectionName, idx) => {
    result.push(sectionName);
    result = result.concat(namesBySection[idx]);
    result.push("");
  });

  return result.join("\r\n");
}

function error(msg) {
  console.error(msg);
}

function go() {
  var file = document.getElementById("csv-file-input").files[0];
  Papa.parse(file, { header: true, skipEmptyLines: true,
    complete: parse => {
      var str = generateProgrammeNamesString(parse);
      document.getElementById("result-message").textContent = "Everything seems ok";
      document.getElementById("result").value = str;
    }
  });
}

document.getElementById("go-button").addEventListener("click", go);
