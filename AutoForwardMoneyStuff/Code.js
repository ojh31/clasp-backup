// THIS IS A TEST TO CHECK GITHUB ACTION

function handleMails(){
  var interval = 5; //  if the script runs every 5 minutes; change otherwise
  console.log('handleMails');
  autoForward(interval);
  autoPocket(interval);
}

function autoForward(interval) {
  console.log('autoForward');
  console.log('interval = %s', interval);
  var sender = 'noreply@mail.bloombergview.com';
  var recipient = 'page@publishthis.email';        
  var date = new Date();
  var timeFrom = Math.floor(date.valueOf()/1000) - 60 * interval;
  var threads = GmailApp.search('from:' + sender + ' after:' + timeFrom);
  for (var i = 0; i < threads.length; i++) {
    var msg = threads[i].getMessages()[0]; // only the 1st message
    msg.forward(recipient);  
    if (msg.getSubject().includes('Money Stuff')){
      console.log('Trashing message subject = %s', msg.getSubject());
      msg.moveToTrash();
    }
    
  }
}

function autoPocket(interval) {
  console.log('autoPocket');
  console.log('interval = %s', interval);
  var sender = 'noreply@publishthis.email';
  var prefix = 'https://www.publishthis.email/fwd-money-stuff-';
  var date = new Date();
  var timeFrom = Math.floor(date.valueOf()/1000) - 60 * interval;
  var query = 'from:' + sender + ' after:' + timeFrom;
  var threads = GmailApp.search(query);
  console.log('date = %s', date.valueOf());
  console.log(query);
  for (var i = 0; i < threads.length; i++) {
    var msg = threads[i].getMessages()[0]; // only the 1st message
    var body = msg.getBody();
    console.log('Pocket body = %s', body);
    var regExp = RegExp(prefix + '([^"]*)');
    var match = regExp.exec(body)[0];
    console.log('Pocket url match = %s', match);
    var response = pocketUrl(match);
    if (response.getResponseCode() == 200){
      msg.moveToTrash();
    }
  }
}

// BASH COMMANDS TO GET CONSUMER KEY AND ACCESS TOKEN

// curl https://getpocket.com/v3/oauth/request --insecure -X POST -H "Content-Type: application/json" -H "X-Accept: application/json" -d "{\"consumer_key\":\"105369-83171a3bc7f6692009130c7\",\"redirect_uri\":\"http://www.google.com\"}"

// {"code":"724eec1b-78c3-5dcb-c3c4-1b7054","state":null}

// https://getpocket.com/auth/authorize?request_token=724eec1b-78c3-5dcb-c3c4-1b7054&redirect_uri=http://www.google.com

// curl https://getpocket.com/v3/oauth/authorize --insecure -X POST -H "Content-Type: application/json" -H "X-Accept: application/json" -d "{\"consumer_key\":\"105369-83171a3bc7f6692009130c7\",\"code\":\"724eec1b-78c3-5dcb-c3c4-1b7054\"}"

// {"access_token":"097cefee-8355-7a9a-7f63-299f3c","username":"oskar.hollinsworth@gmail.com"}

// curl https://getpocket.com/v3/add --insecure -X POST -H "Content-Type: application/json" -H "X-Accept: application/json" -d "{\"consumer_key\":\"105369-83171a3bc7f6692009130c7\",\"access_token\":\"097cefee-8355-7a9a-7f63-299f3c\", \"url\": \"https://www.publishthis.email/fwd-money-stuff-jpmorgan-says-frank-was-fraud-rJZCKR69i\"}"

// END OF BASH COMMANDS

function pocketUrl(url){
  // var url = 'https://www.publishthis.email/fwd-money-stuff-jpmorgan-says-frank-was-fraud-rJZCKR69i';
  console.log('pocketUrl');
  console.log('url = %s', url);
  var consumer_key = "105369-83171a3bc7f6692009130c7";
  var access_token = "097cefee-8355-7a9a-7f63-299f3c";
  var payload = { 
    "url": url,
    "consumer_key": consumer_key,
    "access_token": access_token,
  };
  console.log('payload = %s', JSON.stringify(payload));
  var options = {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true,
    };

  var response = UrlFetchApp.fetch('https://getpocket.com/v3/add.php', options);
  console.log('response code = %s', response.getResponseCode())
  console.log(JSON.parse(response.getContentText()));
  return response
}
