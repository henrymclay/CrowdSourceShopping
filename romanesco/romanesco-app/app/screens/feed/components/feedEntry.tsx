import React from 'react';
import { View, 
  Button,  
  ScrollView, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList,
  TouchableHighlight,
  RefreshControl,
  AsyncStorage,
  Dimensions } from 'react-native';
import { Avatar, List, ListItem } from "react-native-elements";
import { useEffect, useState } from 'react';
import { Block, Text, theme } from "galio-framework";
import { withNavigation } from 'react-navigation';
import ReadMore from 'react-native-read-more-text';
import Icon from 'react-native-vector-icons/Ionicons';

import Images from '../../../assets/imgs';
const USER_STORAGE_KEY = "@user_id";
import { appstyles } from '../../../styles/appStyle'

// To get feed entries to fill screen

const { width, height } = Dimensions.get("screen");
const thumbMeasure = (width - 48 - 32) / 3;
let deviceWidth = Dimensions.get('window').width

// var url = "http://192.168.1.7:5000";
var url = "http://flip1.engr.oregonstate.edu:5005";

export class FeedEntry extends React.Component {

    constructor(props) {

      super(props);

      this.state = {
        data: [],
        isLoading: true,
        refresh: false,
        firstRender: true,
        userId: "",
        refreshing: false,

      };

      this.getFeedEntries();

    }

    getFeedEntries = async () => {

    this.getUserId()
      .then(() => { 
      fetch(url + '/getFeedEntries/', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id_type: this.props.id_type,
            id_value: this.props.id_value,
        }),
    }).then((response) => response.json())
     .then((json) => {
       this.setState({ data: json });
     }).finally(() => {
       this.setState({ isLoading: false });
     });
   });

   }

    state = {}

    onChangeText = (key, val) => {
      this.setState({ [key]: val })
    }

  getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem(USER_STORAGE_KEY);
      this.setState({['userId']: value});
      this.setState({['haveUserId']: true});
    }
    catch {
      console.log("failed to get userId");
    }
  }

    // Separate items in feed
    FlatListItemSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: deviceWidth * 0.8,
              backgroundColor: "#000",
            }}
          />
        );
      }

    // Used to render "Read More" when review text overflows
    _renderTruncatedFooter = (handlePress) => {
      return (
        <Text style={{marginTop: 5}} onPress={handlePress}>
          Read more
        </Text>
      );
    }
    _renderRevealedFooter = (handlePress) => {
      return (
        <Text style={{marginTop: 5}} onPress={handlePress}>
          Show less
        </Text>
      );
    }
    _handleTextReady = () => {}
 
    // Store upvotes and downvotes on backend
    sendResponse(item, vote){
        fetch(url + '/addFeedResponse/', {
         method: 'POST',
         headers: {
             Accept: 'application/json',
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({
             store_feedback_id: item.store_feedback_id,
             vote_value: vote,
             user: item.user_id,
             response_user: this.state.userId,
         }),
       })
    }

    // Set right colors for icons
    upVote(item) {

      // If already upvoted, send a downvote to cancel
      if( item.upVote == 1){

        this.sendResponse(item, -1)

      } else {

        this.sendResponse(item, 1)

      }

      // Flip value of downvote
      item.upVote = !item.upVote;
      // Set downvote to zero
      item.downVote = 0;

      // Force a refresh
      this.setState({ refresh: !this.state.refresh})
      return item
    
    }

    downVote(item) {

      // If already downvoted, send an upvote to cancel
      if( item.downVote == 1){

        this.sendResponse(item, 1)

      } else {

        this.sendResponse(item, -1)

      }

      // Flip value of downvote
      item.downVote = !item.downVote;
      // Set upvote to zero
      item.upVote = 0;
      // Force a refresh
      this.setState({ refresh: !this.state.refresh})
      return item

    }

   renderSeparator = () => {
      return (
        <View style={{backgroundColor:'#fff', flex:1 ,padding: 10}}></View>
      );
    };


  _onRefresh () {
    this.setState({refreshing: true});

    this.getFeedEntries().then(() => {
      this.setState({refreshing: false});
    });
  }

   // Render each feed entry in a flatlist
   render() {

    // Assign upvotes and downvotes to 0
    // Only want to do this once, so use firstRender 
    if( this.state.firstRender ){

      // Add upvote and downvote flags 
      this.state.data.map(function(item) {
        return item['upVote'] = 0
      })
      this.state.data.map(function(item) {
        return item['downVote'] = 0
      })

      this.setState({ firstRender: !this.state.firstRender})

    }

    return (

    <View style={{ padding: 5, alignSelf: "center", backgroundColor: "#fffffc"}}>

      {this.state.isLoading ? <ActivityIndicator/> : (

        <FlatList
          extraData={this.state.refresh} // Need this variable to change to force a refresh
          data={this.state.data}
          refreshControl={
            <RefreshControl refreshing={this.state.refreshing} onRefresh={this._onRefresh.bind(this)}/>
          }
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent = { this.renderSeparator }
          renderItem={({ item }) => (

                <>

                <View style={styles.feedBox}>

                  <View style={styles.feedBoxHeader}>
                    <Avatar
                    rounded
                    source = {Images.reputation[item.user_reputation_category_id]}
                    onPress={() => {
                        this.props.navigation.navigate("FeedProfileModal"
                          , {user_id: item.user_id}
                          );
                        }}
                     />  
                    <Text numberOfLines={1} style={styles.headline}> 
                    {item.first_name} shopped {item.store_name} on {item.time_added.slice(0,10)}
                    </Text>
                  </View>  
                  
                  <View style={{backgroundColor:'#fff', padding: 3}}></View>

                  <View style={styles.feedBoxReview}>

                    <View style={styles.feedBoxReviewText}>

                    <Text size={16} color="#32325D">Feedback Type: {item.store_feedback_category}</Text>
                    <View style={{backgroundColor:'#fff', flex:1 ,padding: 1.5}}></View>
                    <ReadMore numberOfLines={3}
                    renderTruncatedFooter = {this._renderTruncatedFooter}
                    renderRevealedFooter = {this._renderRevealedFooter}
                    onReady={this._handleTextReady}
                    >
                    <Text size={16} color="#32325D">
                    {item.store_feedback_text}
                    </Text>
                    </ReadMore>

                   </View>

                   <View style={styles.feedBoxReviewVote}>

                    <Icon name="ios-thumbs-up" size={25} color={(item.upVote > 0) ? '#FFD500' : '#5E72E4'}
                      onPress={()=>{ item = this.upVote(item)}}
                    />
                    <Icon name="ios-thumbs-down" size={25} color={(item.downVote > 0) ? '#FFD500' : '#5E72E4'}
                      onPress={()=>{ item = this.downVote(item)} }
                    />

                   </View> 

                  </View>

                </View>
                
                </>
          )}

        />

      )}

    </View>

    );

  }
      
}

// My experience was ABSOLUTELY great/terrible! 
// Writing a longer placeholder review so we know how it will display and make sure the text cuts off after three long long lines

// withNavigation returns a component that wraps MyBackButton and passes in the
// navigation prop
export default withNavigation(FeedEntry);

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
      backgroundColor:'#fff'  
      , paddingHorizontal: 6  
      , paddingVertical: 12  
      , marginHorizontal: theme.SIZES.BASE  
      , borderColor: '#fff'  
      , borderRadius: 10  
      , borderWidth: 1  
      , shadowColor: "black"  
      , shadowOffset: { width: 0, height: 0 }  
      , shadowRadius: 8  
      , shadowOpacity: 0.2  
      , zIndex: 2  
    },  
    feedBoxHeader: {  
      backgroundColor:'#fff'  
      , padding: 3  
      , flexDirection: 'row'  
      , alignItems: 'center'  
    },      
    feedBoxReview: {  
      backgroundColor:'#fff'  
      , padding: 3  
      , flexDirection: 'row'  
      , alignItems: 'center'  
    },      
    feedBoxReviewText: {  
      backgroundColor:'#fff'  
      , padding: 3  
      , flex: 0.9  
    },  
    feedBoxReviewVote: {  
      backgroundColor:'#fff'  
      , flex: 0.1  
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