/**
 * 마이파크 스크린파크골프 비즈니스 딜러 모집 - 이메일 실시간 알림 스크립트 (스프레드시트 유무 무관)
 * 수신 이메일: maxmook@naver.com
 * 대상 사이트: https://recruit-pi-one.vercel.app/
 * 
 * [특징]
 * 1. 스프레드시트가 전혀 없어도 script.new 에서 독립형으로 실행 시 즉시 이메일 전송
 * 2. 추후 스프레드시트에 연결할 경우 시트 자동 기록까지 원스톱 지원
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 10초 락

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

    // 1. 스프레드시트가 연결되어 있는 경우에만 시트에 행 기록 (시트가 없어도 에러 없이 통과)
    try {
      var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      if (spreadsheet) {
        var sheet = spreadsheet.getActiveSheet();
        if (sheet.getLastRow() === 0) {
          sheet.appendRow(["접수일시", "신청자 성함", "휴대폰 연락처", "신청 구분", "유입 경로", "처리 상태"]);
          sheet.getRange(1, 1, 1, 6)
               .setBackground("#064E3B")
               .setFontColor("#FFFFFF")
               .setFontWeight("bold")
               .setHorizontalAlignment("center");
        }
        sheet.appendRow([timestamp, name, phone, type, source, "신규 접수"]);
      }
    } catch (sheetErr) {
      // 시트 미생성 상태에서도 이메일 전송은 정상 진행
    }

    // 2. maxmook@naver.com 으로 즉시 이메일 알림 발송
    var recipient = "maxmook@naver.com";
    var subject = "[마이파크] 비즈니스 딜러 파트너 신규 신청 알림 - " + name + "님 (" + phone + ")";
    var body = 
      "마이파크 스크린파크골프 비즈니스 딜러 신규 신청이 정상 접수되었습니다.\n\n" +
      "--------------------------------------------------\n" +
      "■ 접수 일시 : " + timestamp + "\n" +
      "■ 신청자 성함 : " + name + "\n" +
      "■ 휴대폰 연락처 : " + phone + "\n" +
      "■ 신청 구분 : " + type + "\n" +
      "■ 유입 출처 : " + source + "\n" +
      "--------------------------------------------------\n\n" +
      "신청자에게 유선 연락하여 상세 딜러 정책 자료 안내 및 맞춤 상담을 진행해 주시기 바랍니다.";

    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: body
    });

    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "정상 접수되었습니다."
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

function doGet(e) {
  return ContentService.createTextOutput("MYPARK Dealer Recruitment Email WebApp is active.").setMimeType(ContentService.MimeType.TEXT);
}
