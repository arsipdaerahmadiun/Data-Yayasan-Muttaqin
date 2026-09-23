// Temporary file to verify complete Google Apps Script code syntax and mock execution
const mockSheet = {
  getName: () => 'Database Yayasan Mock',
  getUrl: () => 'https://docs.google.com/spreadsheets/d/12345/edit',
  getSheetByName: (name) => null,
  insertSheet: (name) => ({
    getMaxColumns: () => 26,
    getMaxRows: () => 1000,
    insertColumnsAfter: (c, n) => {},
    insertRowsAfter: (r, n) => {},
    getLastRow: () => 0,
    getLastColumn: () => 0,
    getRange: () => ({
      setValues: () => {},
      setBackground: () => {},
      setFontColor: () => {},
      setFontWeight: () => {},
      setHorizontalAlignment: () => {},
      clearContent: () => {}
    }),
    setFrozenRows: () => {}
  })
};

global.SpreadsheetApp = {
  getActiveSpreadsheet: () => mockSheet,
  openById: () => mockSheet,
  openByUrl: () => mockSheet,
  create: () => mockSheet,
  getUi: () => ({
    createMenu: () => ({
      addItem: function() { return this; },
      addToUi: () => {}
    })
  })
};

global.Logger = {
  log: (...args) => console.log('[AppsScript Log]:', ...args)
};

global.ContentService = {
  MimeType: { JSON: 'application/json' },
  createTextOutput: (text) => ({
    setMimeType: () => text
  })
};

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: () => null,
    setProperty: () => {}
  })
};

// Now test execution
console.log('Mock environment configured.');
