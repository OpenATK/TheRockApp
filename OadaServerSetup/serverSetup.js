var _ = require('lodash');
var uuid = require('uuid');
var gh = require('ngeohash');
var rr = require('recursive-readdir');
var fs = require('fs');
var oadaIdClient = require('oada-id-client');
var PouchDB = require('pouchdb');
var Promise = require('bluebird').Promise;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
var agent = require('superagent-promise')(require('superagent'), Promise);
var rawData = {};
var tiledMaps = {};
var Promise = require('bluebird');
var agent = require('superagent-promise')(require('superagent'), Promise);
var uuid = require('uuid');
var TOKEN;
var DOMAIN;
var Writable = require('stream').Writable;
var las = require('LasStreamReader');
const options = {
  transform_lnglat : true,
  projection : {
    epsg_datum : '2965' //the EPSG datum code e.g. 26905
  }
}
var lasStream = new las.LasStreamReader(options);
lasStream.emitAsync = Promise.promisify(lasStream.emit);

function readLasFile(filename, data) {
  return new Promise(function(resolve, reject) {
    "use strict"
    class TestWritable extends Writable {
      constructor(options) {
      // Calls the stream.Writable() constructor
        super({objectMode:true});
      }

      _write(chunk, encoding, callback) {
        if (Array.isArray(chunk)) {
          for (let point_record of chunk) {
            if (point_record.lng_lat) {
              data.points.push({
                location: {
                  lon: point_record.lng_lat[0],
                  lat: point_record.lng_lat[1],
                  alt: point_record.scaled[2],
                }
              })
            }
          }
        } else {
          console.log("error chunk is not array");
        }
        callback();
      }
    }

    const myWritableStream = new TestWritable();
    var rs = fs.createReadStream(filename, {autoClose : true});
    rs.pipe(lasStream).pipe(myWritableStream);

    // Handle Events  
    lasStream.on("error", (error)=> {
      console.log("error", error);
      reject(error);
    });
    lasStream.on("onParseHeader", (header)=>{
      data.header = header;
    });
    lasStream.on("onParseVLR", (vlr) => {
      data.vlr = vlr;
    });
    lasStream.on("onGotProjection", (projection)=> {
      data.projection = projection;
    });
    lasStream.on("onFinishedReadingRecords", (count)=> {
    });
    lasStream.on('end', function() {
      resolve(data);
    })
  })
}

var tree = {
  'elevation': {
    _type: 'application/vnd.oada.elevation.1+json',
    'as-captured': {
      _type: 'application/vnd.oada.as-captured.1+json',
      'lidar-dataset': {
        _type: 'application/vnd.oada.as-captured.lidar-dataset.1+json',
        'geohash-length-index': {
          'geohash-7': {
            'geohash-index': {},
          },
        },
      },
    },
    'tiled-maps': {
       _type: 'application/vnd.oada.data-index.tiled-maps.1+json',
      'geohash-elevation-model': {
         _type: 'application/vnd.oada.data-index.tiled-map.1+json',
        'geohash-length-index': {},
      },
    },
  },
};

module.exports = function(yield_data_directory, domain, token) {
  TOKEN = token;
  DOMAIN = domain;
  console.log("Started import.");
  rr('./' + yield_data_directory, function(err,files) {
//    return Promise.each(files, function(file) {
    files.forEach(function(file) {
      if ((file).substr(-3) == 'las') {
        console.log('Processing ' + file);
        var data = { points: [], };
        return readLasFile(file, data)
        .then(function(data) {
          console.log('processRawData');
          return this.processRawData(data);
        })
        .then(function(data){
          console.log('creating aggregates');
          return this.createAggregates([2, 3, 4, 5, 6, 7]);
        })
        .then(function(data){
          delete tree['elevation']['as-captured'];
          console.log('putLinkedTree');
          return _Setup.putLinkedTree(tree, []);
        })
      } else {
        return null;
      }
    })
  })
}

processRawData = function(lidarData) {
  var geohash;
  // First check that all the keys are matched
  return Promise.map(lidarData.points, function(row, i) {
    geohash = gh.encode(lidarData.points[i].location.lat, lidarData.points[i].location.lon, 7);
    tree['elevation']['as-captured']['lidar-dataset'] = tree['elevation']['as-captured']['lidar-dataset'] || {
      _type: 'application/vnd.oada.as-captured.lidar-dataset.1+json',
      'geohash-7': {
        'geohash-index': {},
      },
    };
    //Handle new geohashes
    tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash] = tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash] || {
      _type: 'application/vnd.oada.as-captured.lidar.1+json',
      data: { },
    };
 
    var template_id;
    if (!tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].templates) { 
      template_id = uuid.v4();
      tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].templates = {};
      tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].templates[template_id] = {
        location: { 
          datum: 'WGS84',
          'elevation-units': 'meters',
        },
      }
    } else { 
      template_id = Object.keys(tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].templates)[0];
    }

    // Add the data point
    var id = uuid.v4();
    var pt = {
      id: id,
      template: template_id,
      location: lidarData.points[i].location,
    };

    pt.location.alt = pt.location.alt*0.3048;

    tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].data[id] = pt;
    return tree;
  });
}

createAggregates = function(levels) {
  var i = 1;
  return Promise.each(Object.keys(tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index']), function(geohash) {
    return Promise.each(Object.keys(tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].data), function(key) {
      var pt = tree['elevation']['as-captured']['lidar-dataset']['geohash-length-index']['geohash-7']['geohash-index'][geohash].data[key];
      return Promise.each(levels, function(level) {
        var ghlen = 'geohash-'+(level);
        var bucketGh = gh.encode(pt.location.lat, pt.location.lon, level);
        var aggregateGh = gh.encode(pt.location.lat, pt.location.lon, level+2);
        additionalStats = {
          count: 1,
          alt: {
            mean: pt.location.alt,
            sum: pt.location.alt,
            'sum-of-squares': Math.pow(pt.location.alt, 2),
            min: pt.location.alt,
            max: pt.location.alt,
          },
        };
        tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen] = tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen] || {
         'geohash-index': {},
        }
        // Create the bucket
        tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh] = tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh] || {
          _type: 'application/vnd.oada.tiled-maps.geohash-elevation-model.1+json',
          stats: {
            alt: {
              mean: 0,
              sum: 0,
              'sum-of-squares': 0,
              min: Number.MAX_VALUE,
              max: Number.MIN_VALUE,
            },
            count: 0,
          },
          'geohash-data': {},
        };
 
        var template_id;
        if (!tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].templates) { 
          template_id = uuid.v4();
          tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].templates = {};
          tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].templates[template_id] = {
            location: { 
              datum: 'WGS84',
              alt: { units: 'meters' },
            },
          }
        } else { 
          template_id = Object.keys(tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].templates)[0];
        }
      
        // Compute bucket stats for the bucket
        tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].stats = 
          recomputeStats(tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh].stats, additionalStats);

        // Create the aggregate data entry
        tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh]['geohash-data'][aggregateGh] = 
          tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh]['geohash-data'][aggregateGh] || {
            template: template_id,
            alt: {
              min: Number.MAX_VALUE,
              max: Number.MIN_VALUE,
              sum: 0,
              mean: 0,
              'sum-of-squares': 0,
            }, 
            count: 0,
        };

        tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh]['geohash-data'][aggregateGh] = 
          recomputeStats(tree['elevation']['tiled-maps']['geohash-elevation-model']['geohash-length-index'][ghlen]['geohash-index'][bucketGh]['geohash-data'][aggregateGh], additionalStats);

        return tree;
      })
    })
  })
}

recomputeStats = function(currentStats, additionalStats) {
  currentStats.count = currentStats.count + additionalStats.count;
  currentStats.alt.sum = currentStats.alt.sum + additionalStats.alt.sum;
  currentStats.alt['sum-of-squares'] = currentStats.alt['sum-of-squares'] + additionalStats.alt['sum-of-squares'];
  currentStats.alt.mean = currentStats.alt.sum/currentStats.count;
  currentStats.alt.min = (additionalStats.alt.min < currentStats.alt.min) ? additionalStats.alt.min : currentStats.alt.min;
  currentStats.alt.max = (additionalStats.alt.max > currentStats.alt.max) ? additionalStats.alt.max : currentStats.alt.max;
  return currentStats;
};

var _Setup = {
  putLinkedTree: function(desc, keysArray) {
    // If there are any sub-objects, put them first:
    return Promise.map(Object.keys(desc), function(key) {
      var val = desc[key];
      var newArray = [];
      keysArray.forEach(function(k) {
        newArray.push(k);
      })
      if (typeof val === 'object' && val) {
        newArray.push(key);
        return _Setup.putLinkedTree(val, newArray);
      }
    }).then(function() {
      if (!desc._type) throw {cancel: true}; // don't put non-resources
      return desc;
    }).then(function(resource) {
      resource = _Setup.replaceLinks(desc, resource);
      resource.context = {};
      for (var i = 0; i < keysArray.length-1; i++) {
        resource.context[keysArray[i]] = keysArray[i+1];
      }
      return agent('POST', 'https://' + DOMAIN + '/resources/')
        .set('Authorization', 'Bearer '+ TOKEN)
        .send(resource)
        .end()
      .then(function(response) {
        var resId = response.headers.location.replace(/^\/resources\//, '');
        desc._id = resId;
        desc._rev = '0-0';
        var content = {};
        content[keysArray[keysArray.length-1]] = {_id: resId, _rev: '0-0'}
        var url = 'https://' + DOMAIN+'/bookmarks/' + keysArray.slice(0, keysArray.length-1).join('/');
        return agent('PUT', url)
          .set('Authorization', 'Bearer ' + TOKEN)
          .send(content)
          .end();
      });
    }).catch(function(e) {
      // Skip non-resource objects
      if(!e.cancel) {
        throw e;
      }
    })
  },
  
  replaceLinks: function(desc, example) {
    var ret = (Array.isArray(example)) ? [] : {};
    if (!desc) return example;  // no defined descriptors for this level
    Object.keys(example).forEach(function(key, idx) {
      var val = example[key];
      if (typeof val !== 'object' || !val) {
        ret[key] = val; // keep it as-is
        return;
      }
      if (val._id) { // If it's an object, and has an '_id', make it a link from descriptor

        ret[key] = { _id: desc[key]._id, _rev: '0-0' };
        return;
      }
      ret[key] = _Setup.replaceLinks(desc[key],val); // otherwise, recurse into the object looking for more links
    });
    return ret;
  },
};
