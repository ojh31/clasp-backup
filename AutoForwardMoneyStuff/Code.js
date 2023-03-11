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

function pocketUrl(url){
  console.log('pocketUrl');
  console.log('url = %s', url);
  var scriptProperties = PropertiesService.getScriptProperties();
  var consumer_key = scriptProperties.getProperty('consumer_key');
  var access_token = scriptProperties.getProperty('access_token');
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
