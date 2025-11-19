import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SplashScreen = () => {
  return (
    <View style={{flex:1, backgroundColor:'black', justifyContent:'center', alignItems:'center'}}>

        <View style={{width: 272, height: 253, flexShrink: 0, borderRadius: 272, backgroundColor: '#443D4D', filter: 'blur(130px)', position:'absolute', right:'-20%', top: '5%'}}></View>
        <View style={{width: 272, height: 253, flexShrink: 0, borderRadius: 272, backgroundColor: 'rgba(235, 0, 41, 0.44)', filter: 'blur(130px)', position:'absolute', bottom:'20%', left:'-20%'}}></View>
        <View style={{width: 272, height: 253, flexShrink: 0, borderRadius: 272, backgroundColor: '#943C23', filter: 'blur(130px)', position:'absolute', right: '-20%', bottom:'0%'}}></View>

        {/* <View style={{width: 272, height: 253, flexShrink: 0, borderRadius: 272, backgroundColor: '#7284DB', filter: 'blur(130px)', position:'absolute', left:'-20%', top:'5%'}}></View> */}

        {/* <View style={{width: 272, height: 253, flexShrink: 0, borderRadius: 272, backgroundColor: '#7284DB', filter: 'blur(130px)', position:'absolute', left:'-20%', top:'5%'}}></View> */}

        <Text style={{fontSize: 32, color:'white', fontStyle:'italic'}}>
          {/* BETA */}
        </Text>
    </View>
  )
}

export default SplashScreen

const styles = StyleSheet.create({})