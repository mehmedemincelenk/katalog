/**
 * GOOGLE APPS SCRIPT (Final Kesin Çözüm)
 */

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Products");
    
    if (!sheet) {
      sheet = ss.insertSheet("Products");
      sheet.appendRow(["id", "name", "category", "price", "image", "description", "inStock", "is_archived"]);
    }
    
    if (action === "DELETE_ALL") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        // Güvenli temizlik yöntemi: Aralığı seç ve içeriği sil
        sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).clear(); 
      }
      return ContentService.createTextOutput("Success: Full Clear").setMimeType(ContentService.MimeType.TEXT);
    }
    
    if (action === "BULK_ADD") {
      var rows = data.products.map(function(p) {
        return [
          String(p.id), 
          String(p.name), 
          String(p.category), 
          String(p.price), 
          String(p.image || ""), 
          String(p.description || ""), 
          "true", 
          "false"
        ];
      });
      // Verileri 2. satırdan başlayarak ekle (başlık korunur)
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
      return ContentService.createTextOutput("Success: Added " + rows.length).setMimeType(ContentService.MimeType.TEXT);
    }
    
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}
