#!/usr/bin/env node

const _ = require('lodash');
var program = require('commander');

const request = require('request-promise');

const JSON_HIJACKING_PREFIX = '])}while(1);</x>';

function generateMediumProfileUri(username) {
  return `https://medium.com/@${username}?format=json`;
}

function massageHijackedPreventionResponse(response) {
  return JSON.parse(response.replace(JSON_HIJACKING_PREFIX, ''));
}

function extractFollowedByCount(profileData) {
  const userId = _.get(profileData, 'payload.user.userId');
  return _.get(profileData, `payload.references.SocialStats.${userId}.usersFollowedByCount`, 0);
}

function extractFollowByCount(profileData) {
  const userId = _.get(profileData, 'payload.user.userId');
  return _.get(profileData, `payload.references.SocialStats.${userId}.usersFollowedCount`, 0);
}

function extractSocialData(linkedin){
  const userId = _.get(linkedin, 'payload.references.Post');
  keys = "" ;
  //gets posts
  _.each( userId, function( val, key_for_posts ) {
   //gets entries 
  entries = _.get(userId,`${key_for_posts}.virtuals.links.entries`);
  
  _.each(entries,function(val, key_for_entries){
      keys = keys+"-> "+_.get(entries,`${key_for_entries}.url`)+"\n";
      
  });
    

  });
  return keys;
}

function extractPostData(profileData){
  const userId = _.get(profileData, 'payload.references.Post');
  keys = "" ;
  _.each( userId, function( val, key_for_posts ) {
    keys = keys+"-> "+_.get(userId,`${key_for_posts}.title`)+"\n";
  });
  return keys;
}


function getFollwersForUser(username) {
  const options = {
    uri: generateMediumProfileUri(username),
    transform: massageHijackedPreventionResponse
  };

  return request(options)
    .then(profileData => {
      let numFollwers = extractFollowedByCount(profileData);
      return Promise.resolve(numFollwers);
    });
}

function getFollowingUser(username) {
  const options = {
    uri: generateMediumProfileUri(username),
    transform: massageHijackedPreventionResponse
  };

  return request(options)
    .then(profileData => {
      let numFollwers = extractFollowByCount(profileData);
      return Promise.resolve(numFollwers);
    });
}



function getSocials(username){
  const options = {
    uri: generateMediumProfileUri(username),
    transform: massageHijackedPreventionResponse
  };

  return request(options)
    .then(socials =>{
        let socialurls = extractSocialData(socials);
        return Promise.resolve(socialurls);
    });
}


function getPosts(username){
  const options = {
    uri: generateMediumProfileUri(username),
    transform: massageHijackedPreventionResponse
  };

  return request(options)
    .then(posts =>{
        let postsurls = extractPostData(posts);
        return Promise.resolve(postsurls);
    });
}


program
 .version('0.0.1', '-v, --version')
 .option('-u, --username <username>', 'The user\'s username')
 .option('-s, --socials <username>', 'The user\'s connected urls')
 .option('-p, --posts <username>', 'The user\'s posts urls')
 .option('-b, --posts <username>', 'The user\'s bio urls')
 .parse(process.argv);


if (program.username){
  console.log('Extracting follower\'s count from @'+program.username, '...');
  getFollwersForUser(program.username).then(console.log);
  console.log('Extracting following\'s count from @'+program.username, '...');
  getFollowingUser(program.username).then(console.log);
}
else if(program.socials){
  console.log('Getting the list of connected websites of '+program.socials, '...');
  getSocials(program.socials).then(console.log);
}
else if(program.posts){
  console.log('Getting the list all posts '+program.posts, '...');
  getPosts(program.posts).then(console.log);
}
else if(program.posts){
  console.log("To be implemented");
}
else console.log("Please provide an @username\ntype mfcount --help for help.");
