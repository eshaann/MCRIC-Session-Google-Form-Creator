const maxUniqueResponses = 25;
const adminEmails = ["nair.eshaan@gmail.com"
  /*, "shankhin@umich.edu", "bsaketh@umich.edu"*/];

function createWeeklyForm() {
  let today = new Date();
  let sessionDate = new Date();
  sessionDate.setDate(today.getDate() + 3);

  let formattedSessionDate = sessionDate.getFullYear() + '-' + 
                      (sessionDate.getMonth() + 1) + '-' + 
                      sessionDate.getDate();
  let time = "4-6 pm";
  var form = FormApp.create('MCRIC Attendance Sheet ' + formattedSessionDate + ', ' + time).setDescription('Indoor Session at 721 S 5th Ave');
  
  //fields
  form.addTextItem()
      .setTitle('Full Name')
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('U-M Affiliation')
      .setChoiceValues(['UM Undergraduate/graduate/professional student', 'UM Faculty/Staff', 'UM Alumni/Guest member/Non UM affiliate'
      ])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('What position do you play? (so that its easier to make teams)')
      .setChoiceValues(['Batsman', 'Fast Bowler', 'Spin Bowler'
      ])
      .showOtherOption(true)
      .setRequired(true);

  form.addMultipleChoiceItem().setTitle('Will you be attending the above 2 hour session?  (Please remember to carry your Mcard or ID)').setChoiceValues(['Yes, see you there! :D', 'No, can\'t make it :('])
  .setRequired(true);

  //other
  let formId = form.getId();
  PropertiesService.getScriptProperties().setProperty('FORM_ID', formId);
  Logger.log('Form created with URL: ' + form.getEditUrl());
  Logger.log('Form ID: ' + formId);
  
  //share form with admins

  for(let i = 0; i<adminEmails.length; i++){
    shareFormWithAdmin(formId, adminEmails[i]);
  }

  //share form with members
  for(let i = 0; i<adminEmails.length; i++){
    sendEmailWithFormLink(adminEmails[i], form.getPublishedUrl());
  }

}

function shareFormWithAdmin(formId, email) {
  let file = DriveApp.getFileById(formId);
  file.addEditor(email);
  Logger.log('Form shared with ' + email + ' as an editor.');
}

function sendEmailWithFormLink(email, formUrl) {
  var subject = "New MCRIC Session Form Created";
  var body = "A new form has been created. Please fill it out using the following link:\n\n" + formUrl;

  MailApp.sendEmail(email, subject, body);
  Logger.log('Email sent to ' + email + ' with the form link.');
}


//This part doesn't work yet idk how to set trigger onFormSubmit
function checkNumResponses(e) {
  let formId = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!formId) {
    Logger.log('Form ID not found.');
    return;
  }

  let form = FormApp.openById(formId);
  Logger.log(Object.keys(e));
  let responses = form.getResponses();
  let names = new Set();

  for (let i = 0; i < responses.length; i++) {
    let itemResponses = responses[i].getItemResponses();
    
    let name = itemResponses[0].getResponse();
    names.add(name);
  }

  if (names.size >= maxUniqueResponses) {
    form.setAcceptingResponses(false);
    Logger.log('Form closed after reaching ' + maxUniqueResponses + ' unique names.');
  }
}

