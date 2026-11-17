/* AIOS install guide: content (v3, 2026-11-17).
   SOURCE: Kareem's live install (aios.chiragshahcoaching.com/install-start.html and install.html, read 2026-11-17).
   His four parts, his words and his screenshots (img/k/). What we changed, for Kareem to accept or reject:
   - Screens are paired into complete actions. A screen never stops at "go to the left side": it says where to go AND
     what to click there ("On the left side of the Claude app, click Customize"). Short steps that are already a whole
     action ("Click Continue") stay on their own.
   - OUR WORDS: every `see` string (the "How you know it worked" helper) and every `plain` string (the "In plain words" box). */

window.AIOS_PARTS = [
  {
    id: 'p1',
    n: 1,
    title: 'Export your contacts',
    goal: 'save your contacts file in your Downloads folder. You do this in Compass CRM (your Home Platform), in your web browser.',
    shouldSee: 'A file that starts with all_contacts is in your Downloads folder.',
    shouldSeeMore: 'During setup, AIOS asks for this file. Attach it in the chat and type <b>import my contacts</b>.',
    button: 'I have the file. Go to Part 2',
    backLabel: 'Back to Before you start',
    reward: 'Contacts file saved.',
    stuck: [
      ['I do not have a contacts file.', 'Go to Part 2. During setup, type <b>walk me through exporting</b>. AIOS shows you how.'],
      ['Export is not working.', 'Stay on the Compass page until the <b>Ongoing actions</b> box shows <b>Download</b>. Still nothing? <a href="#help">Get help</a>.']
    ],
    steps: [
      { text: 'In your web browser, open <b>Compass CRM</b> and sign in. Click <b>Contacts</b> on the left, then <b>All Contacts</b>.',
        see: 'Compass CRM is open on All Contacts. You see your list of contacts.' },
      { text: 'At the top right, click <b>Actions</b>. Then click <b>Export</b>.',
        img: 'img/k/compass-1-actions-export.jpg', alt: 'Compass CRM, All Contacts, with the Actions menu open and Export in the list', caption: 'Actions, then Export, at the top right of All Contacts',
        see: 'A box called Export contacts is open.' },
      { text: 'Keep <b>All contacts data</b> selected. Turn on <b>Include notes added to each contact</b>. Click the blue <b>Export</b> button.',
        img: 'img/k/compass-2-export-box.jpg', alt: 'The Export contacts box with All contacts data selected, Include notes turned on and the blue Export button', caption: 'All contacts data, notes on, then the blue Export button',
        see: 'Compass says it is exporting your contacts.' },
      { text: 'Stay on the page. When the <b>Ongoing actions</b> box at the bottom left shows <b>Download</b>, click <b>Download</b>.',
        img: 'img/k/compass-3-download.jpg', alt: 'Compass CRM saying it is exporting your contacts, with the Download link in the Ongoing actions box at the bottom left', caption: 'The Download link, in the Ongoing actions box at the bottom left',
        plain: 'The file name starts with <b>all_contacts</b>. It goes to your Downloads folder. Leave it there.',
        see: 'A file that starts with all_contacts is in your Downloads folder.' }
    ]
  },
  {
    id: 'p2',
    n: 2,
    title: 'Connect AIOS to Claude',
    goal: 'add AIOS to Claude. You do this in the Claude app.',
    shouldSee: 'A page that says “You’re not connected to AIOS yet.” It has a Connect button.',
    shouldSeeMore: '',
    button: 'I see it. Go to Part 3',
    backLabel: 'Back to Part 1',
    reward: 'AIOS is in Claude.',
    stuck: [
      ['I cannot find Customize or Connectors.', 'Look for <b>Customize</b> on the left side of Claude. Click it. Click <b>Connectors</b> at the top. If it is not there, update the Claude app. Then try again.'],
      ['Paste did not work.', 'Click <b>Copy</b> again. Click one time in the URL box. Press Ctrl + V (Mac: Cmd + V).</p><p>Or type the URL yourself. Do not add spaces. It ends in /aios.'],
      ['I see an error after I click Continue.', 'Check the URL letter by letter. It starts with <b>https</b>. Remove any space at the end.']
    ],
    steps: [
      { text: 'Open the <b>Claude</b> app. On the left side, click <b>Customize</b>.',
        noteHtml: 'Window narrow or split? The left side can look different. Make the window wider, or click the menu button at the top left. Then click <b>Customize</b>.',
        img: 'img/k/p1-customize.png', alt: 'The left side of Claude with Customize marked', caption: 'Customize, on the left side of Claude',
        see: 'A page called Customize is open. Near the top you see Skills, Connectors and Plugins.' },
      { text: 'At the top, click <b>Connectors</b>. Stay on <b>Yours</b>.', note: 'Do not click Discover.',
        img: 'img/k/p1-connectors-tab.png', alt: 'The Customize page with Connectors marked', caption: 'Connectors, at the top of the Customize page',
        see: 'The Connectors page is open on Yours. You see a + Add button.' },
      { text: 'Click <b>+ Add</b>, then <b>Add custom connector</b>.',
        img: 'img/k/p1-add-menu.png', alt: 'The + Add button open, showing Add custom connector', caption: 'Click + Add, then Add custom connector',
        see: 'A box called Add custom connector is open. It has a Name box and a URL box.' },
      { text: 'In the <b>Name</b> box, type <b>AIOS</b>.',
        see: 'The Name box says AIOS.' },
      { text: 'Copy this URL. Paste it in the <b>URL</b> box.',
        copy: { label: 'The URL', value: 'https://mcp.chiragshahcoaching.com/aios' },
        see: 'The URL box says https://mcp.chiragshahcoaching.com/aios and nothing else. No space before it or after it.' },
      { text: 'Click <b>Continue</b>.',
        img: 'img/k/p1-connector-form.png', alt: 'The Add custom connector box with AIOS and the address filled in', caption: 'The box filled in. Then click Continue',
        see: 'The box changes. Now you see Authentication and OAuth client, with some choices already picked for you.' },
      { text: 'Don’t change anything. Click <b>Add</b>.',
        img: 'img/k/p1-add-confirm.png', alt: 'The Add custom connector box with Authentication and OAuth client options, and the Add button bottom right', caption: 'Leave everything as it is. Click Add, bottom right', imgCollapsed: true,
        plain: 'This adds AIOS to Claude. AIOS gives Claude CSC’s real-estate workflow guides and checks you are a member. Your emails and client records stay in Claude and on your computer. CSC’s server checks draft wording and doesn’t keep your drafts or client records.',
        see: 'The box closes. Then a page says “You’re not connected to AIOS yet.” and shows a Connect button.' }
    ]
  },
  {
    id: 'p3',
    n: 3,
    title: 'Sign in to AIOS',
    goal: 'sign in to AIOS, so it knows you are a member. You use three places: the Claude app, your web browser and your email. Each step tells you when the place changes.',
    shouldSee: 'The AIOS page in the Claude app. Disconnect is at the top. Tool permissions is below.',
    shouldSeeMore: '',
    button: 'AIOS is connected. Go to Part 4',
    backLabel: 'Back to Part 2',
    reward: 'AIOS is connected.',
    stuck: [
      ['The code email did not come.', 'Wait 2 minutes. Check Spam or Junk. In Gmail, also check Promotions and Updates.</p><p>Still nothing? Click <b>Send a new code</b>. Use the newest email.'],
      ['The code does not work.', 'Use the code from the newest email. Type all 6 digits. Codes expire after 10 minutes.'],
      ['It could not find AIOS access for my email.', 'Use the email you bought with. Your receipt or welcome email shows which one. Cannot find it? Email your Coaching Success Manager.'],
      ['The page says “Too many tries”.', 'Stop. Wait for the time the page shows. Then try one time.'],
      ['The Claude app did not open.', 'Click <b>Open desktop app</b> on the Connected page. Or open the Claude app yourself. Click <b>Customize</b>, <b>Connectors</b>, then <b>AIOS</b>.']
    ],
    steps: [
      { place: 'In the Claude app', text: 'Click <b>Connect</b>. Your web browser opens.',
        noteHtml: 'If Claude asks <b>Finish connecting a connector?</b>, click <b>Continue connecting</b>.',
        img: 'img/k/p2-connect.png', alt: 'The page that says You’re not connected to AIOS yet, with a Connect button', caption: 'Click Connect',
        see: 'A sign-in page opens in your web browser. It says Welcome and asks for your email.' },
      { place: 'In your web browser', text: 'Type your <b>purchase email</b>. Click <b>Send my code</b>.',
        noteHtml: 'That is the email you used to buy from Chirag Shah Coaching. It can be different from your Claude email.',
        img: 'img/k/p2-signin-email.png', alt: 'The AIOS sign-in page that says Welcome', caption: 'Type your purchase email, then Send my code',
        see: 'The page now says Check your email. It has a box for a 6-digit code.' },
      { place: 'In your email', text: 'Open the email called <b>Your AIOS sign-in code</b>.',
        noteHtml: '<b>No email after 2 minutes?</b> Check Inbox, Updates and Spam. If the sign-in page said “We couldn’t find AIOS access for that email”, no code was sent: use the email you bought with.',
        see: 'You have an email called Your AIOS sign-in code. It has 6 numbers in it.' },
      { place: 'In your web browser', text: 'Go back to the AIOS page. Type the 6-digit code. Click <b>Sign in</b>.',
        noteHtml: 'If your browser asks <b>Open Claude?</b>, click <b>Open Claude</b>. The page says Connected. You can close that tab.',
        img: 'img/k/p2-signin-code.png', alt: 'The AIOS page that says Check your email, with the code box', caption: 'Type the 6-digit code, then click Sign in',
        see: 'The page says Connected. You are back in the Claude app.' },
      { place: 'In the Claude app', text: 'The tools say <b>Needs approval</b>. Leave them as they are.',
        img: 'img/k/p2-aios-page-after-signin.png', alt: 'The AIOS page in Claude: Disconnect at the top right, then Tool permissions, Read-only tools 5, set to Needs approval', caption: 'Disconnect at the top right, Tool permissions below',
        see: 'You see the AIOS page in Claude. Disconnect is at the top. Tool permissions is below.' }
    ]
  },
  {
    id: 'p4',
    n: 4,
    title: 'Start AIOS setup',
    goal: 'start AIOS setup. Then AIOS guides you in the chat. You make two things: a Project called AIOS in Claude, where you chat with AIOS, and a folder called AIOS on your computer, where AIOS saves your records.',
    headsUp: '<b>Used the old AIOS?</b> Rename your old Project to <b>AIOS (old)</b> first. Renaming deletes nothing.',
    shouldSee: 'AIOS says hello. It names your four agents.',
    shouldSeeMore: '',
    button: 'AIOS said hello. Next',
    backLabel: 'Back to Part 3',
    reward: 'AIOS said hello.',
    stuck: [
      ['I cannot find Projects.', 'Look in the list down the left side of Claude. If Settings is open, close it first.'],
      ['I already have a Project called AIOS.', 'If you made it today in this install, use it. Do not make a second one. If it is your old Project from July, rename it <b>AIOS (old)</b>. Then make a new Project called <b>AIOS</b>.'],
      ['The folder window does not show my AIOS folder.', 'Open <b>Documents</b> in that window. Your AIOS folder is inside it. If it is not there, make the folder first.'],
      ['I typed Set up AIOS outside the Project.', 'Click <b>AIOS</b> in the left sidebar. If you do not see it, click <b>Projects</b>, then <b>AIOS</b>. Type <b>Set up AIOS</b> again.'],
      ['Claude answered, but AIOS did not say hello.', 'Check you typed it inside your AIOS Project. Or begin with <b>Use AIOS to</b>, like <b>Use AIOS to set up AIOS</b>. Still no hello? Click <b>Customize</b>, then <b>Connectors</b>. If AIOS shows <b>Connect</b>, do Part 3 again.'],
      ['Claude keeps asking to use AIOS.', 'You are in Manual mode. Click <b>Always allow</b> when it asks. Or switch to Auto mode.']
    ],
    steps: [
      { group: 'A. Make your AIOS Project', text: 'Click <b>Projects</b> on the left side of Claude. Then click <b>New project</b>.',
        img: 'img/k/p3-projects.png', alt: 'The left side of Claude with Projects marked', caption: 'Projects, on the left side of Claude',
        see: 'A box called Create a project is open.' },
      { group: 'A. Make your AIOS Project', text: 'Under <b>What are you working on?</b>, type <b>AIOS</b>. Click <b>Create project</b>.',
        noteHtml: 'Leave <b>What are you trying to achieve?</b> empty.',
        img: 'img/k/p3-create-project.png', alt: 'The Create a project box with AIOS typed in', caption: 'Type AIOS, then click Create project',
        see: 'Your AIOS Project opens.' },
      { group: 'A. Make your AIOS Project', text: 'Next to <b>Instructions</b>, click <b>Add</b>. Paste these words. Click <b>Save instructions</b>.',
        copy: { label: 'Words to paste', value: 'Use AIOS for every request in this Project.' },
        img: 'img/k/folder-project-instructions-2-filled.png', alt: 'The Set project instructions box with the words pasted and the Save instructions button', caption: 'The words pasted. Then Save instructions',
        plain: 'This makes sure Claude uses AIOS when you ask for something in this Project.',
        see: 'The Instructions row in your AIOS Project shows the words you pasted.' },
      { group: 'B. Make your AIOS folder', text: 'Make a folder called <b>AIOS</b> in your <b>Documents</b> folder.',
        os: {
          Windows: { steps: ['Open <b>File Explorer</b>. Click <b>Documents</b> on the left.', 'Right-click the empty space to the right of the folders. Click <b>New</b>, then <b>Folder</b>.', 'Type <b>AIOS</b>. Press <b>Enter</b>.'],
            img: 'img/k/folder-win-4-aios-folder-made.png', alt: 'The Documents folder with the new AIOS folder' },
          Mac: { steps: ['Open <b>Finder</b>. Click <b>Documents</b> on the left.', 'Click <b>File</b>, then <b>New Folder</b>.', 'Type <b>AIOS</b>. Press <b>Return</b>.'],
            img: 'img/k/folder-mac-2-aios-folder.png', alt: 'The Documents folder in Finder with the AIOS folder' }
        },
        plain: 'AIOS saves your records in this folder, on your computer. Next you link it to your AIOS Project.',
        see: 'You see a folder called AIOS inside Documents.' },
      { group: 'B. Make your AIOS folder', text: 'Go back to your AIOS Project in Claude. Find <b>Context</b> on the right. Click <b>Add</b>, then <b>Link local folder</b>.',
        see: 'A window opens so you can pick a folder on your computer.' },
      { group: 'B. Make your AIOS folder', text: 'Click <b>Documents</b>, then <b>AIOS</b>. Click <b>Select Folder</b> (Mac: <b>Open</b>). When Claude asks, click <b>Always allow</b>.',
        os: {
          Windows: { img: 'img/k/folder-win-6-allow.png', alt: 'The Allow box in Claude, with the Always allow button' },
          Mac: { img: 'img/k/folder-mac-4-allow.png', alt: 'The Allow box in Claude, with the Always allow button' }
        },
        noteHtml: 'The box asks: <b>Allow Claude to change files in “AIOS”?</b> Always allow means it doesn’t ask again.',
        see: 'Context in your AIOS Project says 1 linked folder.' },
      { group: 'C. Start setup', text: 'At the bottom right of the message box, click <b>Manual</b>. Choose <b>Auto</b>.',
        noteHtml: 'Already see <b>Auto</b>? Go to the next step. When Claude asks to use AIOS, click <b>Always allow</b>.',
        plain: 'In Manual mode, Claude asks before it uses each AIOS tool. In Auto mode, Claude does not ask each time. Claude still blocks actions it flags as risky.',
        see: 'The button at the bottom right of the message box says Auto.' },
      { group: 'C. Start setup', text: 'Click the message box in your AIOS Project. Paste these words. Click the send arrow, bottom right.',
        copy: { label: 'Words to paste', value: 'Set up AIOS' },
        img: 'img/k/p3-project-message-box.png', alt: 'The AIOS Project’s message box with Set up AIOS typed in', caption: 'Set up AIOS in your AIOS Project’s message box',
        noteHtml: 'If Claude asks <b>Allow Claude to access this folder?</b>, tick <b>Don’t ask again for this folder on this device</b>, then click <b>Allow</b>.',
        upgrade: '<b>Set up the old AIOS or Prospecting OS in July?</b> Type <b>Upgrade my AIOS</b> instead. Your plan, voice, contacts, deals and promises come with you. Nothing is deleted.',
        see: 'AIOS says hello and names your four agents.' }
    ]
  }
];

/* After Part 4: Kareem's "AIOS takes it from here", word for word. */
window.AIOS_AFTER = [
  ['Finish setup in the chat', 'AIOS takes it from here in Claude, about 20 to 30 minutes. AIOS asks you questions in your AIOS Project, one at a time. Need to stop? Open your AIOS Project later and type <b>finish my AIOS setup</b>. AIOS keeps your progress.'],
  ['Your Morning Brief', 'It arrives by email each morning. Open <b>Schedule</b> in Claude. Each AIOS task (Morning Brief, Sunday Planner, End of Day) may show a yellow triangle. Click each one, then click <b>Allow</b>. Keep your computer on and awake, with the Claude app open, so your brief can run.']
];

/* Before you start: Kareem's words. */
window.AIOS_BEFORE = {
  items: [
    ['A Windows or Mac computer.', 'Not a phone or tablet.'],
    ['The Claude app.', 'AIOS runs in the Claude app, not on the Claude website.'],
    ['A Claude plan, Pro or higher.', 'You pay Anthropic for this, not Chirag Shah Coaching.'],
    ['Gmail or Outlook, and its calendar.', 'AIOS asks you to connect them after Part 4.'],
    ['Your purchase email.', 'The email you bought with. You sign in to AIOS with it.']
  ],
  missing: [
    ['I do not have Claude yet.', '<ol class="mini"><li>Go to <a href="https://claude.ai/download" target="_blank" rel="noopener"><b>claude.ai/download</b></a>.</li><li>Click the download for <b>Windows</b> or <b>Mac</b>.</li><li>Open the file. Follow the steps on screen.</li><li>Open the <b>Claude</b> app. Sign in.</li><li>Choose the <b>Pro</b> plan or a higher plan.</li></ol>'],
    ['I am not sure which Claude plan I have.', '<ol class="mini"><li>In the Claude app, click <b>your name or picture</b> at the bottom left.</li><li>Click <b>Settings</b>.</li><li>Look for your plan. It must say <b>Pro</b> or higher.</li></ol>'],
    ['I use Outlook.', '<p>AIOS works with Gmail or Outlook. When AIOS asks, type <b>connect Outlook</b>. With an Outlook work or school account, your company’s IT admin may have to allow it first.</p>'],
    ['I am not sure which email I bought with.', '<p>Find your receipt or welcome email from Chirag Shah Coaching. Use the email it was sent to. Cannot find it? Email your Coaching Success Manager.</p>']
  ]
};
