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

      var expected23 = "1433541887_55721cff53c28_GOPR1710.mp4 1.067733\n\n";

      var expected55 = "1433541887_55721cff53c28_GOPR1710.mp4 3.970633\n\n";

      assert.deepEqual(res[23].text,expected23, "output[23].text should be "+expected23+" and is "+res[23].text);

      assert.deepEqual(res[55].text,expected55, "output[55].text should be "+expected55+" and is "+res[55].text);

    }
  },
  "specific timestamps are found in test video testEdited.mp4" : {
    topic : function(){
      timestampReader("./assets/testEdited.mp4",this.callback);
    },
    "text is recognized" : function(err, res){
      assert.isNull(err, "error should be null");

      var expected23 = "1433537681_55720c9130356_GOPR1637.mp4 7.307300\n\n";

      var expected79 = "1433537681_55720c9130356_GOPR 1637.mp4 8.908900\n\n";

      assert.deepEqual(res[23].text,expected23, "output[23].text should be "+expected23+" and is "+res[23].text);

      assert.deepEqual(res[79].text,expected79, "output[79].text should be "+expected79+" and is "+res[79].text);

    }
  }
}).export(module);
