/**
 * 마이파크 스크린파크골프 비즈니스 딜러 모집 - 지정 구글 스프레드시트 자동 기록 & 이메일 알림 스크립트
 * 대상 스프레드시트 ID: 1Ii-0lBAbVgV2SHmGoUeQL_CsjDw7PQnqh3PxXM-82rY
 * 수신 이메일: maxmook@naver.com
 */

var SPREADSHEET_ID = "1Ii-0lBAbVgV2SHmGoUeQL_CsjDw7PQnqh3PxXM-82rY";

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        data = e.parameter;
      }
    } else {
      data = e.parameter;
    }

    var name = (data.name || "").trim();
    var phone = (data.phone || "").trim();
    var type = (data.type || "공식 딜러 파트너 신청").trim();
    var source = (data.source || "https://recruit-pi-one.vercel.app/").trim();
    var timestamp = Utilities.formatDate(new Date(), "Asia/Seoul", "yyyy-MM-dd HH:mm:ss");

    if (!name || !phone) {
      return ContentService.createTextOutput(JSON.stringify({
        result: "error",
        message: "이름과 연락처는 필수 입력 항목입니다."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 1순위: maxmook@naver.com 이메일 즉시 발송
    var mailStatus = "sent";
    try {
      MailApp.sendEmail({
        to: "maxmook@naver.com",
        subject: "[마이파크] 딜러 상담 신청 알림 - " + name + "님 (" + phone + ")",
        body:
          "마이파크 스크린파크골프 비즈니스 딜러 상담 신청이 접수되었습니다.\n\n" +
          "--------------------------------------------------\n" +
          "■ 접수 일시 : " + timestamp + "\n" +
          "■ 신청자 성함 : " + name + "\n" +
          "■ 휴대폰 연락처 : " + phone + "\n" +
          "■ 신청 구분 : " + type + "\n" +
          "■ 유입 출처 : " + source + "\n" +
          "--------------------------------------------------\n\n" +
          "구글 스프레드시트 바로가기:\n" +
          "https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID + "/edit"
      });
    } catch (mailErr) {
      mailStatus = mailErr.toString();
    }

    // 2순위: 지정된 구글 스프레드시트(1Ii-0lBAbVgV2SHmGoUeQL_CsjDw7PQnqh3PxXM-82rY)에 실시간 기록
    var sheetStatus = "recorded";
    try {
      var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      var sheet = ss.getSheets()[0];
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["접수일시", "신청자 성함", "휴대폰 연락처", "신청 구분", "유입 경로", "처리 상태"]);
        sheet.getRange(1, 1, 1, 6)
             .setBackground("#064E3B")
             .setFontColor("#FFFFFF")
             .setFontWeight("bold")
             .setHorizontalAlignment("center");
      }
      sheet.appendRow([timestamp, name, phone, type, source, "신규 접수"]);
    } catch (sheetErr) {
      sheetStatus = sheetErr.toString();
    }

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      mail: mailStatus,
      sheet: sheetStatus
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 최초 1회 권한 승인용 함수 (상단에서 이 함수를 선택하고 '실행'을 누르면 시트+이메일 권한이 한 번에 승인됨)
function authorizeAll() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var quota = MailApp.getRemainingDailyQuota();
  Logger.log("연결된 시트 이름: " + ss.getName() + " / 남은 메일 발송 한도: " + quota);
}

function doGet(e) {
  return ContentService.createTextOutput("active").setMimeType(ContentService.MimeType.TEXT);
}
