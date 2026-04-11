# A-CAM Director Packs - Custom File Icon Setup

## 📦 Included Files

### Director Packs (.acam)
- `core-directors-moves.acam` - Essential signature shots from legendary directors
- `classic-hollywood.acam` - Golden Age Hollywood techniques  
- `action-thriller.acam` - High-octane blockbuster cinematography
- `indie-arthouse.acam` - Auteur and independent film aesthetics
- `gaming-vfx.acam` - Video game cinematics and VFX camera work

### Icon Files
- `acam-file.ico` - Custom A-CAM red triangle icon
- `register-acam-filetype.reg` - Windows registry file for file association

---

## 🎯 Installing the Custom .acam File Icon (Windows)

### Step 1: Create Icon Folder
1. Create a folder: `C:\Users\Public\A-CAM\`
2. Copy `acam-file.ico` into this folder

### Step 2: Register the File Type
1. Double-click `register-acam-filetype.reg`
2. Click "Yes" when prompted by User Account Control
3. Click "Yes" to confirm adding to registry

### Step 3: Refresh Icons
- **Restart Explorer** or **Log out/Log in** to see the new icons
- Alternatively, run this in Command Prompt (Admin):
  ```
  ie4uinit.exe -ClearIconCache
  ```

---

## 🔧 Custom Icon Path (Optional)

If you want to store the icon elsewhere, edit the .reg file before running:

1. Open `register-acam-filetype.reg` in Notepad
2. Find this line:
   ```
   @="C:\\Users\\Public\\A-CAM\\acam-file.ico,0"
   ```
3. Change the path to your preferred location (use double backslashes)
4. Save and double-click the .reg file

---

## 🎬 Using Director Packs in A-CAM

1. Open A-CAM in your browser
2. In the **Director's Moves** panel, click **↑ LOAD**
3. Select any `.acam` file
4. The presets will appear as custom moves (dashed border)

### Pack Format Reference
```json
{
  "packName": "Pack Name",
  "packVersion": "1.0",
  "packAuthor": "Author Name",
  "packDescription": "Description of the pack",
  "presets": [
    {
      "name": "Preset Name",
      "icon": "🎬",
      "description": "What this move does",
      "lens": "35mm Standard",
      "angle": "Eye Level",
      "movement": "Dolly Zoom",
      "movementIntensity": 70,
      "dof": "f/4.0 Balanced",
      "lighting": "Natural Ambient",
      "lightingIntensity": 70
    }
  ]
}
```

---

## ⚠️ Troubleshooting

**Icons not showing?**
- Make sure the .ico file path in the registry matches where you saved it
- Try clearing the icon cache (see Step 3 above)
- Restart your computer if icons still don't appear

**Registry file won't run?**
- Right-click → "Run as administrator"
- Make sure you click "Yes" on all prompts

---

Made with ▶ by IN-NO-V8
