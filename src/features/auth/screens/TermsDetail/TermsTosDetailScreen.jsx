import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AuthBackground from "../../components/AuthBackground";
import { useStepBack } from "../../hooks/useStepBack";

import BackIcon from "../../../../shared/assets/svg/chevrons/back.svg";
import { AppText } from "../../../../shared/theme/components/AppText";

const TermsTosDetailScreen = () => {
  const handleBack = useStepBack("TermsDetail");

  const terms2 = [
    `“회사”란 모바일 애플리케이션 등을 통해 서비스를 제공하는 서비스 제공자를 말합니다.`,
    `“서비스”란 iOS/Android 애플리케이션을 통해 제공되는 야구 팬 커뮤니티로서, 홈/덕아웃 게시판/감정 리액션(감정카드)/마이스타디움(프로필/활동내역/설정)/사진 촬영 콘텐츠(“야구네컷”) 등 일체의 기능을 의미합니다.`,
    `“이용자”란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말하며, 회원과 비회원을 포함합니다. 단, 본 서비스는 비회원 열람이 제한될 수 있습니다.`,
    `“회원”이란 SNS 간편가입을 통해 회사와 이용계약을 체결하고 서비스를 지속적으로 이용할 수 있는 자를 말합니다.`,
    `“게시물(UGC)”이란 회원이 서비스 내에 게시/업로드한 문자/문서/이미지/사진(야구네컷 포함)/링크/댓글 등 모든 콘텐츠를 말합니다.`,
    `“야구네컷”이란 회원이 촬영/저장/공유할 수 있는 사진 촬영 콘텐츠를 말합니다.`,
  ];

  const clauses = [
    {
      heading: "제3조 [약관 외 준칙]",
      items: [
        {
          prefix: "1.",
          text: "회사는 필요한 경우 서비스 별 개별 약관·운영정책을 둘 수 있으며, 본 약관과 상충할 때에는 개별 약관, 운영정책이 우선합니다.",
        },
        {
          prefix: "2.",
          text: "본 약관에 정하지 아니한 사항은 전자상거래 등에서의 소비자보호에 관한 법률, 정보통신망법, 개인정보보호법, 약관규제법 등 관계 법령 및 상관례에 따릅니다.",
        },
        {
          prefix: "3.",
          text: "본 서비스는 만 14세 이상만 이용할 수 있습니다.",
        },
      ],
    },
    {
      heading: "제4조 [약관의 명시·효력·개정]",
      items: [
        {
          prefix: "1.",
          text: "회사는 본 약관을 이용자가 쉽게 알 수 있도록 앱 내 설정 또는 도움말 화면 등에 게시합니다.",
        },
        {
          prefix: "2.",
          text: "본 약관은 회원 가입 시 동의함으로써 효력이 발생합니다.",
        },
        {
          prefix: "3.",
          text: "회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 적용일 7일 전(이용자에게 불리한 경우 30일 전)부터 앱 공지 등 합리적 방법으로 고지합니다.",
        },
        {
          prefix: "4.",
          text: "이용자가 효력 발생일까지 거부 의사를 표시하지 않으면 개정 약관에 동의한 것으로 봅니다. 거부 시 서비스 이용이 제한되거나 종료될 수 있습니다.",
        },
      ],
    },
    {
      heading: "제5조 [서비스의 제공 및 변경]",
      items: [
        {
          prefix: "1.",
          text: "회사는 홈/덕아웃 게시판, 감정 리액션, 마이스타디움, 야구네컷 촬영, 게시, 공유 등 제반 서비스를 제공합니다.",
        },
        {
          prefix: "2.",
          text: "서비스의 품질 개선, 보안 강화, 운영상, 기술상 사유로 서비스의 내용·형태·기능은 변경되거나 일부가 중단될 수 있습니다. 이용자에게 현저히 불리한 변경은 사전 고지합니다.",
        },
        {
          prefix: "3.",
          text: "회사의 고의·과실이 없는 사유로 발생한 변경에 대해서는 손해배상 책임을 부담하지 않습니다.",
        },
      ],
    },
    {
      heading: "제6조 [광고성 정보의 수신]",
      items: [
        {
          prefix: "1.",
          text: "회사는 이벤트, 기능 업데이트 등의 정보를 전자우편, 앱 알림 등으로 제공할 수 있으며, 이용자는 언제든지 수신을 거부하거나 철회할 수 있습니다.",
        },
        {
          prefix: "2.",
          text: "수신 거부 시 일부 맞춤형 안내가 제한될 수 있으나, 서비스 이용 자체는 제한되지 않습니다.",
        },
      ],
    },
    {
      heading: "제7조 [서비스의 중단]",
      items: [
        {
          prefix: "1.",
          text: "시스템 점검, 장애, 통신 두절 등 불가피한 사유 발생 시 서비스 제공이 일시 중단될 수 있습니다. 회사는 사전 또는 사후 지체 없이 고지합니다.",
        },
        {
          prefix: "2.",
          text: "정기점검 시간은 앱 내 공지에 따릅니다.",
        },
        {
          prefix: "3.",
          text: "사업 정책 변경으로 서비스 제공이 곤란해지는 경우 회사는 합리적 범위 내에서 이용자 보호조치를 마련하고 고지합니다.",
        },
      ],
    },
    {
      heading: "제8조 [회원가입]",
      items: [
        {
          prefix: "1.",
          text: "회원가입은 이용자가 약관 및 개인정보처리방침에 동의하고 OAuth 간편인증 등 회사가 정한 절차를 거쳐 신청한 후, 회사가 이를 승낙함으로써 성립합니다.",
        },
        {
          prefix: "2.",
          text: "회사는 다음 각 호에 해당하는 신청을 승낙하지 않을 수 있습니다.",
          indentItems: [
            {
              prefix: "(1)",
              text: "허위 정보 기재, 타인 명의 도용 등 부정한 목적의 신청",
            },
            {
              prefix: "(2)",
              text: "기술상 현저한 지장이 있다고 판단되는 경우",
            },
            {
              prefix: "(3)",
              text: "과거 이용 제한 이력이 있고 재가입 승낙 요건을 충족하지 못한 경우",
            },
          ],
        },
        {
          prefix: "3.",
          text: "회원가입의 성립 시기는 회사의 승낙 통지가 회원에게 도달한 때로 합니다.",
        },
      ],
    },
    {
      heading: "제9조 [회원 탈퇴 및 자격 상실]",
      items: [
        {
          prefix: "1.",
          text: "회원은 언제든지 앱 내 절차를 통해 탈퇴할 수 있습니다.",
        },
        {
          prefix: "2.",
          text: "회사는 회원이 다음 각 호에 해당하는 경우 사전 통지 후 이용 제한·정지·계정 해지 등의 조치를 할 수 있습니다.",
          indentItems: [
            {
              prefix: "(1)",
              text: "불법·유해 게시물(명예훼손, 저작권, 초상권 침해, 혐오 및 차별, 음란, 스팸, 도배 등) 게시·유포",
            },
            {
              prefix: "(2)",
              text: "서비스 운영 또는 다른 회원의 이용을 현저히 방해하는 행위",
            },
            {
              prefix: "(3)",
              text: "법령·약관·운영정책 위반 행위가 반복되거나 중대한 경우",
            },
          ],
        },
        {
          prefix: "3.",
          text: "회사는 계정 해지 시 상당한 기간을 정하여 소명 기회를 부여할 수 있습니다.",
        },
      ],
    },
    {
      heading: "제10조 [계정 및 접근관리]",
      items: [
        {
          prefix: "1.",
          text: "본 서비스는 OAuth 기반 간편인증을 사용하며, 회원은 본인의 단말기·플랫폼 계정 보안 유지를 책임집니다.",
        },
        {
          prefix: "2.",
          text: "회원은 제3자의 무단 사용을 인지한 경우 즉시 회사에 통지하고 안내에 따라야 합니다.",
        },
      ],
    },
    {
      heading: "제11조 [이용자에 대한 통지]",
      items: [
        {
          prefix: "1.",
          text: "회사는 앱 내 공지, 전자우편 등 합리적 수단으로 회원에게 통지할 수 있습니다.",
        },
        {
          prefix: "2.",
          text: "불특정다수 회원에 대한 통지는 7일 이상 공지사항 게시로 갈음할 수 있습니다. 개인 권리·의무에 중대한 영향이 있는 경우 개별 통지합니다.",
        },
      ],
    },
    {
      heading: "제12조 [유료서비스 및 결제]",
      items: [
        {
          prefix: "1.",
          text: "현재 서비스는 기본적으로 무료로 제공되며, 회사는 향후 유료 콘텐츠·부가서비스(예: 야구네컷 테마 촬영·인화 등)를 도입할 수 있습니다.",
        },
        {
          prefix: "2.",
          text: "유료 서비스 도입 시 결제수단, 청약철회·환불, 자동결제, 해지 절차 등은 관련 법령 및 앱마켓 정책에 따라 별도 고지·적용합니다.",
        },
      ],
    },
    {
      heading: "제13조 [회사의 의무]",
      items: [
        {
          prefix: "1.",
          text: "회사는 관련 법령과 본 약관에 따라 안정적인 서비스 제공을 위해 최선의 노력을 다합니다.",
        },
        {
          prefix: "2.",
          text: "회사는 개인정보보호법 등 관계 법령이 정한 기술적·관리적 보호조치를 이행하고, 개인정보처리방침을 공개·준수합니다.",
        },
        {
          prefix: "3.",
          text: "서비스 개선 및 보수 중 장애가 발생한 경우 지체 없이 복구에 노력합니다.",
        },
      ],
    },
    {
      heading: "제14조 [회원의 의무]",
      items: [
        {
          prefix: "1.",
          text: "회원은 다음 각 호의 행위를 하여서는 아니 됩니다.",
          indentItems: [
            { prefix: "(1)", text: "허위 정보 등록, 타인 명의·정보 도용" },
            {
              prefix: "(2)",
              text: "타인의 권리(저작권·초상권·개인정보 등) 침해",
            },
            {
              prefix: "(3)",
              text: "불법·유해 정보의 게시·유포(음란, 차별, 혐오, 폭력, 자해, 타해 조장 등)",
            },
            {
              prefix: "(4)",
              text: "스팸·상업성 광고성 게시물의 반복 게시, 서비스 운영 방해",
            },
            {
              prefix: "(5)",
              text: "기타 법령·약관·운영정책을 위반하는 행위",
            },
          ],
        },
        {
          prefix: "2.",
          text: "회원의 위반 행위에 대하여 회사는 게시물 삭제, 이용 제한·정지, 계정 해지, 수사기관 신고 등 필요한 조치를 취할 수 있습니다.",
        },
      ],
    },
    {
      heading: "제15조 [게시물의 관리 및 이용 제한(커뮤니티·감정카드)]",
      items: [
        {
          prefix: "1.",
          text: "게시물의 책임은 이를 게시한 회원에게 있습니다. 회원은 타인의 권리를 침해하지 않도록 주의하여야 합니다.",
        },
        {
          prefix: "2.",
          text: "회사는 게시물이 법령·약관·운영정책에 위반되거나 권리 침해 우려가 있는 경우 사전 통지 없이 비공개·삭제하거나 게시를 거부할 수 있습니다.",
        },
        {
          prefix: "3.",
          text: "감정 리액션(감정카드)은 ‘좋애/슬픔/유잼/퐈이야’ 등으로 구성되며, 동일 게시물에 대하여 1회 선택·변경 가능하고, 부정 클릭 방지를 위한 제한이 적용될 수 있습니다.",
        },
        {
          prefix: "4.",
          text: "홈/덕아웃 피드의 댓글 노출·작성 범위는 서비스 정책에 따라 달라질 수 있습니다(예: 상세 화면에서만 작성 허용 등).",
        },
      ],
    },
    {
      heading: "제16조 [야구네컷(사진 촬영 서비스) 관련 권리]",
      items: [
        {
          prefix: "1.",
          text: "회원이 야구네컷 기능을 통해 촬영·저장한 사진의 저작권·초상권은 원칙적으로 해당 회원에게 귀속됩니다.",
        },
        {
          prefix: "2.",
          text: "회원이 서비스 내 게시 및 공유를 선택한 경우, 회사는 서비스 운영, 보안, 비상업적 홍보 목적으로 필요한 범위에서 비독점적 및 무상으로 이를 이용(저장, 노출, 리사이즈 등)할 수 있습니다. 회원은 합리적 방법으로 동의를 철회할 수 있으며, 철회 시 회사는 지체 없이 신규 노출을 중단합니다(법령상 보존·분쟁 대응 목적 보관은 예외).",
        },
        {
          prefix: "3.",
          text: "회사는 안전한 이용 환경을 위해 위법 및 유해 촬영물 유통 방지 정책을 운영할 수 있으며, 타인의 권리를 침해하는 촬영물 게시 시 게시 중단, 계정 조치 등 필요한 조치를 취할 수 있습니다.",
        },
        {
          prefix: "4.",
          text: "야구네컷 원본은 회원의 기기 및 설정에 따라 저장되며, 서버 보관이 필요한 경우 보관기간(예: 90일) 경과 시 파기될 수 있습니다. 구체적 보관기간·방식은 운영정책 또는 별도 고지에 따릅니다.",
        },
      ],
    },
    {
      heading: "제17조 [저작권 및 라이선스]",
      items: [
        {
          prefix: "1.",
          text: "회사가 제작한 콘텐츠, 소프트웨어, 상표 등 일체의 권리는 회사 또는 정당한 권리자에게 귀속됩니다.",
        },
        {
          prefix: "2.",
          text: "회원은 서비스 이용 과정에서 취득한 정보를 회사 또는 권리자의 사전 동의 없이 영리 목적으로 사용·복제·배포할 수 없습니다.",
        },
        {
          prefix: "3.",
          text: "회원은 자신의 게시물에 대해 회사에 서비스 제공, 운영, 보안, 저장, 보관, 전송, 전시를 위한 범위 내 비독점적·무상 사용권을 부여합니다. 회원 탈퇴 또는 게시물 삭제 시에도 관련 법령상 보존의무, 분쟁 대응, 백업·로그 목적 범위 내에서 합리적 기간 보관할 수 있습니다.",
        },
      ],
    },
    {
      heading: "제18조 [개인정보보호]",
      items: [
        {
          prefix: "1.",
          text: "개인정보의 수집, 이용, 제공, 보관, 파기 등 처리에 관한 사항은 개인정보처리방침에 따릅니다. 회사는 관련 법령이 정하는 바에 따라 이용자의 권리를 보장합니다.",
        },
      ],
    },
    {
      heading: "제19조 [책임 제한 및 면책]",
      items: [
        {
          prefix: "1.",
          text: "회사는 천재지변, 통신사업자 장애, 법령·정책 변화, 회사의 합리적 통제범위를 벗어난 사유로 서비스를 제공하지 못한 경우 책임을 지지 않습니다.",
        },
        {
          prefix: "2.",
          text: "회사는 회원의 귀책사유로 인한 장애에 대하여 책임을 지지 않습니다.",
        },
        {
          prefix: "3.",
          text: "회사는 회원이 게시한 정보의 신뢰도·정확성 등에 대하여 보증하지 않으며, 회원 상호 간 또는 회원과 제3자 간 분쟁에 개입하지 않습니다.",
        },
        {
          prefix: "4.",
          text: "무료로 제공되는 서비스에 대하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.",
        },
      ],
    },
    {
      heading: "제20조 [분쟁 해결]",
      items: [
        {
          prefix: "1.",
          text: "회사는 이용자의 정당한 의견, 불만을 신속, 성실히 처리하기 위해 고객지원 창구를 운영합니다.",
        },
        {
          prefix: "2.",
          text: "분쟁이 발생한 경우 당사자는 원만한 해결을 위해 협의하며, 조정이 필요할 때에는 관련 기관의 분쟁조정 절차를 이용할 수 있습니다.",
        },
      ],
    },
    {
      heading: "제21조 [재판관할 및 준거법]",
      items: [
        {
          prefix: "1.",
          text: "본 약관과 서비스 이용에 관한 분쟁은 대한민국 법을 준거법으로 하며, 민사소송법상의 관할법원에 제소합니다.",
        },
      ],
    },
    {
      heading: "부칙",
      items: [
        {
          prefix: "1.",
          text: "본 약관은 2025년 10월 29일부터 적용합니다.",
        },
        {
          prefix: "2.",
          text: "회사의 정책 변경, 법령 개정 등 사유로 본 약관이 개정될 수 있으며, 개정 시 제4조에 따라 고지합니다.",
        },
      ],
    },
    {
      heading: "회사 정보",
      items: [
        { prefix: null, text: "상호: Beta" },
        { prefix: null, text: "이메일 주소: betaofficial365@gmail.com" },
      ],
    },
  ];

  const renderItemRow = (item, { indent = 0 } = {}) => {
    const prefix = item?.prefix;
    const text = item?.text ?? "";

    return (
      <View
        key={`${prefix ?? "no-prefix"}-${text.slice(0, 20)}`}
        style={{ flexDirection: "row", marginBottom: 4, marginLeft: indent }}
      >
        {prefix ? (
          <AppText variant="caption" style={{ color: "#C7C7C7", width: 26 }}>
            {prefix}
          </AppText>
        ) : null}
        <AppText variant="caption" style={{ color: "#C7C7C7", flex: 1 }}>
          {text}
        </AppText>
      </View>
    );
  };

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
            <BackIcon width={24} height={24} />
          </TouchableOpacity>

          <AppText variant="displayTitle" style={styles.headerTitle}>
            서비스 이용약관
          </AppText>

          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <AppText variant="semi18" className="text-[#FFF]">
            제1조 [목적]
          </AppText>
          <AppText
            variant="caption"
            className="text-[#C7C7C7]"
            style={{ marginTop: 8 }}
          >
            이 약관은 BETA (이하 “회사”)이 제공하는 BETA 서비스(이하 “서비스”)의
            이용과 관련하여 회사와 이용자 간 권리·의무 및 책임사항, 서비스
            이용조건 및 절차 등 기본적인 사항을 규정함을 목적으로 합니다.{"\n"}
            서비스를 이용하고자 하는 자는 본 이용약관을 상세히 읽은 후 동의하지
            않을 경우 동의 표시를 하거나 서비스에 등록·접속·이용(이하
            “이용”)하지 않아야 합니다.
          </AppText>

          <AppText
            variant="semi18"
            className="text-[#FFF]"
            style={{ marginTop: 41 }}
          >
            제2조 [용어의 정의]
          </AppText>
          <View style={{ marginTop: 8 }}>
            {terms2.map((text, index) => (
              <View
                key={index}
                style={{ flexDirection: "row", marginBottom: 4 }}
              >
                <AppText variant="caption" style={{ color: "#C7C7C7" }}>
                  {index + 1}.
                </AppText>
                <AppText
                  variant="caption"
                  style={{ color: "#C7C7C7", flex: 1 }}
                >
                  {text}
                </AppText>
              </View>
            ))}
          </View>

          {/* 제3조 ~ 제21조 + 부칙 렌더 */}
          <View style={{ marginTop: 41 }}>
            {clauses.map((clause, clauseIndex) => (
              <View key={clause.heading ?? clauseIndex}>
                <AppText
                  variant="semi18"
                  className="text-[#FFF]"
                  style={{ marginTop: clauseIndex === 0 ? 0 : 41 }}
                >
                  {clause.heading}
                </AppText>

                <View style={{ marginTop: 8 }}>
                  {clause.items.map((item, itemIndex) => (
                    <View key={`${clauseIndex}-${itemIndex}`}>
                      {renderItemRow(item, { indent: 0 })}
                      {!!item?.indentItems?.length &&
                        item.indentItems.map((subItem, subIndex) =>
                          renderItemRow(subItem, {
                            indent: 16,
                          }),
                        )}
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default TermsTosDetailScreen;

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
