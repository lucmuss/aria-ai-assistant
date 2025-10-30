# Thunderbird Add-ons Store Submission Checklist

Complete checklist for submitting ARIA to the Thunderbird Add-ons store (addons.thunderbird.net).

## Pre-Submission Requirements

### ✅ Documentation
- [x] README.md created with comprehensive documentation
- [x] PRIVACY.md created explaining data handling
- [x] LICENSE file (MIT License)
- [x] CHANGELOG.md with version history
- [x] QUICKSTART.md for new users
- [x] Code comments and inline documentation

### ✅ Manifest.json
- [x] Version set to 1.0.0
- [x] Proper extension ID: `aria-ai-assistant@thunderbird.extension`
- [x] Description under 250 characters
- [x] Author field filled
- [x] Homepage URL (update with actual GitHub URL)
- [x] All required permissions listed
- [x] Icons in all sizes (16, 32, 48, 128)
- [x] Minimum Thunderbird version: 115.0

### ✅ Code Quality
- [x] No console errors in normal operation
- [x] Modular code structure
- [x] ES6 modules used properly
- [x] Error handling implemented
- [x] No hardcoded credentials
- [x] No unnecessary permissions requested

### ✅ Localization
- [x] 14 languages supported
- [x] All UI strings use i18n
- [x] Fallback to English implemented
- [x] Language files properly formatted

### ✅ Icons & Assets
- [x] Icons present in all required sizes (16, 32, 48, 128px)
- [x] Icons are professional quality
- [x] Consistent branding
- [x] No copyright violations

### ✅ Privacy & Security
- [x] No telemetry or tracking
- [x] No external data collection
- [x] API keys stored securely (local storage only)
- [x] Privacy policy documented
- [x] HTTPS used for API communications
- [x] User controls all data transmission

### ✅ Functionality Testing
- [x] Extension loads without errors
- [x] Settings page works correctly
- [x] API configuration and testing works
- [x] Email generation works
- [x] Voice input works (with proper API)
- [x] Multi-language support works
- [x] Import/Export settings works
- [x] Autoresponse works
- [x] Statistics display works

## Pre-Packaging Steps

### 1. Update URLs and Contact Information
Before packaging, update the following placeholders:

**In manifest.json:**
```json
"homepage_url": "https://github.com/YOUR_USERNAME/aria-thunderbird"
```

**In README.md:**
- Update GitHub repository URLs
- Add your email/contact information
- Update PayPal donation link if applicable

**In PRIVACY.md:**
- Update contact information
- Update GitHub repository URL

### 2. Remove Development Files
Before packaging, remove:
- [ ] `.git` directory
- [ ] `.gitignore` file
- [ ] `test.wav` (or keep for STT testing)
- [ ] Any development notes or TODO files
- [ ] Editor-specific files (.vscode, .idea, etc.)

### 3. Version Verification
- [ ] manifest.json version matches CHANGELOG.md
- [ ] All version references are consistent
- [ ] Date in CHANGELOG.md is correct

## Packaging the Extension

### Create the .xpi Package

**Option 1: Using zip (Recommended)**
```bash
cd ai-mail-assistant
zip -r -FS ../aria-ai-assistant-1.0.0.xpi * -x "*.git*" -x "*test.wav*"
```

**Option 2: Manual packaging**
1. Select all files EXCEPT .git directories
2. Right-click → Send to → Compressed (zipped) folder
3. Rename to `aria-ai-assistant-1.0.0.xpi`

### Verify Package Contents
Unzip and verify the package contains:
- [x] manifest.json
- [x] All .js files (background.js, popup.js, settings.js)
- [x] All .html files (popup.html, settings.html)
- [x] style.css
- [x] All icons/
- [x] All locales/
- [x] All modules/
- [x] README.md, PRIVACY.md, LICENSE, CHANGELOG.md, QUICKSTART.md

### Test the Package
1. [ ] Install the .xpi in Thunderbird
2. [ ] Verify all functionality works
3. [ ] Check for console errors
4. [ ] Test with fresh settings (no previous config)

## Thunderbird Add-ons Store Submission

### 1. Create Account
- [ ] Register at https://addons.thunderbird.net
- [ ] Verify email address
- [ ] Complete developer profile

### 2. Prepare Submission Materials

**Extension Information:**
- **Name**: ARIA - AI Assistant
- **Summary** (250 chars max):
  ```
  AI-powered email assistant: Generate intelligent responses, use voice input, support for OpenAI & local AI models. Multi-language support in 14 languages.
  ```

- **Description** (Use formatted text from README.md sections):
  - Features overview
  - How to use
  - Setup instructions
  - Privacy information

- **Version Notes** (from CHANGELOG.md):
  ```
  Initial release v1.0.0
  - AI-powered email generation
  - Voice input with transcription
  - 14 language support
  - OpenAI & local AI model support
  ```

**Categories:**
- [x] Productivity
- [x] Email Tools

**Tags/Keywords:**
- AI
- Email
- Assistant
- GPT
- OpenAI
- Ollama
- Voice Input
- Multi-language
- Productivity

**Screenshots** (Prepare 3-5 screenshots):
1. [ ] Main popup interface with example
2. [ ] Settings page overview
3. [ ] Generated email example
4. [ ] Statistics panel
5. [ ] Multi-language interface (optional)

**Privacy Policy:**
- [ ] Link to PRIVACY.md in GitHub repository
- [ ] Or paste full privacy policy text

**Homepage:**
- [ ] GitHub repository URL

**Support Email:**
- [ ] Your contact email

**Support URL:**
- [ ] GitHub Issues page URL

### 3. Upload Extension
1. [ ] Log in to addons.thunderbird.net
2. [ ] Click "Submit a New Add-on"
3. [ ] Upload the .xpi file
4. [ ] Wait for automatic validation
5. [ ] Fix any validation errors

### 4. Fill Out Listing Information
1. [ ] Add extension name and summary
2. [ ] Add detailed description
3. [ ] Upload screenshots
4. [ ] Select categories
5. [ ] Add tags
6. [ ] Set privacy policy
7. [ ] Add support URLs
8. [ ] Set license (MIT)

### 5. Submit for Review
1. [ ] Review all information
2. [ ] Add version notes
3. [ ] Submit for review
4. [ ] Wait for Mozilla review (can take days/weeks)

## Post-Submission

### Monitor Review
- [ ] Check email for review feedback
- [ ] Respond to reviewer questions promptly
- [ ] Make requested changes if needed

### After Approval
- [ ] Update GitHub repository with store link
- [ ] Announce on social media/blog
- [ ] Monitor user feedback and reviews
- [ ] Respond to user questions

### Ongoing Maintenance
- [ ] Monitor GitHub issues
- [ ] Plan feature updates
- [ ] Keep dependencies updated
- [ ] Release bug fixes promptly
- [ ] Update translations as needed

## Common Rejection Reasons to Avoid

❌ **Avoid These Issues:**
- Requesting unnecessary permissions
- Including telemetry without disclosure
- Using copyrighted assets
- Incomplete privacy policy
- Poor code quality or security issues
- Incomplete or misleading descriptions
- Broken functionality
- Missing required files

✅ **Ensure You Have:**
- Clear, accurate description
- Proper permission justification
- Working functionality
- Good code quality
- Complete documentation
- Valid privacy policy
- Professional presentation

## Store Listing Best Practices

### Description Writing
- Lead with main benefit
- Use bullet points for features
- Include clear setup instructions
- Mention privacy/security
- Add troubleshooting tips
- Keep it concise but informative

### Screenshot Guidelines
- Use actual extension interface
- Show key features
- Include captions/annotations
- Use consistent styling
- Show real usage scenarios
- Highlight unique features

### Version Updates
- Document all changes in CHANGELOG.md
- Bump version number appropriately
- Test thoroughly before submission
- Provide clear version notes
- Keep users informed of changes

## Final Checks Before Submission

- [ ] All URLs updated (no placeholders)
- [ ] Contact information added
- [ ] Version numbers consistent
- [ ] Package tested in clean environment
- [ ] Documentation complete
- [ ] Screenshots prepared
- [ ] Privacy policy finalized
- [ ] No debug code or console.logs in production
- [ ] All translations verified
- [ ] API test functionality works

## Ready to Submit? 🚀

When all checklist items are complete:
1. Create the final .xpi package
2. Test it one more time
3. Prepare all submission materials
4. Submit to addons.thunderbird.net
5. Wait patiently for review
6. Celebrate your launch! 🎉

---

**Good luck with your submission!**

For questions about the submission process, see:
- https://developer.thunderbird.net/add-ons/about-add-ons
- https://extensionworkshop.com/documentation/publish/
