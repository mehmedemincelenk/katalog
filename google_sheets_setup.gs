function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var contents = JSON.parse(e.postData.contents);
  var action = contents.action;
  
  // Tabloları isimle bul (Eğer yoksa hata verme, sessizce geç)
  var productSheet = ss.getSheetByName("products") || ss.getSheets()[0];
  var categorySheet = ss.getSheetByName("categories");
  var logSheet = ss.getSheetByName("search_logs");

  if (action === "ADD") {
    var p = contents.product;
    productSheet.appendRow([p.id, p.name, p.category, p.price, p.image, p.description, p.inStock, p.is_archived]);
  } 
  
  else if (action === "DELETE") {
    var id = contents.id;
    var rows = productSheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        productSheet.deleteRow(i + 1);
        break;
      }
    }
  } 
  
  else if (action === "UPDATE") {
    var id = contents.id;
    var changes = contents.changes;
    var rows = productSheet.getDataRange().getValues();
    var headers = rows[0];
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0] == id) {
        for (var key in changes) {
          var colIndex = headers.indexOf(key);
          if (colIndex > -1) {
            productSheet.getRange(i + 1, colIndex + 1).setValue(changes[key]);
          }
        }
        break;
      }
    }
  } 
  
  else if (action === "RENAME_CATEGORY") {
    var oldName = contents.oldName;
    var newName = contents.newName;
    
    // 1. Ürünlerdeki kategorileri güncelle
    var pRows = productSheet.getDataRange().getValues();
    var pHeaders = pRows[0];
    var pCol = pHeaders.indexOf("category");
    if (pCol > -1) {
      for (var i = 1; i < pRows.length; i++) {
        if (pRows[i][pCol] === oldName) {
          productSheet.getRange(i + 1, pCol + 1).setValue(newName);
        }
      }
    }
    
    // 2. Kategori tablosundaki ismi güncelle
    if (categorySheet) {
      var cRows = categorySheet.getDataRange().getValues();
      for (var j = 1; j < cRows.length; j++) {
        if (cRows[j][0] === oldName) {
          categorySheet.getRange(j + 1, 1).setValue(newName);
          break;
        }
      }
    }
  }

  else if (action === "UPDATE_CATEGORY_ORDER" && categorySheet) {
    var orderList = contents.orderList; // [{name, emoji, order}, ...]
    categorySheet.clearContents();
    categorySheet.appendRow(["name", "emoji", "display_order"]);
    for (var k = 0; k < orderList.length; k++) {
      var item = orderList[k];
      categorySheet.appendRow([item.name, item.emoji || "🏷️", k + 1]);
    }
  }

  else if (action === "LOG_SEARCH") {
    var logSheet = ss.getSheetByName("search_logs");
    if (logSheet) {
      var term = contents.term;
      var timestamp = new Date().toLocaleString("tr-TR");
      logSheet.appendRow([timestamp, term]);
    }
  }
  
  return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
}

function doGet() {
  return ContentService.createTextOutput("Multi-Sheet API Calisiyor.");
}
