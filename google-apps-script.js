function doGet(e) {
  // Handle GET requests - return sheet data as JSON
  try {
    const action = e.parameter.action;

    if (action === 'getUsers') {
      // Return users from separate sheet
      const usersSheet = SpreadsheetApp
        .openById('ТВОЙ_SHEET_ID')
        .getSheetByName('users'); // лист с пользователями

      const userData = usersSheet.getDataRange().getValues();

      return ContentService
        .createTextOutput(JSON.stringify({ values: userData }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } else {
      // Return learning data from Sheet1
      const sheet = SpreadsheetApp
        .openById('ТВОЙ_SHEET_ID')
        .getSheetByName('Sheet1'); // лист с данными обучения

      const data = sheet.getDataRange().getValues();

      return ContentService
        .createTextOutput(JSON.stringify({ values: data }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeader('Access-Control-Allow-Origin', '*')
        .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        .setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === 'addUser') {
      // Add user to users sheet
      const usersSheet = SpreadsheetApp
        .openById('ТВОЙ_SHEET_ID')
        .getSheetByName('users');

      // Check if user already exists
      const existingUsers = usersSheet.getDataRange().getValues();
      const userExists = existingUsers.some(row => row[0] === data.email);

      if (!userExists) {
        usersSheet.appendRow([
          data.email,
          data.password,
          data.role || 'student',
          data.timestamp || new Date().toISOString()
        ]);
        console.log('User added to Google Sheets:', data.email);
      } else {
        console.log('User already exists:', data.email);
      }
    } else {
      // Log user actions to logs sheet
      const logsSheet = SpreadsheetApp
        .openById('ТВОЙ_SHEET_ID')
        .getSheetByName('logs');

      logsSheet.appendRow([
        data.timestamp || new Date().toISOString(),
        data.userEmail || '',
        data.userRole || '',
        data.action || '',
        JSON.stringify(data)
      ]);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Handle OPTIONS requests for CORS
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
