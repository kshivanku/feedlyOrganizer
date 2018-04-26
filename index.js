var request = require('request');
var fs = require('fs');

var headers = require('./config')

// makeRequest('GET', "https://cloud.feedly.com/v3/categories?sort=feedly", {}, "categories");
// makeRequest('GET', "https://cloud.feedly.com/v3/subscriptions", {}, "subscriptions")
// makeRequest('GET', "https://cloud.feedly.com/v3/feeds/" + encodeURIComponent("feed/http://www.alistapart.com/site/rss") , {}, "feeds");
// makeRequest('GET',
//             "https://cloud.feedly.com//v3/mixes/contents?streamId=" + encodeURIComponent("feed/http://airbnb.design/feed/"),
//             {
//               count : 10,
//               hours : 336,
//               backfill: true
//             },
//             "entries_airbnb");
// makeRequest('GET', "https://cloud.feedly.com/v3/entries/"+ encodeURIComponent("sHIlxSn/2QjuakaLIDo0MWugitGS78fKmsJsV1C1jWM=_1624f27d9b0:4121948:34f43e70"), {}, "readEntry");
// sortInCategories();
// filterSubscriptions();
// getEntries("cnn_entries");

function makeRequest(method, url, inputData, fileName) {
    var options = {
        url: url,
        headers: headers,
        json: inputData,
        method: method
    };

    function gotData(error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200 && fileName != 'test') {
            fs.writeFileSync('test_files/' + fileName + '.json', JSON.stringify(body, null, 2));
        }
    }
    request(options, gotData);
}

function sortInCategories() {
    var subscriptions = JSON.parse(fs.readFileSync("test_files/ubscriptions.json"));
    var categories = JSON.parse(fs.readFileSync("test_files/categories.json"));
    var categoriesObj = createCategoriesObj(categories);
    var inputData = [];
    for (var i = 0; i < subscriptions.length; i++) {
        var isIndianSource = false;
        var isCategorized = false;
        var so = new SubscriptionObj();
        so.id = subscriptions[i].id;
        if(subscriptions[i].categories) {
          so.categories.push(subscriptions[i].categories);
        }
        if (subscriptions[i].topics) {
            var topics = convertToLowerCase(subscriptions[i].topics);
            if (topics.indexOf("india") != -1) {
              if(!isPresentAlready(so.categories, "India News")){
                so.categories.push({id: categoriesObj["India News"], label: "India News"});
              }
                isIndianSource = true;
                isCategorized = true;
            }
            if (subscriptions[i].topics.indexOf("news") != -1 && !isIndianSource) {
              if(!isPresentAlready(so.categories, "US News")){
                so.categories.push({id: categoriesObj["US News"], label: "US News"});
              }
              isCategorized = true;
            }
            if (topics.indexOf("tech") != -1) {
              if(!isPresentAlready(so.categories, "Tech News")){
                so.categories.push({id: categoriesObj["Tech News"], label: "Tech News"});
              }
                isCategorized = true;
            }
            if (topics.indexOf("design") != -1) {
              if(!isPresentAlready(so.categories, "Design Blogs")){
                so.categories.push({id: categoriesObj["Design Blogs"], label: "Design Blogs"});
              }
                isCategorized = true;
            }
            if (topics.indexOf("programming") != -1) {
              if(!isPresentAlready(so.categories, "Programming Blogs")){
                so.categories.push({id: categoriesObj["Programming Blogs"], label: "Programming Blogs"});
              }
                isCategorized = true;
            }
            if (!isCategorized) {
                so.categories.push({id: categoriesObj["Other Blogs"], label: "Other Blogs"});
            }
        }

        if (subscriptions[i].velocity) {
          var velocity = subscriptions[i].velocity;
          if(velocity < 2) {
            so.categories.push({id: categoriesObj["Slow (2 per week)"], label: "Slow (2 per week)"});
          }
          if(velocity < 10 && velocity > 2) {
            so.categories.push({id: categoriesObj["Medium (10 per week)"], label: "Medium (10 per week)"});
          }
          if(velocity < 100 && velocity > 10) {
            so.categories.push({id: categoriesObj["Fast (100 per week)"], label: "Fast (100 per week)"});
          }
          if(velocity < 500 && velocity > 100) {
            so.categories.push({id: categoriesObj["Super Fast (500 per week)"], label: "Super Fast (500 per week)"});
          }
        }
        inputData.push(so);
    }
    fs.writeFileSync('test_files/test.json', JSON.stringify(inputData, null, 2));
    var url = 'https://cloud.feedly.com/v3/subscriptions/.mput'
    makeRequest('POST', url, inputData, "test");

    function SubscriptionObj() {
        this.id = null;
        this.categories = []
    }

    function convertToLowerCase(arr) {
        var lowerArr = [];
        for (var i = 0; i < arr.length; i++) {
            lowerArr.push(arr[i].toLowerCase());
        }
        return lowerArr;
    }

    function createCategoriesObj(categories) {
      var categoriesObj = {}
      for (var i = 0 ; i < categories.length ; i++) {
        categoriesObj[categories.label] = categories.id
      }
      return categoriesObj;
    }

    function isPresentAlready(arr, token) {
      for (var i = 0 ; i < arr.length ; i++) {
        if (arr[i].id == token) {
          return true;
        }
      }
      return false;
    }
}

function filterSubscriptions(){
  var subscriptions = JSON.parse(fs.readFileSync('test_files/ubscriptions.json'));
  var tableDetails = [];
  for (var i = 0 ; i < subscriptions.length ; i++) {
    var row = {};
    row.name = subscriptions[i].title;
    row.subscribers = subscriptions[i].subscribers;
    row.velocity = subscriptions[i].velocity;
    tableDetails.push(row);
  }
  fs.writeFileSync('test_files/ubscriptions_filtered.json', JSON.stringify(tableDetails, null, 2));
}

// var subscriptions = JSON.parse(fs.readFileSync('test_files/ubscriptions.json'));
// var tableDetails = [];
// for (var i = 0 ; i < subscriptions.length ; i++) {
//   if(subscriptions[i].velocity > 500) {
//     tableDetails.push(subscriptions[i].title);
//   }
// }
// console.log(tableDetails);


function getEntries(filename) {
  var entryIDs = JSON.parse(fs.readFileSync(test_files/filename + ".json")).ids;
  makeRequest('POST', "https://cloud.feedly.com/v3/entries/.mget", entryIDs, filename);
}
