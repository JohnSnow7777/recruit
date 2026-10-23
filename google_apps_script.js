/**
 * 마이파크 스크린파크골프 비즈니스 딜러 모집 구글 스프레드시트 연동 & 이메일 알림 스크립트
 * 수신 이메일: maxmook@naver.com
 * 대상 사이트: https://recruit-pi-one.vercel.app/
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // 10초 락 획득

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 시트가 비어있을 경우 헤더 자동 생성
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["접수일시", "신청자 성함", "휴대폰 연락처", "신청 구분", "유입 경로", "처리 상태"]);
      sheet.getRange(1, 1, 1, 6)
           .setBackground("#064E3B")
           .setFontColor("#FFFFFF")
           .setFontWeight("bold")
           .setHorizontalAlignment("center");
    }

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

    // 1. 구글 스프레드시트에 행 실시간 추가
    sheet.appendRow([timestamp, name, phone, type, source, "신규 접수"]);

    // 2. maxmook@naver.com 으로 실시간 이메일 알림 발송
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
      "구글 스프레드시트에서 실시간 접수 내역을 확인하신 후, 신청자에게 딜러 정책 자료 안내 및 상담을 진행해 주시기 바랍니다.";

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
  return ContentService.createTextOutput("MYPARK Dealer Recruitment WebApp is active.").setMimeType(ContentService.MimeType.TEXT);
}
