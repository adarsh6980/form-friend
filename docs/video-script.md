# Video script (target 2:00, max 3:00)

0:00-0:15 HOOK (screen: photo of a scary Revenue letter)
"This is a real letter thousands of people in Ireland get. Now imagine
English isn't your first language. I built Form Friend - paste any official
Irish letter, get a plain-English explanation, your deadlines, and a drafted
reply."

0:15-0:50 DEMO (screen recording of the app)
- Paste sample IRP renewal letter, click Analyze
- Show results appearing: type, deadlines card, plain-English summary
- Show the drafted reply
- Show the Tavily current-rules card with live official links
- Show the cost readout: "this letter cost 0.4 cents"

0:50-1:30 HOW IT WORKS (architecture diagram from README)
"Four Nemotron 3 models chained on Nebius Token Factory. The cheap Nano model
classifies and extracts; the 550B Ultra model only runs when a letter is
actually complex. That tiering - straight from Nebius's own cookbook - is why
a letter costs a fraction of a cent instead of a dime."
Show the benchmark table from the eval harness.

1:30-2:00 CLOSE (face or app)
"I'm an immigrant in Ireland. I built this because I've been the person
staring at that envelope. Everything is open source, everything runs on
Nebius Token Factory. Form Friend - official letters, minus the panic."
