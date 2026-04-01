import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import { useStepBack } from "../../hooks/useStepBack";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const TermsPrivacyRequiredDetailScreen = () => {
  const handleBack = useStepBack("TermsDetail");

  const clauses = [
    {
      heading: "제1조 [수집하는 개인정보의 항목 및 수집 방법]",
      content: `회사는 서비스 제공을 위해 다음과 같이 개인정보를 수집합니다.

1항. 회원가입 및 로그인 시 수집 정보

회사는 소셜 간편인증(카카오, 네이버 OAuth)을 통해 아래 정보를 수집합니다.

수집 항목
- 소셜 로그인 고유 식별자(OAuth ID)
- 닉네임
- 응원팀 정보
- 프로필 이미지(선택사항)

수집 목적
회원 식별 및 서비스 이용 인증, 커뮤니티 내 사용자 구분, 응원팀 기반 커뮤니티 제공

보유 및 이용 기간
회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관)

2항. 서비스 이용 과정에서 자동 생성/수집되는 정보

서비스를 이용하는 과정에서 아래 정보가 자동으로 생성되어 수집됩니다.

수집 항목
- 기기 정보(운영체제, 앱 버전, 기기 모델명)
- 접속 로그, IP 주소
- 서비스 이용 기록(Access Token, Refresh Token)

수집 목적
서비스 안정성 및 품질 개선, 보안 및 부정 이용 방지, 비정상 접근 탐지

보유 및 이용 기간
수집일로부터 최대 1년 (보안 로그는 통신비밀보호법에 따라 3개월)

3항. 커뮤니티 활동 및 콘텐츠 작성 정보

이용자가 서비스를 이용하면서 작성/등록하는 콘텐츠 정보를 수집합니다.

수집 항목
- 게시글, 댓글 내용
- 이미지 콘텐츠(야구네컷 포함)
- 감정 리액션(좋애/슬픔/유잼/퐈이야) 기록
- 신고 이력 및 제재 기록

수집 목적
커뮤니티 운영 및 서비스 품질 관리, 악성 이용자 제재, 이용자 간 분쟁 조정 및 법적 대응

보유 및 이용 기간
콘텐츠 삭제 후 30일간 백업 보관 후 즉시 파기 (단, 법령상 의무 또는 분쟁 대응 목적은 예외)

4항. 야구네컷(사진 촬영 서비스) 관련 정보

사진 촬영 콘텐츠 제공 및 공유 기능을 위해 아래 정보를 수집합니다.

수집 항목
- 이용자가 촬영한 사진 이미지(서버 업로드 선택 시)

수집 목적
사진 콘텐츠 생성/저장/공유 기능 제공, 커뮤니티 내 게시

보유 및 이용 기간
콘텐츠 삭제 시까지 (서버 보관 기준 최대 90일, 운영정책에 따라 변경 가능)

특이사항
원본 사진은 이용자의 단말기에 로컬 저장되며, 서버에는 워터마크가 포함된 미리보기 이미지만 저장됩니다.
이용자가 게시 및 공유를 선택한 경우에 한하여 서버에 업로드됩니다.`,
    },
    {
      heading: "제2조 [수집하지 않는 개인정보]",
      content: `회사는 이용자의 신뢰를 위해 다음 정보를 수집하지 않습니다.

- 주민등록번호, 여권번호, 운전면허번호, 외국인등록번호
- 신용카드 정보, 계좌번호 등 금융/결제 정보
- 사상/신념, 노동조합/정당 가입, 건강, 성생활 등에 관한 민감정보
- 위치정보(GPS 좌표)`,
    },
    {
      heading: "제3조 [개인정보의 제3자 제공]",
      content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
다만, 소셜 로그인 인증을 위해 아래와 같이 최소한의 정보를 제공합니다.

(1) 제공받는 자: 카카오, 네이버
(2) 제공 항목: OAuth 인증 토큰
(3) 제공 목적: 본인 인증 및 소셜 계정 연동
(4) 보유 및 이용 기간: 각 플랫폼의 개인정보 처리방침에 따름

위 경우를 제외하고, 이용자의 사전 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
법령에 특별한 규정이 있거나 수사기관의 적법한 요청이 있는 경우는 예외로 합니다.`,
    },
    {
      heading: "제4조 [개인정보 처리 위탁]",
      content: `회사는 현재 개인정보 처리 업무를 외부 업체에 위탁하고 있지 않습니다.

단, 서비스 제공을 위한 클라우드 인프라 운영사(예: AWS, Google Cloud 등)는 단순 저장 및 처리 목적의 기술적 위탁으로 간주되며,
향후 위탁이 필요한 경우 위탁 업체명, 위탁 업무 내용 등을 앱 내 공지 또는 개인정보 처리방침을 통해 고지하겠습니다.`,
    },
    {
      heading: "제5조 [개인정보의 보유 및 이용 기간, 파기]",
      content: `1항. 보유 및 이용 기간

회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
다만, 관계 법령에 따라 보존할 필요가 있는 경우 아래와 같이 일정 기간 보관 후 파기합니다.

「전자상거래 등에서의 소비자보호에 관한 법률」
- 표시/광고에 관한 기록: 6개월
- 계약 또는 청약철회 등에 관한 기록: 5년
- 대금결제 및 재화 등의 공급에 관한 기록: 5년
- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년

「통신비밀보호법」
- 로그인 기록, 접속 로그, 접속지 추적자료: 3개월

2항. 파기 절차 및 방법

파기 절차
이용자의 개인정보는 목적 달성 후 내부 방침 및 관련 법령에 따라 일정 기간 저장된 후 파기됩니다.
법령에 따라 보존되는 개인정보는 법정 보존기간 경과 후 파기됩니다.

파기 방법
- 전자적 파일 형태: 복구 불가능한 방법으로 영구 삭제
- 종이 문서: 분쇄기로 분쇄하거나 소각

3항. 회원 탈퇴 시 개인정보 처리
- 회원이 탈퇴를 요청하면 계정 정보는 즉시 비활성화되며, 재로그인이 불가능합니다.
- 작성한 게시글 및 댓글은 익명 처리되며, 백업 기간(30일) 경과 후 삭제됩니다.
- 이용자가 직접 삭제를 원하는 게시물은 탈퇴 전 직접 삭제하시기 바랍니다.
- 관련 법령에 따라 보존이 필요한 정보는 해당 기간 동안 별도 보관 후 파기됩니다.`,
    },
    {
      heading: "제6조 [이용자 및 법정대리인의 권리와 행사 방법]",
      content: `이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다.

1항. 이용자의 권리
- 개인정보 열람 요구
- 개인정보 정정/삭제 요구
- 개인정보 처리 정지 요구
- 동의 철회(회원 탈퇴)

2항. 권리 행사 방법
- 앱 내 「마이스타디움 > 설정 > 개인정보 관리」 메뉴 이용
- 고객센터 이메일: [betaofficial365@gmail.com]

회사는 이용자의 요청을 받은 날로부터 10일 이내에 조치 결과를 알려드립니다.
정당한 사유가 있는 경우 처리 기간이 연장될 수 있으며, 이 경우 사유와 연장 기간을 함께 안내합니다.

3항. 만 14세 미만 아동의 개인정보 보호
본 서비스는 만 14세 이상만 이용할 수 있습니다.
회사는 만 14세 미만 아동의 개인정보를 고의로 수집하지 않으며, 만 14세 미만 아동의 가입이 확인된 경우 즉시 해당 계정을 삭제합니다.`,
    },
    {
      heading: "제7조 [개인정보 자동 수집 장치의 설치/운영 및 거부]",
      content: `회사는 이용자의 서비스 이용 기록을 저장하고 불러오는 '토큰(Token)'을 사용합니다.

토큰의 사용 목적
- 로그인 상태 유지
- 보안 인증 및 세션 관리

토큰의 저장 및 관리
토큰은 이용자의 기기에 저장되며, 이용자는 앱 로그아웃을 통해 언제든지 토큰을 삭제할 수 있습니다.`,
    },
    {
      heading: "제8조 [개인정보의 안전성 확보 조치]",
      content: `회사는 이용자의 개인정보를 안전하게 관리하기 위해 다음과 같은 기술적/관리적 조치를 취하고 있습니다.

1항. 기술적 조치
- 개인정보의 암호화
- 해킹 등에 대비한 보안 프로그램 설치 및 주기적 점검
- 접근 제한 장치를 통한 비인가자 접근 통제

2항. 관리적 조치
- 개인정보 취급 담당자의 최소화 및 교육
- 내부 관리계획 수립 및 시행
- 개인정보 처리시스템 접근 기록 보관 및 위/변조 방지`,
    },
    {
      heading: "제9조 [개인정보 보호책임자]",
      content: `회사는 이용자의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.

개인정보 보호책임자
- 이름:
- 소속:
- 이메일:

이용자는 서비스를 이용하면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의할 수 있습니다.
회사는 이용자의 문의에 대해 신속하고 성실하게 답변해드리겠습니다.`,
    },
    {
      heading: "제10조 [개인정보 처리방침의 변경]",
      content: `본 개인정보 처리방침은 법령, 정책 또는 보안기술의 변경에 따라 내용이 추가/삭제/수정될 수 있습니다.

개인정보 처리방침이 변경되는 경우 시행일로부터 최소 7일 전(이용자에게 불리하거나 중대한 변경인 경우 30일 전)에 앱 내 공지사항 및 푸시 알림을 통해 고지합니다.`,
    },
    {
      heading: "제11조 [권익침해 구제 방법]",
      content: `이용자는 개인정보 침해로 인한 구제를 받기 위하여 개인정보 분쟁조정위원회, 한국인터넷진흥원 개인정보 침해신고센터 등에 분쟁해결이나 상담을 신청할 수 있습니다.

- 개인정보 침해신고센터: (국번없이) 118 (http://privacy.kisa.or.kr/)
- 개인정보 분쟁조정위원회: (국번없이) 1833-6972 (http://www.kopico.go.kr/)
- 대검찰청 사이버범죄수사단: (국번없이) 1301 (http://www.spo.go.kr/)
- 경찰청 사이버안전국: (국번없이) 182 (http://cyberbureau.police.go.kr/)`,
    },
    {
      heading: "부칙",
      content: `1. 본 개인정보 수집 및 이용 동의서는 2025년 ○월 ○일부터 시행됩니다.
2. 본 동의서의 내용 추가, 삭제 및 수정이 있을 시에는 개정 최소 7일 전(이용자에게 불리한 경우 30일 전)에 앱 내 공지사항을 통해 고지하겠습니다.`,
    },
    {
      heading: "회사 정보",
      content: `상호: BETA
이메일 주소: betaofficial365@gmail.com`,
    },
  ];

  return (
    <View style={styles.root}>
      <AuthBackground />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.85}
          >
            <BackIcon />
          </TouchableOpacity>

          <AppText variant="displayTitle" style={styles.headerTitle}>
            개인정보 수집/이용 동의
          </AppText>

          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AppText
            variant="caption"
            className="text-[#C7C7C7]"
            style={{ marginTop: 8, marginBottom: 41 }}
          >
            BETA(이하 "회사")는 「개인정보 보호법」 제15조 및 제22조,
            「정보통신망 이용촉진 및 정보보호 등에 관한 법률」에 따라 이용자의
            개인정보를 수집/이용하고자 할 때에는 이용자의 동의를 받아야 합니다.
            {"\n\n"}
            회원가입 시 수집하는 개인정보의 항목, 수집 및 이용 목적, 보유 및
            이용 기간 등을 안내드리오니 자세히 읽어보신 후 동의 여부를 결정해
            주시기 바랍니다.
          </AppText>

          <View>
            {clauses.map((clause, clauseIndex) => (
              <View key={`${clause.heading}-${clauseIndex}`}>
                <AppText
                  variant="semi18"
                  className="text-[#FFF]"
                  style={{ marginTop: clauseIndex === 0 ? 0 : 41 }}
                >
                  {clause.heading}
                </AppText>

                <AppText
                  variant="caption"
                  className="text-[#C7C7C7]"
                  style={{ marginTop: 8 }}
                >
                  {clause.content}
                </AppText>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TermsPrivacyRequiredDetailScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 32,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 24,
    paddingBottom: 24,
  },
});
