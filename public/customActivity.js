// You need to include Postmonger.js here. Download from Salesforce official repo or CDN.
let connection = new window.Postmonger.Session();
let payload = {};

connection.on('initActivity', (data) => {
  if (data) payload = data;
});

document.getElementById('next').addEventListener('click', function() {
  // Set inArguments here if needed for configuration UI
  connection.trigger('updateActivity', payload);
});
