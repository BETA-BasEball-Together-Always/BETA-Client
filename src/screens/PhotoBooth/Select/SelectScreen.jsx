import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TeamCard from './components/TeamCard';
import FrameCard from './components/FrameCard';
import photoBoothStore from '../../../stores/photoBoothStore';
import { FRAMES } from '../../../utils/framesMap';
import { usePrefetchEditFonts } from '../../../hooks/usePrefetchEditFonts';

import KiwoomIcon from '../../../shared/assets/svg/teams/Kiwoom.svg';
import DoosanIcon from '../../../shared/assets/svg/teams/Doosan.svg';
import LotteIcon  from '../../../shared/assets/svg/teams/Lotte.svg';
import SamsungIcon from '../../../shared/assets/svg/teams/Samsung.svg';
import HanhwaIcon  from '../../../shared/assets/svg/teams/Hanhwa.svg';
import KIAIcon     from '../../../shared/assets/svg/teams/KIA.svg';
import LGIcon      from '../../../shared/assets/svg/teams/LG.svg';
import SSGIcon     from '../../../shared/assets/svg/teams/SSG.svg';
import NCIcon      from '../../../shared/assets/svg/teams/NC.svg';
import KTIcon      from '../../../shared/assets/svg/teams/KT.svg';

const CARD_BG = '#1A1A1A';

const {width,height} = Dimensions.get('window');

const teams = [
  { id: '1',  teamKey: 'kiwoom', name: '키움 히어로즈', Icon: KiwoomIcon },
  { id: '2',  teamKey: 'doosan', name: '두산 베어스',  Icon: DoosanIcon },
  { id: '3',  teamKey: 'lotte',  name: '롯데 자이언츠', Icon: LotteIcon  },
  { id: '4',  teamKey: 'samsung',name: '삼성 라이온즈', Icon: SamsungIcon},
  { id: '5',  teamKey: 'hanhwa', name: '한화 이글스',  Icon: HanhwaIcon },
  { id: '6',  teamKey: 'kia',    name: 'KIA 타이거즈', Icon: KIAIcon    },
  { id: '7',  teamKey: 'lg',     name: 'LG 트윈스',    Icon: LGIcon     },
  { id: '8',  teamKey: 'ssg',    name: 'SSG 랜더스',   Icon: SSGIcon    },
  { id: '9',  teamKey: 'nc',     name: 'NC 다이노스',  Icon: NCIcon     },
  { id: '10', teamKey: 'kt',     name: 'KT 위즈',      Icon: KTIcon     },
];

/** 2) 프레임 종류 정의(아이디만 사용; 이미지는 아래 FRAMES에서 고름) */
const frames = [
  { id: '2x2', name: '2x2' },
  { id: '1x4', name: '1x4' },
];

/** 3) 팀별 프레임 이미지 매핑 (모두 미리 require) */
// const FRAME_IMAGES = {
//   base: { // 팀 미선택 시 사용할 기본 프레임
//     '2x2': require('../../../shared/assets/images/frames/base/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/base/1x4.png'),
//   },
//   kiwoom: {
//     '2x2': require('../../../shared/assets/images/frames/kiwoom/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/kiwoom/1x4.png'),
//   },
//   doosan: {
//     '2x2': require('../../../shared/assets/images/frames/doosan/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/doosan/1x4.png'),
//   },
//   lotte: {
//     '2x2': require('../../../shared/assets/images/frames/lotte/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/lotte/1x4.png'),
//   },
//   samsung: {
//     '2x2': require('../../../shared/assets/images/frames/samsung/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/samsung/1x4.png'),
//   },
//   hanhwa: {
//     '2x2': require('../../../shared/assets/images/frames/hanhwa/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/hanhwa/1x4.png'),
//   },
//   kia: {
//     '2x2': require('../../../shared/assets/images/frames/kia/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/kia/1x4.png'),
//   },
//   lg: {
//     '2x2': require('../../../shared/assets/images/frames/lg/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/lg/1x4.png'),
//   },
//   ssg: {
//     '2x2': require('../../../shared/assets/images/frames/ssg/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/ssg/1x4.png'),
//   },
//   nc: {
//     '2x2': require('../../../shared/assets/images/frames/nc/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/nc/1x4.png'),
//   },
//   kt: {
//     '2x2': require('../../../shared/assets/images/frames/kt/2x2.png'),
//     '1x4': require('../../../shared/assets/images/frames/kt/1x4.png'),
//   },
// };

/** 4) 선택팀에 맞는 프레임 이미지 선택 헬퍼 */
const getFrameSource = (teamKeyOrNull, frameId) => {
  const theme = teamKeyOrNull ? FRAMES[teamKeyOrNull] : FRAMES.base;
  return theme?.[frameId] ?? FRAMES.base[frameId];
};

const SelectScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);

  const { setSelectedTeam: setGlobalTeam, setSelectedFrame: setGlobalFrame } = photoBoothStore();  

  const { prefetch } = usePrefetchEditFonts();

  useEffect(() => {
    prefetch(); // 유휴 시간에 미리 로드
  }, []);

  const handleNext = () => {
    if (selectedTeam && selectedFrame) {
      setGlobalTeam(selectedTeam);
      setGlobalFrame(selectedFrame);        
      navigation.navigate('Camera');
    }
  };

  const renderTeam = ({ item }) => (
    <TeamCard
      item={item}
      isSelected={selectedTeam?.id === item.id}
      onPress={setSelectedTeam}
    />
  );

  const renderFrame = ({ item, key }) => {
    const source = getFrameSource(selectedTeam?.teamKey ?? null, item.id);
    return (
      <FrameCard
        key={key}
        item={item}
        source={source}
        isSelected={selectedFrame?.id === item.id}
        onPress={setSelectedFrame}
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <Text style={styles.title}>야구네컷</Text>

      <Text style={styles.sectionTitle}>팀 선택</Text>
      <FlatList
        data={teams}
        horizontal
        keyExtractor={(it) => it.id}
        renderItem={renderTeam}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 12 }}
      />

      <Text style={[styles.sectionTitle, { marginTop: 0 }]}>프레임 선택</Text>
      <View style={styles.framesRow}>
        {frames.map((f, key) => renderFrame({ item: f, key }))}
      </View>

      <TouchableOpacity
        onPress={handleNext}
        disabled={!(selectedTeam && selectedFrame)}
        style={[styles.nextButton, !(selectedTeam && selectedFrame) && styles.nextButtonDisabled]}
      >
        <Text style={styles.nextText}>다음</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D0D', paddingHorizontal: 20, paddingTop: 35 },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, color: '#fff', fontWeight: '600', marginBottom: 15 },
  framesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom:10},
  nextButton: { marginBottom: 10, backgroundColor: '#EDEDED', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  nextButtonDisabled: { backgroundColor: '#3A3A3A' },
  nextText: { color: '#000', fontWeight: '700' },
});