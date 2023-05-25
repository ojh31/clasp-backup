function handleMails(){
  var interval = 5; //  if the script runs every `interval` minutes
  console.log('handleMails');
  console.log('interval = %s', interval);
  var sender = 'noreply@mail.bloombergview.com';
  var date = new Date();
  var timeFrom = Math.floor(date.valueOf()/1000) - 60 * interval;
  var query = 'from:' + sender + ' after:' + timeFrom;
  var threads = GmailApp.search(query);
  for (var i = 0; i < threads.length; i++) {
    var msg = threads[i].getMessages()[0]; // only the 1st message
    var subject = msg.getSubject();
    var body = msg.getBody();
    var pasteUrl = pasteText(subject, body);
    pocketUrl(pasteUrl.replace('.com', '.com/raw'));
    maybeTrash(msg);
  }
}

function maybeTrash(msg){
  var subject = msg.getSubject();
  if (subject.includes('Money Stuff')){
      console.log('Trashing message subject = %s', subject);
      msg.moveToTrash();
    }
}

function pasteText(subject, text){
  console.log('pasteText');
  console.log('subject = %s', subject);
  console.log('text len = %s', text.length);
  text = text.replaceAll('&', 'n');
  console.log('text new len = %s', text.length);
  var scriptProperties = PropertiesService.getScriptProperties();
  var dev_key = scriptProperties.getProperty('pastebin_dev_key');
  var user_key = scriptProperties.getProperty('pastebin_user_key');
  var payload = (
    `api_option=paste&api_user_key=${user_key}&api_paste_private=2&api_paste_name=${subject}&` +
    `api_dev_key=${dev_key}&api_paste_code=${text}&api_paste_expiry_date=10M`
  );
  console.log('payload len = %s', payload.length);
  var options = {
        method: 'post',
        payload: payload,
    };
  var response = UrlFetchApp.fetch('https://pastebin.com/api/api_post.php', options);
  var responseText = response.getContentText();
  console.log('response code = %s', response.getResponseCode());
  console.log(responseText);
  return responseText;
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
  console.log('response code = %s', response.getResponseCode());
  console.log(JSON.parse(response.getContentText()));
  return response;
}
