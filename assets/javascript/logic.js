$(document).ready(function() {

    var config = {
    apiKey: "AIzaSyAtIKkFHyiQ82mAH41vHZRdqVA_RNAPwWM",
    authDomain: "creepsearch.firebaseapp.com",
    databaseURL: "https://creepsearch.firebaseio.com",
    projectId: "creepsearch",
    storageBucket: "creepsearch.appspot.com",
    messagingSenderId: "724675415469"
    };

  	firebase.initializeApp(config);


  	var database = firebase.database();
    var alphaVanAPIkey = "FJH3LVLVBBGH5FWT";
    var pixAPIkey = "6932043-19061e617df56f24c98781616";


    currency("USD", "JPY");
    currency("USD", "CNY");
    currency("USD", "INR");
    currency("USD", "GBP");
    currency("USD", "CHF");
    currency("USD", "CAD");
    currency("USD", "AUD");
    currency("USD", "HKD");
    currency("USD", "EUR");
    

    // function addBBands(ticker) {
    //   $.ajax({
    //     url: "https://www.alphavantage.co/query?function=BBANDS&symbol=" + ticker + "&interval=daily&time_period=5&series_type=close&nbdevup=3&nbdevdn=3&apikey=" + alphaVanAPIkey, 
    //     method: "GET"
    //   }).done(function(response) {
    //     console.log(response);
    //   })
    // }

    function displayPictures(ticker) {

      $.ajax({        
        url:"https://pixabay.com/api/?key=" + pixAPIkey + "&q=" + encodeURI(ticker) + "&image_type=photo&per_page=4",
        method: "GET"       
      }).done(function(response) {

        results = response.hits;

          // make a new row for the products table

        var newRow = $("<tr>");

        for (var i = 0; i < results.length; i++) {

          var tdColumn = $("<td>");

          // make the image to be put into the new div
          var productImage = $("<img>");

          // the src attribute becomes a still image
          productImage.attr("src", results[i].webformatURL);
          productImage.addClass("image-border");

          tdColumn.append(productImage);

          newRow.append(tdColumn);

        }

          // then, prepend to the table, so latest row of pics is at the top
        $("#tbody-new-row").prepend(newRow);

        });

     }

    function volumeHist(time, volume) {
      var trace = {
        x: time,
        y: volume,
        type: 'histogram',
      };
      var data = [trace];
      Plotly.newPlot('result-panel-left', data);
    }

    function dailyPrice(time, close) {
      console.log("1st");
        Plotly.newPlot( 'result-panel-left', [{
        x: time,
        y: close }], {
        margin: { t: 0 } } );
    }

    function JapaneseCandle(time, open, high, low, close, volume) {
      console.log("2nd");
      var trace1 = {
  
          x: time, 
          close: close,
          decreasing: {line: {color: '#ce0609'}}, 
          high: high,
          increasing: {line: {color: '#10f249'}}, 
          line: {color: 'rgba(31,119,180,1)'},  
          low: low,
          open: open,
          type: 'candlestick', 
          xaxis: 'x', 
          yaxis: 'y'
        };
        
        var data = [trace1];

        var layout = {
          dragmode: 'zoom', 
          margin: {
            r: 10, 
            t: 25, 
            b: 40, 
            l: 60
          }, 
          showlegend: true, 
          xaxis: {
            autorange: true, 
            rangeslider: {range: [time[0], time.slice(-1)[0]]}, 
            title: 'Date', 
            type: 'date'
          }, 
          yaxis: {
            autorange: true, 
            type: 'linear'
          },
          
          // annotations: [
          //   {
          //     x: time[0],
          //     y: 0.9,
          //     xref: 'x',
          //     yref: 'paper',
          //     text: 'largest movement',
          //     font: {color: 'magenta'},
          //     showarrow: true,
          //     xanchor: 'right',
          //     ax: -20,
          //     ay: 0
          //   }
          // ],
          
          shapes: [
              {
                  type: 'rect',
                  xref: 'x',
                  yref: 'paper',
                  x0: time[0],
                  y0: 0,
                  x1: time[1],
                  y1: 1,
                  fillcolor: '#d3d3d3',
                  opacity: 0.2,
                  line: {
                      width: 0
                  }
              }
            ]
        };

        Plotly.newPlot('result-panel-right', data, layout);
    }

    function currency(fromCurrency, toCurrency) {
      //var tocurrency = ["CNY", "INR", "SEK", "RUB", "JPY"];
      $.ajax({
        url: "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=" + fromCurrency + "&to_currency="+ toCurrency + "&apikey=" + alphaVanAPIkey,
        method: "GET"
      }).done(function(response) {
        var object = response["Realtime Currency Exchange Rate"];
        var fCurrency = object["1. From_Currency Code"];
        var tCurrency = object["3. To_Currency Code"];
        var exchangeRate = object["5. Exchange Rate"];
        exchangeRate = exchangeRate.split(".")[0];

        $("#tbodycurrency").append("<tr> <td>" + fCurrency + "</td><td> 1 : " + exchangeRate + "</td><td>" + tCurrency + "</td>");

      })

    }

    $(".dropdown-button").dropdown({
      inDuration: 1000,
      outDuration: 1000,
      constrainWidth: true,
      hover: false,
      belowOrigin: true,
    })

    $("#add-stock").on("click", function() {

        var ticker = $("#stock-input").val();
        console.log(database.ref().button);

        database.ref().push({
          button: ticker
        });
      

        $("#stock-input").val("");
    });

    database.ref().on("child_added", function(snapshot) {
      
      console.log(snapshot.val().button);

      var btnMaker = $("<button>")
      btnMaker.text(snapshot.val().button);
      btnMaker.addClass("btn");
      btnMaker.addClass("stock-button");
      btnMaker.attr("id", snapshot.val().button);
      
      $(".button-area").append(btnMaker);

    });

    $(".button-area").on("click", '.stock-button', function() {
      var ticker = $(this).attr("id");
      console.log(ticker) ;
      var QueryURL = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + ticker + "&apikey=" + alphaVanAPIkey;
 
      $.ajax({        
        url:"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + ticker + "&apikey=" + alphaVanAPIkey,
        method: "GET"       
      }).done(function(response) { 
        console.log(response);

        var seriesData = response["Time Series (Daily)"];
        var time = [];
        var open = [];
        var high = [];
        var low = [];
        var close = [];
        var volume = [];


        for (var index in seriesData) {

          var object = seriesData[index];


          time.push(index);
          open.push(object["1. open"]);
          high.push(object["2. high"]);
          low.push(object["3. low"]);
          close.push(object["4. close"]);
          volume.push(object["5. volume"]);
        }

        //chart functions
        dailyPrice(time, close);
        JapaneseCandle(time, open, high, low, close, volume);
        //Company pictures
        displayPictures(ticker);

      }).fail(function(error) {
        console.log(error);
      });

    });

});
