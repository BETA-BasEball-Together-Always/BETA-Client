import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, StatusBar, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TeamCard from './components/TeamCard';
import FrameCard from './components/FrameCard';
import photoBoothStore from '../../stores/photoBoothStore';

const CARD_BG = '#1A1A1A';

const {width,height} = Dimensions.get('window');

/** 1) 팀 목록에 teamKey 추가(매핑용) */
const teams = [
  { id: '1', teamKey: 'KIWOOM', name: '키움 히어로즈', logo: require('../../assets/images/PhotoBooth/Select/Kiwoom.png') },
  { id: '2', teamKey: 'DOOSAN', name: '두산 베어스',  logo: require('../../assets/images/PhotoBooth/Select/Doosan.png') },
  { id: '3', teamKey: 'LOTTE',  name: '롯데 자이언츠', logo: require('../../assets/images/PhotoBooth/Select/Lotte.png') },
  { id: '4', teamKey: 'SAMSUNG',name: '삼성 라이온즈', logo: require('../../assets/images/PhotoBooth/Select/Samsung.png') },
  { id: '5', teamKey: 'HANHWA', name: '한화 이글스',  logo: require('../../assets/images/PhotoBooth/Select/Hanhwa.png') },
  { id: '6', teamKey: 'KIA',    name: 'KIA 타이거즈', logo: require('../../assets/images/PhotoBooth/Select/KIA.png') },
  { id: '7', teamKey: 'LG',     name: 'LG 트윈스',    logo: require('../../assets/images/PhotoBooth/Select/LG.png') },
  { id: '8', teamKey: 'SSG',    name: 'SSG 랜더스',   logo: require('../../assets/images/PhotoBooth/Select/SSG.png') },
  { id: '9', teamKey: 'NC',     name: 'NC 다이노스',  logo: require('../../assets/images/PhotoBooth/Select/NC.png') },
  { id: '10',teamKey: 'KT',     name: 'KT 위즈',      logo: require('../../assets/images/PhotoBooth/Select/KT.png') },
];

/** 2) 프레임 종류 정의(아이디만 사용; 이미지는 아래 FRAME_IMAGES에서 고름) */
const frames = [
  { id: '2x2', name: '2x2' },
  { id: '1x4', name: '1x4' },
];

/** 3) 팀별 프레임 이미지 매핑 (모두 미리 require) */
const FRAME_IMAGES = {
  BASE: { // 팀 미선택 시 사용할 기본 프레임
    '2x2': require('../../assets/images/PhotoBooth/Frames/base/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/base/1x4.png'),
  },
  KIWOOM: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/kiwoom/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/kiwoom/1x4.png'),
  },
  DOOSAN: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/doosan/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/doosan/1x4.png'),
  },
  LOTTE: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/lotte/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/lotte/1x4.png'),
  },
  SAMSUNG: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/samsung/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/samsung/1x4.png'),
  },
  HANHWA: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/hanhwa/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/hanhwa/1x4.png'),
  },
  KIA: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/kia/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/kia/1x4.png'),
  },
  LG: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/lg/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/lg/1x4.png'),
  },
  SSG: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/ssg/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/ssg/1x4.png'),
  },
  NC: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/nc/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/nc/1x4.png'),
  },
  KT: {
    '2x2': require('../../assets/images/PhotoBooth/Frames/kt/2x2.png'),
    '1x4': require('../../assets/images/PhotoBooth/Frames/kt/1x4.png'),
  },
};

/** 4) 선택팀에 맞는 프레임 이미지 선택 헬퍼 */
const getFrameSource = (teamKeyOrNull, frameId) => {
  const theme = teamKeyOrNull ? FRAME_IMAGES[teamKeyOrNull] : FRAME_IMAGES.BASE;
  return theme?.[frameId] ?? FRAME_IMAGES.BASE[frameId];
};

const SelectScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState(null);

    const { setSelectedTeam: setGlobalTeam, setSelectedFrame: setGlobalFrame } = photoBoothStore();  

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