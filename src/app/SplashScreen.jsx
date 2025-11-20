import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import BetaLogo from './assets/BetaLogo.svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {
  return (
    <View style={{flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center'}} >
        <View style={[styles.backEllipse, {backgroundColor: '#7284DB', left:'-15%', top: '8%', opacity: 0}]}></View>

        <View style={[styles.backEllipse, {backgroundColor: '#443D4D', right:'-25%', top: '0%', opacity: 100}]}></View>
        <View style={[styles.backEllipse, {backgroundColor: 'rgba(235, 0, 41, 0.44)', left:'-36%', top: '35%', opacity: 100}]}></View>
        <View style={[styles.backEllipse, {backgroundColor: '#943C23', right:'-35%', top: '66%', opacity: 100}]}></View>

        <BetaLogo width='37%'/>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  backEllipse: {
    // width: '70%',
    width: '90%',  
    aspectRatio: 1,
    // width: 272,
    // height: 253,
    flexShrink: 0, 
    borderRadius: '70%', 
    filter: 'blur(100px)', 
    position:'absolute', 
  }
})