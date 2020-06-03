import React, { Component } from 'react';
import { ActivityIndicator,
  Button,
  FlatList, 
  StyleSheet, 
  Dimensions, 
  ImageBackground,
  Text,
  TouchableOpacity,
  AsyncStorage,
  View, 
  ScrollView } from 'react-native';
import { Avatar, List, ListItem } from "react-native-elements";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { withNavigation } from 'react-navigation';
import Modal from 'react-native-modal';

import Images from '../../assets/imgs';

import { appstyles } from '../../styles/appStyle'

const USER_STORAGE_KEY = "@user_id";

const { width, height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;

// To get feed entries to fill screen
let deviceWidth = Dimensions.get('window').width

// var url = "http://192.168.1.7:5000";
var url = "http://flip1.engr.oregonstate.edu:5005";

export default class StoreFeed extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      top_data: [],
      isLoading: true,
      isModalVisible: false,
      setModalVisible: false,
      user_id: ""
    };
  }

  getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem(USER_STORAGE_KEY);
      this.setState({['user_id']: value});
      this.setState({['haveUserId']: true});
    }
    catch {
      console.log("failed to get userId");
    }
  }  

  state = {}

    onChangeText = (key, val) => {
      this.setState({ [key]: val })
    }

  componentDidMount() {
    this.getUserId()
      .then(() => {
      fetch(url + '/getFavoriteStores/', {
           method: 'POST',
           headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               user_id: this.state.user_id,
           }),
       }).then((response) => response.json())
        .then((json) => {
          this.setState({ data: json });
        }).then(
            fetch(url + '/getTopStores/', {
                     method: 'POST',
                     headers: {
                         Accept: 'application/json',
                         'Content-Type': 'application/json',
                     },
                     body: JSON.stringify({
                         user_id: this.state.user_id,
                     }),
                 }).then((response) => response.json())
                  .then((json) => {
                    this.setState({ top_data: json });
                  })
        )
        .finally(() => {
          this.setState({ isLoading: false });
        });
      })
  }

  toggleModal = () => {
    this.setState({ isModalVisible: !this.state.isModalVisible})
  };  

  renderEmptyContainer = () => {

    return(

          <View><Text style={{paddingLeft:10}}>Review stores and your favorites will appear!</Text></View>
      )
  }

  render() {

    const { data, isLoading } = this.state;

    return (

      <>

      <View style={{  backgroundColor:'#fff', flexDirection: 'column' }}>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ width, backgroundColor:'#fff'}}
          >

          <View style={{backgroundColor:'#fff', flex:1 ,padding: 6}}></View>
          <Text style={appstyles.storeHeadline}>
          Your Favorite Stores
          </Text>
          <View style={{backgroundColor:'#fff', flex:1 ,padding: 6}}></View>

          <View style={{ padding: 5, width: deviceWidth * 0.98 }}>

            {isLoading ? <ActivityIndicator/> : (
              <FlatList
                data={this.state.data}
                keyExtractor={item => item.id}
                ListEmptyComponent={this.renderEmptyContainer()}
                renderItem={({ item }) => (
                  <>
                  <View style={appstyles.feedBox}>
                  <TouchableOpacity 
                    onPress={() => this.props.navigation.navigate('StoreProfileModal', 
                      {
                        store_id: item.store_id,
                        store_street: item.store_street,
                        store_city: item.store_city,
                        user_id: this.state.user_id,
                      }
                    )
                    }
                  >

                  <View style={appstyles.feedBoxHeader}>
                    <Avatar
                    rounded
                    source = {Images.stores[item.store_name_fmt]}
                     />  
                    <Text numberOfLines={1} style={appstyles.headline}> 
                    {item.store_name} at {item.store_street}
                    </Text>
                  </View> 
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                       You last rated {item.days_since_last_feedback} days ago   
                    </Text>

                  </TouchableOpacity>

                  </View>

                  <View style={{backgroundColor:'#fff', flex:1 ,padding: 3}}></View>

                  </>
                )}
              />
            )}

            <View style={{backgroundColor:'#fff', flex:1 ,padding: 3}}></View>

          </View>  

          <View style={{backgroundColor:'#fff', padding: 6}}></View>
          <Text style={appstyles.storeHeadline}>
          Popular Stores Near You
          </Text>
          <View style={{backgroundColor:'#fff', flex:1 ,padding: 6}}></View>
                    

          <View style={{ flex: 1, padding: 5, width: deviceWidth * 0.98, alignSelf: "center"}}>

            {isLoading ? <ActivityIndicator/> : (
              <FlatList
                data={this.state.top_data}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <>
                  <View style={appstyles.feedBox}>
                  <TouchableOpacity 
                    onPress={() => this.props.navigation.navigate('StoreProfileModal', 
                      {
                        store_id: item.store_id,
                        store_name_fmt: item.store_name_fmt,
                        store_street: item.store_street,
                        store_city: item.store_city,
                      }
                    )
                    }
                  >
                  <View style={appstyles.feedBoxHeader}>
                    <Avatar
                    rounded
                    source = {Images.stores[item.store_name_fmt]}
                     />  
                    <Text numberOfLines={1} style={appstyles.headline}> 
                    {item.store_name} at {item.store_street}                    
                    </Text>
                  </View> 
                    <Text size={16} color="#32325D" style={{ marginTop: 10 }}>
                       {item.total_feedback} ratings from {item.shoppers} Romanescos in the last 90 days
                    </Text>

                  </TouchableOpacity>

                  </View>

                  <View style={{backgroundColor:'#fff', flex:1 ,padding: 3}}></View>

                  </>
                )}
              />
            )}

          </View> 

         </ScrollView>

         </View>

      </>

    );
  } 

}

export default withNavigation(StoreFeed);


