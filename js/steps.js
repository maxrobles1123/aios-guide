/* AIOS install guide: content.
   KAREEM'S WORDS: every `text`, `note`, `caption`, `copy`, `button`, `shouldSee` and `stuck` string below is
   copied word for word from Kareem's guide (see ../original/original-content.md).
   OUR WORDS (proposed, for Kareem to accept or reject): every `see` string (the "what you should be seeing"
   helper), every `plain` string (the "In plain words" box: added help, not Kareem's) and every `reward` string. They are listed in the change document. */

window.AIOS_PARTS = [
  {
    id: 'p1',
    n: 1,
    title: 'Connect AIOS to Claude',
    shouldSee: 'A page that says “You’re not connected to AIOS yet.” with a Connect button.',
    shouldSeeMore: '',
    button: 'I see it. Go to part 2',
    backLabel: 'Back to the start',
    reward: 'AIOS is in Claude.',
    stuck: [
      ['I cannot find Customize or Connectors.', 'Look down the left side of Claude for <b>Customize</b>. Click it, then click <b>Connectors</b> at the top. Still not there? Update the Claude app and try again.'],
      ['Paste did not work.', 'Click <b>Copy</b> again. Click once in the URL box. Press Ctrl + V (Mac: Cmd + V).</p><p>Or type it. No spaces. It ends in /aios.'],
      ['I see an error after I click Continue.', 'Check the address letter by letter. It starts with <b>https</b>. No space at the end.'],
      ['I see Authentication or OAuth options.', 'Leave everything as it is. Click <b>Add</b>.']
    ],
    steps: [
      { text: 'Open the <b>Claude</b> app on your computer.',
        see: 'The Claude app is open on your computer. You see a box to type in, and a menu down the left side.' },
      { text: 'Go to the left side of the Claude app.',
        see: 'You are looking at the menu on the left side of Claude. It has words like New, Search, Projects and Customize.' },
      { text: 'Click <b>Customize</b>.',
        img: 'img/p1-s3-customize.jpg', alt: 'Claude’s left menu with Customize outlined', caption: 'Customize, on the left side of Claude',
        see: 'A page called Customize is open. Near the top you see Skills, Connectors and Plugins.' },
      { text: 'At the top, click <b>Connectors</b>.',
        img: 'img/p1-s4-connectors.jpg', alt: 'The Customize page with the Connectors tab outlined', caption: 'Connectors, at the top of the Customize page',
        see: 'The Connectors page is open. You see a list and a + Add button.' },
      { text: 'Click <b>+ Add</b>, then <b>Add custom connector</b>.',
        img: 'img/p1-s5-add-custom-connector.jpg', alt: 'The + Add menu with Add custom connector outlined', caption: 'Click + Add, then Add custom connector',
        see: 'A box called Add custom connector is open. It has a Name box and a URL box.' },
      { text: 'In the <b>Name</b> box, type <b>AIOS</b>.',
        see: 'The Name box says AIOS.' },
      { text: 'Copy this address. Paste it in the <b>URL</b> box.',
        copy: { label: 'The address', value: 'https://mcp.chiragshahcoaching.com/aios' },
        see: 'The URL box says https://mcp.chiragshahcoaching.com/aios and nothing else. No space before it or after it.' },
      { text: 'Click <b>Continue</b>.',
        img: 'img/p1-s8-continue.jpg', alt: 'The Add custom connector box filled in, with Continue outlined', caption: 'The box filled in. Then click Continue',
        see: 'The box changes. Now you see Authentication and OAuth client, with some choices already picked for you.' },
      { text: 'Don’t change anything. Click <b>Add</b>.',
        img: 'img/p1-s9-add.jpg', alt: 'The second Add custom connector screen with the Add button at the bottom', caption: 'Leave everything as it is. Click Add.', imgCollapsed: true,
        plain: 'This box shows technical settings, such as Authentication and OAuth. You do not need to understand them. It also warns you to use only connectors you trust. This one comes from Chirag Shah Coaching. Leave everything as it is and click <b>Add</b>.',
        see: 'The box closes. Then a page says “You’re not connected to AIOS yet.” and shows a Connect button.' }
    ]
  },
  {
    id: 'p2',
    n: 2,
    title: 'Verify your email',
    shouldSee: 'AIOS shows as connected in your Connectors list in Claude.',
    shouldSeeMore: '',
    button: 'AIOS is connected. Go to part 3',
    backLabel: 'Back to part 1',
    reward: 'AIOS is connected.',
    stuck: [
      ['The code email did not come.', 'Wait 2 minutes. Check Spam or Junk. In Gmail, also check Promotions and Updates.</p><p>Still nothing? Click <b>Send a new code</b>. Use the newest email.'],
      ['The code does not work.', 'Use the code from the newest email. Type all 6 digits. Codes last 10 minutes.'],
      ['It could not find AIOS access for my email.', 'Use the email you bought with. Your receipt or welcome email shows which one. Still stuck after two tries? Email us.'],
      ['It says “Too many tries”.', 'Stop. Wait the time the page shows. Then try once.']
    ],
    steps: [
      { text: 'Click <b>Connect</b>.', note: 'A sign-in page opens. It says Welcome.',
        img: 'img/p2-s1-connect.jpg', alt: 'The AIOS page that says You’re not connected to AIOS yet, with a Connect button', caption: 'Click Connect',
        plain: 'The sign-in page opens in your web browser (such as Chrome, Edge or Safari), not inside the Claude app.',
        see: 'A sign-in page opens in your web browser. It says Welcome and asks for your email.' },
      { text: 'Type the email you used to buy from Chirag Shah Coaching.',
        img: 'img/p2-s2-welcome.jpg', alt: 'The AIOS sign-in page with an Email box and a Send my code button', caption: 'The AIOS sign-in page. Type your email, then Send my code',
        see: 'Your email is in the Email box. Check the spelling before you go on.' },
      { text: 'Click <b>Send my code</b>.',
        see: 'The page now says Check your email. It has a box for a 6-digit code.' },
      { text: 'Open your email. Find <b>Your AIOS sign-in code</b>.', noteHtml: '<b>No email after 2 minutes?</b> Check Spam or Junk.',
        see: 'You have an email called Your AIOS sign-in code. It has 6 numbers in it.' },
      { text: 'Go back to the sign-in page. Type the 6-digit code.',
        img: 'img/p2-s5-check-email.jpg', alt: 'The Check your email page with a 6-digit code box and a Sign in button', caption: 'Type the 6-digit code, then click Sign in',
        noteAfter: 'The code goes on the sign-in page, not in Claude.',
        plain: 'The sign-in page is still open in your web browser. Switch back to it from your email.',
        see: 'The 6 numbers are in the code box on the sign-in page, in your web browser.' },
      { text: 'Click <b>Sign in</b>.',
        see: 'The sign-in page finishes. You may be sent back to Claude.' },
      { text: 'Go back to the Claude app. Check <b>Customize</b>, then <b>Connectors</b>.',
        img: 'img/p2-s7-connectors-list.jpg', alt: 'The connectors list with AIOS outlined and a check mark', caption: 'AIOS in your connectors list with a check mark',
        see: 'AIOS is in your Connectors list, with a check mark next to it.' }
    ]
  },
  {
    id: 'p3',
    n: 3,
    title: 'Start AIOS setup',
    shouldSee: 'AIOS says hello and names your four AI agents.',
    shouldSeeMore: 'First you’ll make a Project called <b>AIOS</b> in Claude. Your AIOS chats stay together there.',
    button: 'AIOS said hello. Go to part 4',
    backLabel: 'Back to part 2',
    reward: 'AIOS said hello.',
    headsUp: '<b>Heads-up:</b> during setup, a box will ask to use your AIOS folder. Click <b>Allow for this session</b>. No AIOS folder yet? AIOS makes one for you. You will click <b>Allow for this session</b> twice.',
    stuck: [
      ['I cannot find Projects.', 'Look in the list down the left side of Claude. If Settings is open, close it first.'],
      ['I already have a Project called AIOS.', 'Use that one. Do not make a second. Click <b>Projects</b>, then <b>AIOS</b>. Type <b>Set up AIOS</b> in its message box.'],
      ['I typed Set up AIOS outside the Project.', 'Click <b>Projects</b>, then <b>AIOS</b>. Type <b>Set up AIOS</b> again in the message box that says <b>New session in AIOS</b>.'],
      ['Claude answered, but AIOS did not say hello.', 'Click <b>Customize</b> on the left, then <b>Connectors</b>. If AIOS shows <b>Connect</b>, do part 2 again. Then type <b>Set up AIOS</b> once more.'],
      ['I clicked the wrong button on the permission box.', 'That is fine. Type <b>Set up AIOS</b> again. When the box comes back, click <b>Always allow</b>.']
    ],
    steps: [
      { text: 'Go back to the <b>Claude</b> app.',
        see: 'The Claude app is in front of you again.' },
      { text: 'Click <b>Projects</b> on the left side of Claude.',
        img: 'img/p3-s2-projects.jpg', alt: 'Claude’s left menu with Projects outlined', caption: 'Projects, on the left side of Claude',
        see: 'The Projects page is open. You see a New project button.' },
      { text: 'Click <b>New project</b>.',
        see: 'A box called Create a project is open.' },
      { text: 'Under <b>What are you working on?</b>, type <b>AIOS</b>.', noteHtml: 'Leave <b>What are you trying to achieve?</b> empty. You do not need it.',
        img: 'img/p3-s4-create-project.jpg', alt: 'The Create a project box with AIOS typed in the first box', caption: 'Type AIOS, then click Create project',
        see: 'The first box says AIOS. The box under it is empty.' },
      { text: 'Click <b>Create project</b>.', noteHtml: 'Your AIOS Project opens. Leave <b>Instructions</b> empty. AIOS does not need anything there.',
        see: 'Your AIOS Project is open. You see a message box that says New session in AIOS.' },
      { text: 'Click the message box that says <b>New session in AIOS</b>. Type this.',
        img: 'img/p3-s6-set-up-aios.jpg', alt: 'The AIOS Project message box with Set up AIOS typed in', caption: 'Type Set up AIOS in your AIOS Project’s message box',
        copy: { label: 'Say this to Claude', value: 'Set up AIOS' },
        see: 'The message box says Set up AIOS.' },
      { text: 'Press <b>Enter</b>.',
        see: 'Claude starts to answer. A box may pop up and ask to use AIOS.' },
      { text: 'If Claude asks to use AIOS, read the request. Then click <b>Always allow</b>.', note: 'Review each permission request before allowing access. Client sends, calendar changes and other consequential actions require separate approval.',
        plain: '“Always allow” means Claude will not ask again each time AIOS needs to run. “Consequential actions” means things that matter outside this chat, like sending to a client or changing your calendar. The note above says those still need your separate OK.',
        see: 'AIOS says hello and names your four AI agents.' }
    ]
  },
  {
    id: 'p4',
    n: 4,
    title: 'Complete your setup',
    intro: 'AIOS will ask you one question at a time. You’ll set up your local AIOS folder, connect your work email and calendar, confirm your preferences and review the commitments it finds. Then you’ll configure your three scheduled briefs.',
    listLabel: 'AIOS asks. You answer. Tick each one when it is done.',
    shouldSee: 'AIOS says “Setup is finished.”',
    shouldSeeMore: 'Need to stop before then? Come back later. Open your <b>AIOS</b> Project and type <b>finish my AIOS setup</b>. AIOS keeps what you already did.',
    button: 'Setup is finished. Next',
    backLabel: 'Back to part 3',
    reward: 'You’re set up.',
    extras: 'AIOS may offer a few extras at the end. You can skip them today.',
    stuck: [
      ['Claude shows a permission box.', 'Review each permission request before allowing access. Client sends, calendar changes and other consequential actions require separate approval.'],
      ['I do not see Schedule or Trusted folders.', 'You may be on the Claude website. Open the <b>Claude</b> app on your computer. Try again.'],
      ['AIOS says it cannot find my folder.', 'Open <b>Settings</b>, <b>Desktop app</b>, <b>Trusted folders</b>. Add your AIOS folder. Then type <b>continue</b>.'],
      ['It connected the wrong Gmail.', 'Type <b>reconnect my email</b>. Click <b>Connect</b>. Choose the right account.'],
      ['A brief says “Skipped”.', 'Your brief may already have run today. Check your saved brief and task status. If neither is available, visit <a href="#help">Get help</a>.']
    ],
    steps: [
      { title: 'Your first name.', text: 'Type the name you want AIOS to call you.',
        see: 'AIOS asks for your first name. After you answer, it uses your name.' },
      { title: 'Your AIOS folder.', text: 'Allow AIOS to use your AIOS folder. No folder yet? AIOS makes it. Your client records stay in this folder on your computer.',
        job: 'A', jobLink: 'AIOS asked me to make a folder. Show me how.',
        plain: 'When the box asks to use your AIOS folder, click <b>Allow for this session</b>. That is the button the heads-up at the end of part 3 named. <b>Trusted folders</b> (in Job A) is the list of folders on your computer that Claude is allowed to open.',
        see: 'A box asks to use a folder called AIOS, and you allow it. Or AIOS asks you to make the folder first.' },
      { title: 'Your work email and calendar.', text: 'Choose your work Gmail and Google Calendar when Google asks.',
        job: 'B', jobLink: 'AIOS asked me to connect my email. Show me how.',
        reward: 'Email and calendar connected.',
        see: 'A Google page asks you to pick an account. You pick your work Gmail and click Allow. Then you are back in Claude.' },
      { title: 'Compass question.', text: 'AIOS asks: “Do you use Compass or the Home Platform?” Type <b>Yes</b>, <b>No</b> or <b>Not sure</b>.',
        plain: 'The question is about the software your office gives you. If you do not know, <b>Not sure</b> is a fine answer.',
        see: 'AIOS asks you one question about the platform you use. You answer with one of the three words.' },
      { title: 'Your preferences.', text: 'AIOS shows your starting settings. Confirm or change them.',
        plain: 'If the settings look right, type <b>yes</b>. To change one, say what you want in your own words.',
        see: 'AIOS shows a short list of your starting settings. You say they are right, or you change them.' },
      { title: 'Your commitments.', text: 'AIOS asks you to review possible commitments before adding them to your Promise Tracker.',
        plain: 'The Promise Tracker is AIOS’s list of things you have promised people, like sending a client a report by Friday. Say which ones are right. If it finds none, that is fine.',
        see: 'AIOS shows things you may have promised people. You say which ones are right. If it finds none, that is fine.' },
      { title: 'Your three scheduled briefs.', text: 'Follow AIOS’s steps to create and activate your scheduled briefs. Check that each task is connected to your AIOS folder.',
        img: 'img/p4-s7-schedule.jpg', alt: 'A box that says Claude wants to create a scheduled task, with the AIOS folder outlined and a Schedule button', caption: 'AIOS shows each brief like this, with your AIOS folder already attached. Click Schedule',
        see: 'For each brief, a box says Claude wants to create a scheduled task. The Folders line shows your AIOS folder. You click Schedule. This happens three times.' }
    ]
  }
];

/* Job A and Job B: Kareem's words, word for word. */
window.AIOS_JOBS = {
  A: {
    title: 'Make your AIOS folder',
    lead: 'Do this only when AIOS asks you to make a folder.',
    tabs: {
      Windows: ['Open <b>File Explorer</b>.', 'Click <b>Documents</b> on the left.', 'Right-click an empty space. Click <b>New</b>, then <b>Folder</b>.', 'Type <b>AIOS</b>. Press <b>Enter</b>.'],
      Mac: ['Open <b>Finder</b>.', 'Click <b>Documents</b> on the left.', 'Click <b>File</b>, then <b>New Folder</b>.', 'Type <b>AIOS</b>. Press <b>Return</b>.']
    },
    thenLabel: 'Then let Claude use the folder',
    then: ['In the Claude app, open <b>Settings</b>.', 'Click <b>Desktop app</b>, then <b>Trusted folders</b>.', 'Add your <b>AIOS</b> folder. Only that folder.', 'Go back to your chat. Type <b>continue</b>.']
  },
  B: {
    title: 'Connect your email and calendar',
    lead: 'Do this when AIOS asks for your email and calendar.',
    steps: ['Type <b>connect my email</b>. Press <b>Enter</b>.', 'A box appears. Click <b>Connect</b>.', 'On the Google page, choose your work Gmail. Click <b>Allow</b>.', 'Go back to the <b>Claude</b> app.', 'If AIOS asks for your calendar, type <b>connect my calendar</b>. Do the same.']
  }
};

/* Before you start: Kareem's words. */
window.AIOS_BEFORE = {
  items: [
    ['A computer.', 'Windows or Mac. Not a phone or tablet.'],
    ['The Claude desktop app.', 'Claude is an app made by a company called Anthropic. AIOS works inside it.'],
    ['A Claude plan, Pro or higher.', 'You pay Anthropic for this, not Chirag Shah Coaching.'],
    ['Gmail and Google Calendar.', 'AIOS works with Gmail and Google Calendar.'],
    ['The email you used to buy from Chirag Shah Coaching.', 'You sign in to AIOS with it.']
  ],
  missing: [
    ['I do not have Claude yet.', '<ol class="mini"><li>Go to <a href="https://claude.ai/download" target="_blank" rel="noopener"><b>claude.ai/download</b></a>.</li><li>Click the download for <b>Windows</b> or <b>Mac</b>.</li><li>Open the file. Follow the steps on screen.</li><li>Open the <b>Claude</b> app. Sign in.</li><li>Choose a plan, <b>Pro</b> or higher.</li></ol>'],
    ['I am not sure which Claude plan I have.', '<ol class="mini"><li>In the Claude app, click <b>your name or picture</b>, bottom left.</li><li>Click <b>Settings</b>.</li><li>Look for your plan. It needs to say <b>Pro</b> or higher.</li></ol>'],
    ['I use Outlook.', '<p>Gmail and Google Calendar are currently supported. Outlook isn’t available for member setup yet.</p>'],
    ['I am not sure which email I bought with.', '<p>Find your receipt or welcome email from Chirag Shah Coaching. Use the email it was sent to.</p>']
  ]
};
