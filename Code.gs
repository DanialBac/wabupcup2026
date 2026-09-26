/**
 * ============================================================================
 * WABUP CUP 2026 - TOURNAMENT MANAGEMENT SYSTEM
 * GOOGLE APPS SCRIPT (GAS) BACKEND: Code.gs
 * ============================================================================
 * Arsitektur: 3-File GAS (Code.gs, Database.gs, Index.html)
 * Mengontrol seluruh API Web App, Routing, Autentikasi Admin, dan Upload File.
 */

// Konfigurasi Root Google Drive Folder untuk Menyimpan Dokumen & Bukti Pembayaran
const FOLDER_NAME_UPLOADS = "WABUPCUP_2026_UPLOADS";

/**
 * Endpoint GET: Melayani Web App Tampilan Frontend (Index.html) atau Respon API JSON
 */
function doGet(e) {
  // Jika ada parameter api/action, tangani sebagai REST API
  if (e && e.parameter && e.parameter.action) {
    return handleApiGet(e.parameter);
  }

  // Melayani Frontend HTML Aplikasi
  var template = HtmlService.createTemplateFromFile('Index');
  
  return template.evaluate()
    .setTitle('WabupCup 2026 - Sistem Manajemen & Pendaftaran Turnamen')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Endpoint POST: Menangani Transaksi, Registrasi Tim Baru, Upload File, dan Perubahan Data Admin
 */
function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    }

    var action = data.action;
    var result = {};

    switch (action) {
      case 'SUBMIT_REGISTRATION':
        result = handleNewRegistration(data.payload);
        break;

      case 'UPDATE_REGISTRATION_STATUS':
        result = updateRegistrationInDb(data.payload);
        break;

      case 'DELETE_REGISTRATION':
        result = deleteRegistrationInDb(data.payload.id);
        break;

      case 'SAVE_MATCH':
        result = saveOrUpdateMatchInDb(data.payload);
        break;

      case 'DELETE_MATCH':
        result = deleteMatchInDb(data.payload.id);
        break;

      case 'SAVE_CATEGORY':
        result = saveCategoryInDb(data.payload);
        break;

      case 'DELETE_CATEGORY':
        result = deleteCategoryInDb(data.payload.id);
        break;

      case 'SAVE_SPONSOR':
        result = saveSponsorInDb(data.payload);
        break;

      case 'DELETE_SPONSOR':
        result = deleteSponsorInDb(data.payload.id);
        break;

      case 'SAVE_CONFIG':
        result = saveConfigInDb(data.payload);
        break;

      case 'UPLOAD_FILE':
        result = handleFileUpload(data.payload);
        break;

      default:
        result = { success: false, message: 'Aksi tidak dikenal: ' + action };
        break;
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Penanganan GET API
 */
function handleApiGet(params) {
  var action = params.action;
  var result = {};

  switch (action) {
    case 'GET_INITIAL_DATA':
      result = {
        success: true,
        data: {
          config: getConfigFromDb(),
          categories: getCategoriesFromDb(),
          matches: getMatchesFromDb(),
          registrations: getRegistrationsFromDb(),
          sponsors: getSponsorsFromDb(),
          bankAccounts: getBankAccountsFromDb(),
          committeeContacts: getCommitteeContactsFromDb(),
          downloadableDocs: getDownloadableDocsFromDb()
        }
      };
      break;

    case 'GET_MATCHES':
      result = { success: true, data: getMatchesFromDb() };
      break;

    case 'GET_CATEGORIES':
      result = { success: true, data: getCategoriesFromDb() };
      break;

    case 'CHECK_REGISTRATION':
      result = { success: true, data: findRegistrationByPhoneOrName(params.query) };
      break;

    default:
      result = { success: false, message: 'Action GET tidak valid' };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle Registrasi Tim Baru + Auto Generate No Registrasi & Link Berkas
 */
function handleNewRegistration(formData) {
  var regCode = "REG-" + Math.floor(100000 + Math.random() * 900000);
  
  var registrationRecord = {
    id: regCode,
    teamName: formData.teamName || '',
    category: formData.category || 'SMA',
    officialName: formData.officialName || '',
    officialPhone: formData.officialPhone || '',
    officialEmail: formData.officialEmail || '',
    coachName: formData.coachName || '',
    coachPhone: formData.coachPhone || '',
    playersCount: formData.playersCount || 12,
    playersList: formData.playersList ? JSON.stringify(formData.playersList) : '[]',
    paymentStatus: 'UNPAID',
    paymentMethod: formData.paymentMethod || 'TRANSFER',
    amount: formData.amount || 0,
    proofUrl: formData.proofUrl || '',
    officialLetterUrl: formData.officialLetterUrl || '',
    teamLogoUrl: formData.teamLogoUrl || '',
    notes: formData.notes || '',
    registrationStatus: 'PENDING_PAYMENT',
    createdAt: new Date().toISOString()
  };

  insertRegistrationToDb(registrationRecord);

  return {
    success: true,
    registrationId: regCode,
    data: registrationRecord,
    message: 'Pendaftaran tim ' + formData.teamName + ' berhasil dicatat dengan kode: ' + regCode
  };
}

/**
 * Handle Upload Berkas (PDF, Gambar Bukti Pembayaran, Foto Logo) ke Google Drive
 */
function handleFileUpload(payload) {
  // payload: { fileName, mimeType, base64Data, subFolder }
  try {
    var rootFolder;
    var folders = DriveApp.getFoldersByName(FOLDER_NAME_UPLOADS);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(FOLDER_NAME_UPLOADS);
      rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    var targetFolder = rootFolder;
    if (payload.subFolder) {
      var subFolders = rootFolder.getFoldersByName(payload.subFolder);
      if (subFolders.hasNext()) {
        targetFolder = subFolders.next();
      } else {
        targetFolder = rootFolder.createFolder(payload.subFolder);
        targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      }
    }

    var decodedData = Utilities.base64Decode(payload.base64Data.split(',')[1] || payload.base64Data);
    var blob = Utilities.newBlob(decodedData, payload.mimeType, payload.fileName);
    var file = targetFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileUrl = "https://lh3.googleusercontent.com/d/" + file.getId();

    return {
      success: true,
      fileId: file.getId(),
      fileUrl: fileUrl,
      downloadUrl: file.getDownloadUrl(),
      viewUrl: file.getUrl()
    };
  } catch (err) {
    return {
      success: false,
      error: 'Gagal mengupload file: ' + err.toString()
    };
  }
}
