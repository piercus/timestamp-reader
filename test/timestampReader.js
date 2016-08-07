var timestampReader = require("../lib/timestampReader.js");
var vows = require("vows");
var assert = require("assert");

vows.describe('TimestampReader testing').addBatch({
  "specific timestamps are found in first test video test4.mp4" : {
    topic : function(){
      timestampReader("./assets/test4.mp4", this.callback);
    },
    "text is recognized" : function(err, res){
      assert.isNull(err, "error should be null");

      var expected23 = 1.067733;

      var expected55 = 3.970633;

      assert.deepEqual(res[23].timeInInput,expected23, "output[23].text should be "+expected23+" and is "+res[23].timeInInput);

      assert.deepEqual(res[55].timeInInput,expected55, "output[55].text should be "+expected55+" and is "+res[55].timeInInput);

    }
  },
  "specific timestamps are found in test video testEdited.mp4" : {
    topic : function(){
      timestampReader("./assets/testEdited.mp4",this.callback);
    },
    "text is recognized" : function(err, res){
      assert.isNull(err, "error should be null");

      var expected23 = 7.307300;

      var expected79 = 8.908900;

      assert.deepEqual(res[23].timeInInput,expected23, "output[23].text should be "+expected23+" and is "+res[23].timeInInput);

      assert.deepEqual(res[79].timeInInput,expected79, "output[79].text should be "+expected79+" and is "+res[79].timeInInput);

    }
  }
}).export(module);
