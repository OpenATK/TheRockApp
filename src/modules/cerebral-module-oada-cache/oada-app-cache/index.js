import { Promise } from 'bluebird';
import uuid from 'uuid';
import _ from 'lodash';
let agent = require('superagent-promise')(require('superagent'), Promise);
import pointer from 'json-pointer';
import PouchDB from 'pouchdb';
let db_singleton = null;

var pouchPutNew = function(token, url) {
	if (token) {
    return agent('GET', url)
    .set('Authorization', 'Bearer '+ token)
    .end()
    .then(function(response) {
      if (response.body._id) {
      	//each rock
      	return cache.db().put({
          doc: response.body._id,
          _id: url, 
        }).then(function(result) {
          return cache.db().put({
            doc: response.body, 
            _id: response.body._id,
          }).then(function(res) {
          	return response.body;
          }).catch(function(err) {
          	console.log(err);
          })
        }).catch(function(err) {
          console.log(err);
        })
        //return response.body;
      } else {
      	return response.body;
      }
    }).catch(function(err) {
      if (err.status === 404) {
        return null;
      }
    });
  } else { return null;}
}

var pouchPutUpdate = function(token, url) {
	if (token) {
	  return agent('GET', url)
	  .set('Authorization', 'Bearer '+ token)
	  .end()
	  .then(function(response) {
	    if (response.body._id) {
	      return cache.db().put({
	        doc: response.body, 
	        _id: response.body._id,
	      }).then(function(res) {
	    	  return response.body;
	      }).catch(function(err) {
	    	  console.log(err);
	      })
	      
	    } else {
	  	  return response.body;
	    }
	  }).catch(function(err) {
	    if (err.status === 404) {
	      return null;
	    }
	  });
	} else { return null;}
}


var simplePut = function(resourcesUrl, bookmarksUrl, resData, bookData, token) {
  
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
    }).catch(function(err) {
  	  console.log(err)
  	  return err;
    })
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

var handleStarSetup = function(subTree, serverId, keysArray){
  var bookmarksDir = pointer.compile(keysArray);

  return agent('GET', serverId.bookmarksUrl + bookmarksDir + '/')
    .set('Authorization', 'Bearer '+ serverId.token)
    .end()
    .then(function(response) {
      if (response.body) {
      	return Promise.each(Object.keys(response.body), function(key) {
      	  var content = {};
      	  content[key] = subTree['*'];  //skip * key and move to next key
          var newKeysArray = [];
          for (var i = 0; i < keysArray.length; i++) {
            newKeysArray[i] = keysArray[i];
          }
          return recursiveSetup(content, serverId, newKeysArray);
      	})
      } else { return null; }
    })
}

var recursiveSetup = function(subTree, serverId, keysArray) {
  return Promise.each(Object.keys(subTree), function(key) {
    if (key === '*') {
      return handleStarSetup(subTree, serverId, keysArray);
    }
    var content = subTree[key];
    if (typeof content === 'object') {
      keysArray.push(key);
      var bookmarksDir = pointer.compile(keysArray);

      return agent('GET', serverId.bookmarksUrl + bookmarksDir + '/')
        .set('Authorization', 'Bearer '+ serverId.token)
        .end()
        .then(function(response) {
          //Check if _id exists
          //Yes, GET resources with id
          //No, PUT with new generated id to resources, then links to bookmarks
          //console.log('Bookmark exists! id not checked yet!');

          if (response.body._id) {
            return recursiveSetup(content, serverId, keysArray);

          } else {

            if (_.isEmpty(response.body)) {
              var data = replaceLinks(content, content);
              return updateServerSetup(content, data, key, serverId, keysArray);
            } else {
              return recursiveSetup(content, serverId, keysArray);
            }
          }
        }).catch((error) => {
          var data = replaceLinks(content, content);
          return updateServerSetup(content, data, key, serverId, keysArray);
        });
    } else { return null; }
  })
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
            return recursiveSetup(subTree, serverId, keysArray);
          });
      });
  } else {
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
        return recursiveSetup(subTree, serverId, keysArray);
      });
  }
}


var smartPutSetup = function(domain, token, pathArray, data, objKey, tree) {
  var temp = _.cloneDeep(tree);
  var treePointer = '/' + pathArray[0] + '/';
  var bookmarksUrl = 'https://'+domain+'/bookmarks/';
  var resourcesUrl = 'https://'+domain+'/resources/';
  return Promise.each(pathArray, function(pathElement, i) {
    temp = temp[pathElement]; 
    bookmarksUrl += pathElement + '/';
    var bookData;
    if (pathArray[i+1]) {
      if (temp['*']) {
        if (!temp[pathArray[i+1]]) {  //if end of object
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
            bookData = {
              _id: resData._id,
              _rev: resData._rev
            };
            return simplePut(resourcesUrl+id, bookmarksUrl+pathArray[i+1]+'/', resData, bookData, token)
          } return false // Else no need to PUT anything, the server will make it an empty object
          //update 'corn' or 'indiana' to subTree
        } return false     
      } else {
        treePointer += pathArray[i+1] + '/';
        return false
      }
    } else {
      bookData = {};
      bookData[data.id] = {
        _id: data.id,
        _rev: '0-0'
      };
      return simplePut(resourcesUrl+objKey, bookmarksUrl, data, bookData, token)
    }
  }).catch(function(err) {
  	console.log(err)
  	return err;
  })
}

var putSetup = function(domain, token, bookmarksUrl, data, tree) {
	if (data.sync_status === 'new') {
    //New object
    return Promise.try(function() {
      // Assume easy situations without children resources
      // PUT to /resources
      //var resourcesUrl = 'https://' + domain + '/resources/';
      var objKey = bookmarksUrl.slice(-37, -1);  //Rock key!!
      var pathStr = bookmarksUrl.slice(8+domain.length, -38);
      var pathArray = pointer.parse(pathStr);
      pathArray.splice(0, 1);  //remove bookmarks
      return smartPutSetup(domain, token, pathArray, data, objKey, tree);
      }).then(() => {
	      return cache.get(bookmarksUrl, token).then(function() {
	  	    return true
	      })
      }).catch(function(err) {
        return err;
      })
  } else {
    //Update existing object
    //Put to existing resources
    var url = 'https://'+domain+'/resources/'+data.id+'/';
    return Promise.try(function() {
  	  return simpleResPut(url, data.update, token);
    }).then(() => {
  	  return cache.get(bookmarksUrl, token).then(function() {
  	    return true
      })
    })
  }
}

var cache = {
  
  get: function(url, token) {
    //get resource id from url
    return cache.db().get(url).then(function(resId) {
      //get resource
      return cache.db().get(resId.doc).then(function(content) {
        return content.doc;
      }).catch(function(err) {
      	return pouchPutUpdate(token, url);
      })
    // Perform an HTTP request to OADA 
    }).catch(function(err) {
      return pouchPutNew(token, url);
    })
  },

  delete: function(token, url) {
  	return agent('DELETE', url)
      .set('Authorization', 'Bearer '+ token)
      .end()
  },

//check if there is a path with keys in each level
//If a key exists (GET the key), nothing
//If not, PUT to resources
  db: () => {
    if (!db_singleton) db_singleton = new PouchDB('TheRockApp', { size: 50 });
    return db_singleton;
  },

  put: function(domain, token, bookmarksUrl, data, tree) {
    //Delete pouch
    return cache.db().get(bookmarksUrl).then(function(resId) {
      return cache.db().get(resId.doc).then(function(content) {
        return cache.db().remove(content)
      }).then(function(){
        return putSetup(domain, token, bookmarksUrl, data, tree);
      }).catch(function(err) {
        console.log(err)
      	return err;
      })
    }).catch(function(err) {
      console.log('Not in Pouch')
      return putSetup(domain, token, bookmarksUrl, data, tree);
    })
  },

//setup takes the setup javascript object and recursively PUTS keys to oada server
//and create resources as necessary.
//For rocks, there are no other keys to find from the oada-formats library. 
//We don't have to worry about this for now.
  setup: function(domain, token, tree) {
  	var resourcesUrl = 'https://' + domain + '/resources/';
    var bookmarksUrl = 'https://' + domain + '/bookmarks';
    var serverId = { domain: domain, token: token, resourcesUrl: resourcesUrl, bookmarksUrl: bookmarksUrl };
  	var keysArray = [];
    return recursiveSetup(tree, serverId, keysArray);
  },
}
module.exports = cache;


