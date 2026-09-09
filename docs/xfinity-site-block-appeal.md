# Xfinity website-block appeal for `explosion.fun`

Verified against first-party Xfinity/Comcast sources on September 8, 2026.

## Recommended path

1. Check the exact production URL in Xfinity's [Advanced Security Website Checker](https://spa.xfinity.com/help/advanced-security). Xfinity says Advanced Security (now also called **Xfinity CyberSecure**) blocks sites it determines may contain malware, spyware, ransomware, or viruses; its public explanation says it uses "a variety of established tools and techniques." It does not publish a rule saying that `.fun` domains are categorically blocked. Therefore, describe the `.fun` explanation as a suspected false-positive cause unless Xfinity supplied that reason directly.
2. Submit the official [Service Policy Assurance report form](https://spa.xfinity.com/report). Choose **“I can't reach a website that I want to go to.”** Xfinity's [blocked-website instructions](https://www.xfinity.com/support/articles/report-blocked-website) say to provide the full blocked URL, an email address, and any additional comments. The [SPA Advanced Security help page](https://spa.xfinity.com/help/advanced-security) additionally asks for the reporter's name and/or organization name.
3. Preserve both confirmation emails. Xfinity says it sends one when the report is received and another after review. It says requests are usually processed, or an update is usually shared, within **three business days** ([Xfinity Support](https://www.xfinity.com/support/articles/report-blocked-website); [SPA help](https://spa.xfinity.com/help/advanced-security)).
4. If no substantive response arrives after three business days, call **Customer Security Assurance at (888) 565-4329**, open **8:00 a.m.–12:00 a.m. Eastern, seven days a week**, and ask for follow-up on the existing SPA report. Those current hours and that number are published on Xfinity's [SPA contact page](https://spa.xfinity.com/contact-us). Have the confirmation email, submission date, domain, and all affected URLs ready.

Xfinity does not currently publish a dedicated email address or a formal second-level appeal route for Advanced Security false positives. The web form is the documented reassessment channel; Customer Security Assurance is the most relevant published human follow-up channel. Avoid sending this request to Comcast's privacy or general abuse mailboxes, which address different issues.

Because the apex URL redirects to `https://www.explosion.fun/`, test both URLs in Xfinity's checker. Put the exact URL shown in the warning into the first report. If the checker independently flags both hosts, file one report for each and cross-reference the two confirmation numbers rather than assuming an apex-domain report covers `www`.

## Evidence to prepare

The form explicitly requires only the full URL, identity/organization details, a reply email, and comments. The following is a recommended evidence package for the comments field and any phone follow-up; it is not an Xfinity-published checklist:

- Exact affected URLs, including both `https://explosion.fun/` and any affected subdomains or paths.
- The wording and a screenshot of Xfinity's warning, plus the date/time, browser, device, and whether it occurred on an Xfinity connection with Advanced Security/CyberSecure enabled.
- Confirmation that the same URL loads outside the Xfinity network, if reproducible.
- A concise statement of site ownership and purpose.
- Current HTTPS/TLS validity and the hosting/CDN provider.
- Results from reputable malware, phishing, and domain-reputation scanners, with scan dates and links rather than pasted bulk output.
- Any recent remediation: removed files, dependency updates, CMS/plugin updates, credential rotation, hosting changes, or security-header changes.
- A direct request to re-scan and remove the false-positive classification, plus a request for the specific signal behind the classification if Xfinity declines.

Before filing, verify the site and every redirect target are clean. Do not claim that the `.fun` suffix is definitively the reason unless Xfinity told us so; the strongest appeal is factual and reproducible.

## Copy for the SPA form

**Issue:** I can't reach a website that I want to go to  
**Full URL:** `https://explosion.fun/`  
**Organization:** explosion.fun / site owner

**Comments:**

> I own and operate `explosion.fun`, a personal publishing and project site. Xfinity Advanced Security/CyberSecure is classifying or blocking the site as unsafe, but we have not identified malware, phishing, deceptive behavior, or another security issue on the site. The site uses HTTPS and is reachable normally outside the affected Xfinity connection. Please re-scan the full URL and remove the false-positive block. If the classification cannot be removed, please identify the specific URL, resource, redirect, or security signal responsible so that I can remediate it. Evidence collected on [DATE]: [HTTPS/TLS RESULT], [MALWARE/REPUTATION SCAN LINKS], [SCREENSHOT OR EXACT WARNING], observed on [DEVICE/BROWSER] over an Xfinity connection with Advanced Security/CyberSecure enabled. Please reply to [EMAIL].

## Reply-to-confirmation email draft

Xfinity does not publish an inbox for initiating these requests. If the confirmation or decision email accepts replies, use this after three business days or after an unresolved decision:

**Subject:** Follow-up: false-positive website block for explosion.fun — [CONFIRMATION/CASE NUMBER]

> Hello Customer Security Assurance,
>
> I am following up on blocked-website reassessment [CONFIRMATION/CASE NUMBER], submitted on [DATE] for [EXACT BLOCKED URL]. I own and operate explosion.fun, a personal publishing and software-project site hosted on Vercel. The site uses valid HTTPS and contains no phishing flow, malware, or executable downloads. It remains reachable outside the affected Xfinity connection.
>
> Please re-scan the URL and remove the false-positive Advanced Security/CyberSecure classification. If Xfinity still considers it unsafe, please identify the exact URL, resource, redirect, or detection signal involved so I can investigate it. I have attached [WARNING SCREENSHOT] and included current independent scan results here: [LINKS].
>
> The apex URL redirects once to the canonical `https://www.explosion.fun/` host; please confirm that both hosts have been evaluated.
>
> Thank you,  
> Reuben Roy  
> Owner, explosion.fun  
> [REPLY EMAIL]

## Phone follow-up script

> I am following up on an Advanced Security/CyberSecure blocked-website reassessment submitted through `spa.xfinity.com/report`. The domain is `explosion.fun`; I submitted it on [DATE] and received confirmation at [EMAIL]. More than three business days have passed [or: the response did not resolve the false positive]. Could Customer Security Assurance locate or escalate the report and tell me the specific URL or signal causing the classification? I can provide current security-scan and TLS evidence.

Record the call date, agent name or ID, and any case number. If the agent cannot locate the submission, ask whether a new SPA submission should reference the earlier confirmation and case number; do not repeatedly submit duplicates without being asked.

## Source notes

- [Xfinity Support: Check or report a website blocked by Advanced Security](https://www.xfinity.com/support/articles/report-blocked-website) — official form workflow, required URL/email/comments, confirmation emails, and typical three-business-day update.
- [Xfinity Service Policy Assurance: Advanced Security help](https://spa.xfinity.com/help/advanced-security) — checker, blocking rationale, form selection, name/organization field, and processing target.
- [Xfinity Service Policy Assurance: Report an issue](https://spa.xfinity.com/report) — official submission endpoint.
- [Xfinity Service Policy Assurance: Contact us](https://spa.xfinity.com/contact-us) — Customer Security Assurance telephone number and current hours.
