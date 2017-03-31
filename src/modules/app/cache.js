import PouchDB from 'pouchdb';
import { Promise } from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';
var agent = require('superagent-promise')(require('superagent'), Promise);
var pointer = require('json-pointer');
import db from '../Cache';
import tree from '../Cache/tree.js';

module.exports = {
  
  get: function(url, token) {
    //var db = new PouchDB('TheRockApp');
    //get resource id from url
    console.log(url)
    return db().get(url).then(function(resId) {
      //get resource
      console.log('!!!url is in pouch!!!')
      console.log(resId)
      return db().get(resId.doc).then(function(content) {
        console.log(content)
        return content.doc;
      }).catch(function(err) {
      	if (token) {
          return agent('GET', url)
          .set('Authorization', 'Bearer '+ token)
          .end()
          .then(function(response) {
            if (response.body._id) {
	            console.log(response.body)
	      	    console.log(response.body._id)
	            return db().put({
	              doc: response.body, 
	              _id: response.body._id,
	            }).then(function(res) {
	          	  console.log('!!!2nd Pouch PUT!!!')
	          	  console.log(res)
	          	  console.log(response.body)
	          	  return response.body;
	            }).catch(function(err) {
	          	  console.log(err);
	            })
              
            } else {
          	  return response.body;
            }
          }).catch(function(err) {
            if (err.status == 404) {
              return null;
            }
          });
        } else { return null;}
      })
    // Perform an HTTP request to OADA 
    }).catch(function(err) {
      console.log('!!!Not in pouch!!!')
      if (token) {
        return agent('GET', url)
        .set('Authorization', 'Bearer '+ token)
        .end()
        .then(function(response) {
          if (response.body._id) {
          	//each rock
          	console.log(response.body._id)
          	console.log(url)
          	return db().put({
              doc: response.body._id,
              _id: url, 
            }).then(function(result) {
              console.log('!!!1st Pouch PUT!!!')
              console.log(result)
              console.log(response.body)
          	  console.log(response.body._id)
              return db().put({
                doc: response.body, 
                _id: response.body._id,
              }).then(function(res) {
              	console.log('!!!2nd Pouch PUT!!!')
              	console.log(res)
              	console.log(response.body)
              	return response.body;
              }).catch(function(err) {
              	console.log(err);
              })
            }).catch(function(err) {
              console.log(err);
            })
          	//console.log(result)
          	//console.log(res);
            //return response.body;
          } else {
          	return response.body;
          }
        }).catch(function(err) {
          if (err.status == 404) {
            return null;
          }
        });
      } else { return null;}
    });
  },


  delete: function(token, url) {
  	console.log(url)
  	return agent('DELETE', url)
      .set('Authorization', 'Bearer '+ token)
      .end()
  },

//setup takes the setup javascript object and recursively PUTS keys to oada server
//and create resources as necessary.
//For rocks, there are no other keys to find from the oada-formats library. 
//We don't have to worry about this for now.

//check if there is a path with keys in each level
//If a key exists (GET the key), nothing
//If not, PUT to resources

  setup: function(domain, token) {
  	//console.log(tree);
  	//console.log(token);
  	//console.log("setup runs!");
  	var resourcesUrl = 'https://' + domain + '/resources/';
    var bookmarksUrl = 'https://' + domain + '/bookmarks';
    var serverId = { domain: domain, token: token, resourcesUrl: resourcesUrl, bookmarksUrl: bookmarksUrl };
  	var keysArray = [];
  	recursiveSetup(tree, serverId, keysArray);
  },


  put: function(domain, token, bookmarksUrl, data) {
  	var self = this;
    //Delete pouch
    console.log(bookmarksUrl)
    return db().get(bookmarksUrl).then(function(resId) {
      console.log('!!!Remove Pouch!!!')
      console.log(resId)
      return db().get(resId.doc).then(function(content){
        return db().remove(content)
      }).then(function(){
        console.log('!!!Content in the Pouch is removed!!!')

        if (data.sync_status == 'new') {
          //New object
          return Promise.try(function() {
            // Assume easy situations without children resources
            // PUT to /resources
            //var resourcesUrl = 'https://' + domain + '/resources/';
            //console.log(uuid.v4().length);
            var objKey = bookmarksUrl.slice(-37, -1);  //Rock key!!
            var pathStr = bookmarksUrl.slice(8+domain.length, -38);
            var pathArray = pointer.parse(pathStr);
            pathArray.splice(0, 1);  //remove bookmarks
            console.log(pathArray);
            return smartPutSetup(domain, token, pathArray, data, objKey);
          }).then(() => {
  	        return self.get(bookmarksUrl, token).then(function() {
  	  	      console.log('finished put')
  	  	      return true
  	        })
          }).catch(function(err) {
            console.log(err)
            return err;
          })
        } else {
          //Update existing object
          //Put to existing resources
          var url = 'https://'+domain+'/resources/'+data.id+'/';
          return Promise.try(function() {
      	    return simpleResPut(url, data.update, token);
          }).then(() => {
      	    //console.log(bookmarksUrl+data.id+'/')
      	    return self.get(bookmarksUrl, token).then(function() {
  	  	      console.log('finished update put')
  	  	      return true
  	        })
          })
        }


      }).catch(function(err) {
        console.log(err)
      	return err;
      })
    }).catch(function(err) {
      //console.log("Pouch get error")
      //console.log(err)
      //return err;
      if (data.sync_status == 'new') {
      //New object
      return Promise.try(function() {
        // Assume easy situations without children resources
        // PUT to /resources
        //var resourcesUrl = 'https://' + domain + '/resources/';
        //console.log(uuid.v4().length);
        var objKey = bookmarksUrl.slice(-37, -1);  //Rock key!!
        var pathStr = bookmarksUrl.slice(8+domain.length, -38);
        var pathArray = pointer.parse(pathStr);
        pathArray.splice(0, 1);  //remove bookmarks
        console.log(pathArray);
        return smartPutSetup(domain, token, pathArray, data, objKey);
        }).then(() => {
  	      return self.get(bookmarksUrl, token).then(function() {
  	  	    console.log('finished put')
  	  	    return true
  	      })
        }).catch(function(err) {
          console.log(err)
          return err;
        })
      } else {
        //Update existing object
        //Put to existing resources
        var url = 'https://'+domain+'/resources/'+data.id+'/';
        return Promise.try(function() {
      	  return simpleResPut(url, data.update, token);
        }).then(() => {
      	  //console.log(bookmarksUrl+data.id+'/')
      	  return self.get(bookmarksUrl, token).then(function() {
  	  	    console.log('finished update put')
  	  	    return true
  	      })
        })
      }
    })
  },
}

var smartPutSetup = function(domain, token, pathArray, data, objKey) {

  var temp = _.cloneDeep(tree);
  var treePointer = '/' + pathArray[0] + '/';
  var bookmarksUrl = 'https://'+domain+'/bookmarks/';
  var resourcesUrl = 'https://'+domain+'/resources/';
  return Promise.each(pathArray, function(pathElement, i) {
  //pathArray.forEach((pathElement, i) => {
    console.log('!!!!!!!!!!!!!!', i, '!!!!!!!!!!!!!!')
    console.log(temp);
    console.log(tree);
    console.log(pathElement)
    temp = temp[pathElement]; 
    //var bookmarksUrl = bookmarksUrl.concat(pathElement + '/')
    bookmarksUrl += pathElement + '/';
    //console.log(bookmarksUrl);
    if (pathArray[i+1]) {
      if (temp['*']) {
        if (!temp[pathArray[i+1]]) {
          temp[pathArray[i+1]] = temp['*'];
          //Update keys to the tree
          pointer.set(tree, treePointer+pathArray[i+1], pathArray[i+1])
          treePointer += '*/';
          if (temp['*']._type) {
            //Generate a new resource id
            var id = uuid.v4();
            var resData = {
              _id: id,
              _rev: '0-0',
            };
            Object.keys(temp['*']).forEach(function(element) {
              resData[element] = {};
            })
            resData._type = temp['*']._type;
          
            var bookData = {
              _id: resData._id,
              _rev: resData._rev
            };

            return simplePut(resourcesUrl+id, bookmarksUrl+pathArray[i+1]+'/', resData, bookData, token)
        
          } return false // Else no need to PUT anything, the server will make it an empty object
          //update 'corn' or 'indiana' to subTree
          //temp[pathArray[i+1]] = temp['*'];
        } return false     
      } else {
        treePointer += pathArray[i+1] + '/';
        return false
      }
    } else {
      console.log('no element in the next index. Deep PUT the data')
      var bookData = {};
      bookData[data.id] = {
        _id: data.id,
        _rev: '0-0'
      };
      return simplePut(resourcesUrl+objKey, bookmarksUrl, data, bookData, token)
    }
    console.log('smartPutSetup End')
//  })
  }).catch(function(err) {
  	console.log(err)
  	return err;
  })
}

var simplePut = function(resourcesUrl, bookmarksUrl, resData, bookData, token) {
  //console.log('simplePut log Start');
  //console.log(resourcesUrl);
  //console.log(bookmarksUrl);
  //console.log(resData);
  //console.log(bookData);
  //console.log('simplePut log End');
  
  return agent('PUT', resourcesUrl + '/')
    .set('Authorization', 'Bearer '+ token)
    .send(resData)
    .end()
    .then((res) => {
      return agent('PUT', bookmarksUrl)
        .set('Authorization', 'Bearer '+ token)
        .send(bookData)
        .end()
    }).catch(function(err) {
  	  console.log(err)
  	  return err;
    })
}

var simpleResPut = function(url, data, token) {
  return agent('PUT', url + '/')
    .set('Authorization', 'Bearer '+ token)
    .send(data)
    .end()
    .then(() => {
      console.log('!!!simpleResPut Done!!!')
    }).catch(function(err) {
  	  console.log(err)
  	  return err;
    })
}

var handleStarSetup = function(subTree, serverId, keysArray){
  var bookmarksDir = pointer.compile(keysArray);
  //console.log(serverId.bookmarksUrl + bookmarksDir + '/');

  return agent('GET', serverId.bookmarksUrl + bookmarksDir + '/')
    .set('Authorization', 'Bearer '+ serverId.token)
    .end()
    .then(function(response) {
      if (response.body) {
      	return Promise.each(Object.keys(response.body), function(key) {
      	  var content = {};
      	  content[key] = subTree['*'];
          //console.log('* recursive');
          var newKeysArray = [];
          for (var i = 0; i < keysArray.length; i++) {
            newKeysArray[i] = keysArray[i];
          }
          //console.log(newKeysArray);
          return recursiveSetup(content, serverId, newKeysArray);
      	})
      }
    })
}

var recursiveSetup = function(subTree, serverId, keysArray) {
  return Promise.each(Object.keys(subTree), function(key) {
    if (key == '*') {
      //console.log('* found!!!')
      return handleStarSetup(subTree, serverId, keysArray);
    }
    var content = subTree[key];
    //console.log(key);
    if (typeof content === 'object') {
      keysArray.push(key);
      var bookmarksDir = pointer.compile(keysArray);
      //console.log(serverId.bookmarksUrl + bookmarksDir + '/');

      return agent('GET', serverId.bookmarksUrl + bookmarksDir + '/')
        .set('Authorization', 'Bearer '+ serverId.token)
        .end()
        .then(function(response) {
          //Check if _id exists
          //Yes, GET resources with id
          //No, PUT with new generated id to resources, then links to bookmarks
          //console.log('Bookmark exists! id not checked yet!');

          if (response.body._id) {
            //console.log('id found (Resource exists already)!');
            //console.log('Call Recursive function!');
            return recursiveSetup(content, serverId, keysArray);

          } else {
            //console.log('Bookmarks exists, but id NOT found!');

            if (_.isEmpty(response.body)) {
              var data = replaceLinks(content, content);
              return updateServerSetup(content, data, key, serverId, keysArray);
            } else {
              //console.log('Call Recursive function!');
              return recursiveSetup(content, serverId, keysArray);
            }

          }
        }, function(error) {
          //console.log(error);
          //console.log(keysArray);
          //console.log('Bookmarks not exists!');
          var data = replaceLinks(content, content);
          return updateServerSetup(content, data, key, serverId, keysArray);
        });

    }

  }).then(function() {
  	console.log('Setup runs success!!!');
  });
}

var updateServerSetup = function(subTree, data, key, serverId, keysArray) {
  if (subTree._type) {
    //Trim data
    var trimData = {
      _id: uuid.v4(),
      _rev: '0-0',
    };
    Object.keys(data).forEach(function(element) {
      trimData[element] = {};
    })
    trimData._type = data._type;
    return agent('PUT', serverId.resourcesUrl + trimData._id + '/')
      .set('Authorization', 'Bearer '+ serverId.token)
      .send(trimData)
      .end()
      .then(function(response) {
        //console.log('PUT to resources success!');
        var linkData = {};
        linkData[key] = {
          _id: trimData._id,
          _rev: trimData._rev
        };       
        //dynamic bookmarkDir remove last element => link to one upper level tree with only _id and _rev
        var newKeysArray = [];
        for (var i = 0; i < keysArray.length - 1; i++) {
          newKeysArray[i] = keysArray[i];
        }
        var newBookmarksDir = pointer.compile(newKeysArray);
        return agent('PUT', serverId.bookmarksUrl + newBookmarksDir + '/')
          .set('Authorization', 'Bearer '+ serverId.token)
          .send(linkData)
          .end()
          .then(function(response) {
            //console.log('PUT link to bookmarks success!');
            //console.log('Call Recursive function!');
            //console.log(keysArray);
            return recursiveSetup(subTree, serverId, keysArray);
          });
      });
  } else {
    //console.log('No type in the tree (list-index)')
    //console.log('PUT to Bookmarks');
    var linkData = {};
    linkData[key] = {};
    //dynamic bookmarkDir remove/skip last element => link to one upper level tree with only _id and _rev
    var newKeysArray = [];
    for (var i = 0; i < keysArray.length - 1; i++) {
      newKeysArray[i] = keysArray[i];
    }
    var newBookmarksDir = pointer.compile(newKeysArray);
    return agent('PUT', serverId.bookmarksUrl + newBookmarksDir + '/')
      .set('Authorization', 'Bearer '+ serverId.token)
      .send(linkData)
      .end()
      .then(function(response) {
        //console.log('PUT link to bookmarks success!');
        //console.log('Call Recursive function!');
        return recursiveSetup(subTree, serverId, keysArray);
      });
  }
}

var replaceLinks = function(desc, example) {
  var ret = (Array.isArray(example)) ? [] : {};
  if (!desc) return example;  // no defined descriptors for this level
  Object.keys(example).forEach(function(key, idx) {
    var val = example[key];
    if (typeof val !== 'object' || !val) {
      ret[key] = val; // keep it as-is
      return;
    }
    if (val._id) { // If it's an object, and has an '_id', make it a link from descriptor
      ret[key] = { _id: desc[key]._id, _rev: '0-0', _type: desc[key]._type };
      return;
    }
    ret[key] = replaceLinks(desc[key],val); // otherwise, recurse into the object looking for more links
  });
  return ret;
}
