/**
 * GOOGLE APPS SCRIPT (Final Kesin Çözüm - Multi-Select & Settings)
 */

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var settingsSheet = ss.getSheetByName("Settings");
  if (!settingsSheet) return ContentService.createTextOutput("{}").setMimeType(ContentService.MimeType.JSON);
  
  var rows = settingsSheet.getDataRange().getValues();
  var settingsObj = {};
  for (var i = 1; i < rows.length; i++) {
    settingsObj[rows[i][0]] = rows[i][1];
  }
  
  return ContentService.createTextOutput(JSON.stringify(settingsObj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    var action = data.action;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Products");
    
    // Ürünler sekmesi yoksa oluştur
    if (!sheet) {
      sheet = ss.insertSheet("Products");
      sheet.appendRow(["id", "name", "category", "price", "image", "description", "inStock", "is_archived"]);
    }
    
    // Ayarlar sekmesi yoksa oluştur
    var settingsSheet = ss.getSheetByName("Settings");
    if (!settingsSheet) {
      settingsSheet = ss.insertSheet("Settings");
      settingsSheet.appendRow(["key", "value"]);
      // Varsayılan ayarlar
      var defaultSettings = [
        ["whatsapp", "+90 537 342 0161"],
        ["address", "Mahmutbey Cd. No:10, Yenibosna / İstanbul"],
        ["instagram", "https://www.instagram.com/toptanambalajcim"],
        ["title", "Toptan Ambalajcım"],
        ["subtitle", "ÖMER KÖSE"]
      ];
      settingsSheet.getRange(2, 1, defaultSettings.length, 2).setValues(defaultSettings);
    }
    
    // 1. AYARLARI GETİR
    if (action === "GET_SETTINGS") {
      var rows = settingsSheet.getDataRange().getValues();
      var settingsObj = {};
      for (var i = 1; i < rows.length; i++) {
        settingsObj[rows[i][0]] = rows[i][1];
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "Success", data: settingsObj })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. AYARLARI GÜNCELLE
    if (action === "UPDATE_SETTINGS") {
      var rows = settingsSheet.getDataRange().getValues();
      var key = data.key;
      var value = data.value;
      var found = false;
      
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === key) {
          settingsSheet.getRange(i + 1, 2).setValue(value);
          found = true;
          break;
        }
      }
      
      if (!found) {
        settingsSheet.appendRow([key, value]);
      }
      return ContentService.createTextOutput("Success: Setting Updated").setMimeType(ContentService.MimeType.TEXT);
    }

    // 3. TOPLU SİLME (DELETE_ALL)
    if (action === "DELETE_ALL") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).clear(); 
      }
      return ContentService.createTextOutput("Success: Full Clear").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 4. TOPLU EKLEME (BULK_ADD)
    if (action === "BULK_ADD") {
      var rows = data.products.map(function(p) {
        return [String(p.id), String(p.name), String(p.category), String(p.price), String(p.image || ""), String(p.description || ""), "true", "false"];
      });
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 8).setValues(rows);
      return ContentService.createTextOutput("Success: Added " + rows.length).setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 5. TEK ÜRÜN GÜNCELLEME
    if (action === "UPDATE") {
      var rows = sheet.getDataRange().getValues();
      var id = data.id;
      var changes = data.changes;
      
      for (var i = 1; i < rows.length; i++) {
        if (String(rows[i][0]) === String(id)) {
          if (changes.name !== undefined) sheet.getRange(i + 1, 2).setValue(changes.name);
          if (changes.category !== undefined) sheet.getRange(i + 1, 3).setValue(changes.category);
          if (changes.price !== undefined) sheet.getRange(i + 1, 4).setValue(changes.price);
          if (changes.image !== undefined) sheet.getRange(i + 1, 5).setValue(changes.image);
          if (changes.description !== undefined) sheet.getRange(i + 1, 6).setValue(changes.description);
          if (changes.inStock !== undefined) sheet.getRange(i + 1, 7).setValue(String(changes.inStock));
          if (changes.is_archived !== undefined) sheet.getRange(i + 1, 8).setValue(String(changes.is_archived));
          break;
        }
      }
      return ContentService.createTextOutput("Success: Updated").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 6. TEK ÜRÜN SİLME
    if (action === "DELETE") {
      var rows = sheet.getDataRange().getValues();
      for (var i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === String(data.id)) {
          sheet.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput("Success: Deleted").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 7. YENİ ÜRÜN EKLE
    if (action === "ADD") {
      sheet.appendRow([data.product.id, data.product.name, data.product.category, data.product.price, data.product.image || "", data.product.description || "", "true", "false"]);
      return ContentService.createTextOutput("Success: Added").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 8. TOPLU ÜRÜN GÜNCELLEME (BULK_UPDATE)
    if (action === "BULK_UPDATE") {
      var rows = sheet.getDataRange().getValues();
      var updates = data.updates; // Dizi: [{id: "123", changes: {price: "10"}}, ...]
      
      // Optimizasyon için ID'leri eşleştirip toplu yazma yerine satır satır hızlı güncelleme
      var idMap = {};
      for (var u = 0; u < updates.length; u++) {
        idMap[String(updates[u].id)] = updates[u].changes;
      }
      
      for (var i = 1; i < rows.length; i++) {
        var rowId = String(rows[i][0]);
        if (idMap[rowId]) {
          var changes = idMap[rowId];
          if (changes.name !== undefined) sheet.getRange(i + 1, 2).setValue(changes.name);
          if (changes.category !== undefined) sheet.getRange(i + 1, 3).setValue(changes.category);
          if (changes.price !== undefined) sheet.getRange(i + 1, 4).setValue(changes.price);
          if (changes.image !== undefined) sheet.getRange(i + 1, 5).setValue(changes.image);
          if (changes.description !== undefined) sheet.getRange(i + 1, 6).setValue(changes.description);
          if (changes.inStock !== undefined) sheet.getRange(i + 1, 7).setValue(String(changes.inStock));
          if (changes.is_archived !== undefined) sheet.getRange(i + 1, 8).setValue(String(changes.is_archived));
        }
      }
      return ContentService.createTextOutput("Success: Bulk Updated").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 9. TOPLU ÜRÜN SİLME (BULK_DELETE)
    if (action === "BULK_DELETE") {
      var rows = sheet.getDataRange().getValues();
      var idSet = {};
      for (var j = 0; j < data.ids.length; j++) {
        idSet[String(data.ids[j])] = true;
      }
      
      for (var i = rows.length - 1; i >= 1; i--) {
        if (idSet[String(rows[i][0])]) {
          sheet.deleteRow(i + 1);
        }
      }
      return ContentService.createTextOutput("Success: Bulk Deleted").setMimeType(ContentService.MimeType.TEXT);
    }

    // 10. ÜRÜN SIRALAMASINI KAYDET (BÜTÜN SAYFAYI YENİDEN YAZAR)
    if (action === "UPDATE_PRODUCT_ORDER") {
      var idList = data.idList; // ["id1", "id2", ...]
      var rows = sheet.getDataRange().getValues();
      var header = rows[0];
      var productsMap = {};
      
      // Mevcut ürünleri ID'ye göre bir objeye al
      for (var i = 1; i < rows.length; i++) {
        productsMap[String(rows[i][0])] = rows[i];
      }
      
      // Yeni sıralamaya göre satırları hazırla
      var newRows = [header];
      for (var j = 0; j < idList.length; j++) {
        var id = String(idList[j]);
        if (productsMap[id]) {
          newRows.push(productsMap[id]);
        }
      }
      
      // Sayfayı temizle ve yeni sıralı veriyi yaz
      sheet.clear();
      sheet.getRange(1, 1, newRows.length, header.length).setValues(newRows);
      return ContentService.createTextOutput("Success: Product Order Updated").setMimeType(ContentService.MimeType.TEXT);
    }
    
    // 11. KATEGORİ SIRALAMASINI KAYDET (SETTINGS TABLOSUNA YAZAR)
    if (action === "UPDATE_CATEGORY_ORDER") {
      var orderList = data.orderList; // [{name: "cat1", order: 1}, ...]
      var key = "CATEGORY_ORDER";
      var value = JSON.stringify(orderList);
      
      var rows = settingsSheet.getDataRange().getValues();
      var found = false;
      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] === key) {
          settingsSheet.getRange(i + 1, 2).setValue(value);
          found = true;
          break;
        }
      }
      if (!found) {
        settingsSheet.appendRow([key, value]);
      }
      return ContentService.createTextOutput("Success: Category Order Updated").setMimeType(ContentService.MimeType.TEXT);
    }

    return ContentService.createTextOutput("Unknown Action").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.toString()).setMimeType(ContentService.MimeType.TEXT);
  }
}

 