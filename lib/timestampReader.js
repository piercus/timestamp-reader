require("./objMapAsync.js");

var ffmpeg = require("fluent-ffmpeg");
var file = require("file");
var tesseract = require('node-tesseract');
var gm = require("gm");
var fs = require("fs");

var formatAnswers = function(timestamps, options){

  if(options.reg && options.regFn){
    var reg = options.reg;
    var regFn = options.regFn;
  } else {
    var reg = options.reg || /^([^\.]*\. ?mp4) ([0-9]*) ?\.\ ?([0-9\ ]*)[\n ]*$/g;
    var regFn = function(t,filename,seconds,ms){
      return {
        filename : filename,
        timeInInput : parseFloat(seconds+"."+ms)
      };
    };
  }

  var debug = options.debug || false;

  return timestamps.map(function(r){
    var o = {};

    // timeInOutput
    o.timeInOutput = (parseInt(r.imageFilename.split(".")[0])-1)/10;

    var positiv = 0, negativ = 0;

    if(r.text && r.text.match(reg)){
      r.text.replace(reg,function(){
        var res = regFn.apply(this, arguments);
        for(var i in res) if(res.hasOwnProperty(i)){
          o[i] = res[i];
        }
      });

      positiv++;
    } else {
      negativ++;
    }

    if(debug){
      console.log("positiv rate is "+toFixed((positiv/(positiv+negative))*100,1)+" %");
    }

    return o;
  });
};

var cbFfmpeg = function(err, tmpFilesFolder, options, cb){
  if(err){
    return cb(err);
  }

  var cropX   = options.cropX || 5,
      cropY   = options.cropY || 665,
      cropW   = options.cropW || 900,
      cropH   = options.cropH || 40,
      scaleX  = options.scaleX || 1200,
      scaleY  = options.scaleY || 720;

  imageFiles = [];

  file.walkSync(tmpFilesFolder, function(dirPath, dirs, imgFiles){
      imageFiles = imageFiles.concat(imgFiles);
  });

  imageFiles.mapAsync(function(val, key, cbOneImage){
      var dest = "cropped_"+val

      //console.log(val);
      gm(tmpFilesFolder+"/"+val).crop(cropW,cropH,cropX,cropY+1).scale(scaleX,scaleY).write(tmpFilesFolder+"/"+dest,function(err){
        if (err) {
          console.log("ERR in IM",err);
          return cbOneImage(err);
        }

          if (err) {
            console.log("ERR in IM",err);
            return cbOneImage(err);
          }


          tesseract.process(tmpFilesFolder+"/"+dest, {
            config : __dirname+"/config.tesseract"
          },function(err, text) {
            if(err) {
              cbOneImage(err);
            } else {
              //console.log("Found",text);
              cbOneImage(null, {
                text : text,
                imageFilename : val,
                folder : tmpFilesFolder
              });
            }
          });
      });

    },{},function(err, texts){
      if(err){
        return cb(err);
      }
      cb(null, formatAnswers(texts, options));
    })
};

module.exports = function(filename, options, cb) {

  if(!options){
    options = {};
  }

  if(typeof(options) === "function"){
    cb = options;
    options = {};
  }

  var width = options.width || 1280,
      height = options.height || 720;

  var fps = options.fps || 10;
  var tmpRoot = options.tmpRoot || "/tmp/timestamp-reader-";
  fs.mkdtemp(tmpRoot, (err, folder) => {
    ffmpeg(filename).size(width+'x'+height).fps(fps).on('end', function(stdout, stderr) {
      cbFfmpeg(null, folder, options, cb);
    }).on('error', function(err, stdout, stderr) {
      console.log('Cannot process video: ' + err.message, stdout, stderr);
      cbFfmpeg(err, tmpFilesFolder, options, cb);
    }).save(folder+"/%d.png");
  });
};
