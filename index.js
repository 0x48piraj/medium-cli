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


program
 .version('0.0.1', '-v, --version')
 .option('-u, --username <username>', 'The user\'s username')
 .parse(process.argv);

if (program.username){
	console.log('Extracting follower\'s count from @'+program.username, '...');
	getFollwersForUser(program.username).then(console.log);

}
else console.log("Please provide an @username\ntype mfcount --help for help.");