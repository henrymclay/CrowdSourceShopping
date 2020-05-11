import React from 'react';
import { View, 
  Button,  
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList,
  Dimensions } from 'react-native';
import { Avatar, List, ListItem } from "react-native-elements";
import { useEffect, useState } from 'react';
import { Block, Text, theme } from "galio-framework";
import { useNavigation } from '@react-navigation/native';
import styled from 'styled-components';

let deviceWidth = Dimensions.get('window').width

export function FeedEntry( props ) {

    const navigation = useNavigation();

    FlatListItemSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: deviceWidth * 0.8,
              // width: "100%",
              backgroundColor: "#000",
            }}
          />
        );
      }
    
    const [isLoading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
      fetch('http://flip1.engr.oregonstate.edu:4545/feedEntries')
        .then((response) => response.json())
        .then((json) => setData(json))
        .catch((error) => console.error(error))
        .finally(() => setLoading(false))
    }, []);
    
    return (

    <View style={{ flex: 1, padding: 5, width: deviceWidth * 0.98 }}>
      {isLoading ? <ActivityIndicator/> : (
        <FlatList
          data={data}
          // ItemSeparatorComponent = {FlatListItemSeparator}
          renderItem={({ item }) => (                
                <>

                <View style={styles.feedBox}>

                  <View style={styles.feedBoxHeader}>
                    <Avatar
                    rounded
                    source={require('../../../assets/imgs/romanescoicon.png')}
                    onPress={() => {
                        navigation.navigate("Profile"), {
                        name: "testName",
                        karma: 710,
                      };}}
                     />  
                    <Text numberOfLines={1} style={styles.headline}> 
                    {item.first_name} shopped {item.store_name} on {item.time_added.slice(0,10)}
                    </Text>
                  </View>  
                  
                  <View style={{backgroundColor:'#F7FAFC', padding: 3}}></View>

                  <View style={styles.feedBoxReview}>
                    <Text size={16} color="#32325D">Feedback Type: {item.store_feedback_category}, {item.store_feedback_text}</Text>
                    <View style={{backgroundColor:'#F7FAFC', flex:1 ,padding: 1.5}}></View>
                    <Text numberOfLines={3} size={16} color="#32325D">My experience was ABSOLUTELY great/terrible! 
                    Writing a longer placeholder review so we know how it will display and make sure the text cuts off after three long long lines
                    </Text>
                  </View>

                  <View style={{backgroundColor:'#F7FAFC', flex:1 ,padding: 3}}></View>

                </View>
                
                <View style={{backgroundColor:'#fff', flex:1 ,padding: 3}}></View>
                
                </>
          )}
        />
      )}
    </View>
       
    );
}

// <Text size={16} color="#32325D">Review: {item.store_feedback_text}</Text>

{/* <View style={styles.container}>
            <View style={styles.row}>
                <Text>Name: {props.first_name}</Text>
                <Text>Karma: {props.karma}</Text>
            </View> 
            <View style={styles.row}>
                <Text>Store Name: {props.store}</Text>
                <Text>Rating: {props.rating}</Text>
            </View> 
            <View style={styles.col}>
                <Text>Grocery Trip Review: </Text>
                <Text>{props.review_text}</Text>
            </View> 
        </View> */}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#5E72E4',
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'solid',
      flexDirection: 'column',
    },
    col:{
      //flex: 1,
      backgroundColor: '#5E72E4',
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'solid',
      flexDirection: 'row'
    },
    row:{
      //flex: 1,
      backgroundColor: '#5E72E4',
      alignItems: 'center',
      justifyContent: 'center',
      borderStyle: 'solid',
      flexDirection: 'column'
    },
    feedBox: {
      backgroundColor:'#F7FAFC'
      , padding: 3
      , borderColor: '#F7FAFC'
      , borderRadius: 25
      , borderWidth: 1
    },
    feedBoxHeader: {
      backgroundColor:'#F7FAFC'
      , padding: 3
      , borderColor: '#F7FAFC'
      , borderRadius: 25
      , borderWidth: 1
      , flexDirection: 'row'
      , alignItems: 'center'
    },    
    feedBoxReview: {
      backgroundColor:'#F7FAFC'
      , padding: 3
      , borderColor: '#F7FAFC'
      , borderRadius: 25
      , borderWidth: 1
      , flex: 0.5
    },        
    headline: {
       fontSize: 14,
       color:'#32325D',
       textAlign: 'left',
       textAlignVertical: "center",
       paddingLeft: 10,
       width: deviceWidth * 0.75
    }
  });






