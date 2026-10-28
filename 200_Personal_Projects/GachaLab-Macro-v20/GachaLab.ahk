#Requires AutoHotkey v2.0
#SingleInstance Force
; Keep GachaLab.js beside this file. No extension or coordinate calibration needed.
; F8: start/pause. F9: stop. All controls are detected automatically.
; The small panel on the game page can also pause/close the browser helper.
SetWorkingDir A_ScriptDir
if A_Args.Length && A_Args[1] = "--check"
    ExitApp 0
SetKeyDelay -1, -1
SendMode "Input"
CoordMode "Pixel", "Screen"
CoordMode "Mouse", "Screen"
global NativeTapBlocked := false
SetTimer NativeTapTick, 16

F8::RunOnGame("toggle")
F9::RunOnGame("stop")

RunOnGame(action) {
    global NativeTapBlocked
    static busy := false
    if busy
        return
    busy := true
    NativeTapBlocked := true
    savedClipboard := ClipboardAll()
    try {
        hwnd := WinExist("A")
        process := WinGetProcessName("ahk_id " hwnd)
        title := WinGetTitle("ahk_id " hwnd)
        if !((process = "chrome.exe" || process = "msedge.exe") && InStr(title, "Gacha")) {
            Notice("Select the Gacha! game tab in Chrome or Edge first.")
            return
        }
        helper := A_ScriptDir "\GachaLab.js"
        if !FileExist(helper) {
            MsgBox "Keep GachaLab.js in the same folder as GachaLab.ahk.", "Gacha Lab macro"
            return
        }
        ; Verify the actual address before executing anything in the tab.
        A_Clipboard := ""
        Send "^l"
        Sleep 70
        if !WinActive("ahk_id " hwnd)
            return
        Send "^c"
        if !ClipWait(1) {
            Send "{Esc}"
            Notice("Could not read the game address. Try again.")
            return
        }
        url := Trim(A_Clipboard)
        if !RegExMatch(url, "i)^https?://gacha\.[a-z0-9.-]+(?::\d+)?(?:/|$)") {
            Send "{Esc}"
            Notice("This hotkey only runs on a gacha.* game address.")
            return
        }
        if action = "stop"
            js := "void(window.__gachaLabMacro && window.__gachaLabMacro.stop());"
        else {
            ; This source uses block comments so line flattening is safe.
            js := RegExReplace(FileRead(helper, "UTF-8"), "\R", " ")
            js .= ";void(window.__gachaLabMacro." action "());"
        }
        A_Clipboard := js
        if !ClipWait(1)
            return
        if !WinActive("ahk_id " hwnd)
            return
        Send "^a"
        ; Type the scheme separately: Chrome removes javascript: from pasted URLs.
        SendText "javascript:"
        Send "^v"
        Sleep 150
        if !WinActive("ahk_id " hwnd)
            return
        Send "{Enter}"
        Sleep 180
    } catch as err {
        MsgBox err.Message, "Gacha Lab macro"
    } finally {
        A_Clipboard := savedClipboard
        busy := false
        NativeTapBlocked := false
    }
}

; The page only displays this four-pixel signature at an unobstructed Tap!
; control while tapping is enabled. This generates ordinary physical input.
; The human verification popup never receives a marker or automated typing.
NativeTapTick() {
    global NativeTapBlocked
    static lastScan := 0, markerX := 0, markerY := 0, markerWindow := 0
    if NativeTapBlocked || GetKeyState("Ctrl", "P") || GetKeyState("Alt", "P") || GetKeyState("Shift", "P") || GetKeyState("LButton", "P")
        return
    try {
        activeWindow := WinExist("A")
        process := WinGetProcessName("ahk_id " activeWindow)
        if !((process = "chrome.exe" || process = "msedge.exe") && InStr(WinGetTitle("ahk_id " activeWindow), "Gacha"))
            return
        WinGetClientPos &areaX, &areaY, &areaW, &areaH, "ahk_id " activeWindow
        if markerWindow != activeWindow || markerX < areaX || markerY < areaY || markerX + 8 >= areaX + areaW || markerY + 8 >= areaY + areaH || !TapSignature(markerX, markerY) {
            if A_TickCount - lastScan < 250
                return
            lastScan := A_TickCount
            if !PixelSearch(&foundX, &foundY, areaX, areaY, areaX + areaW - 1, areaY + areaH - 1, 0x13C7A5, 0)
                return
            if !TapSignature(foundX, foundY)
                return
            markerX := foundX, markerY := foundY, markerWindow := activeWindow
        }
        if !WinActive("ahk_id " activeWindow) || !TapSignature(markerX, markerY)
            return
        MouseGetPos &pointerX, &pointerY
        Click markerX + 4, markerY + 4
        MouseMove pointerX, pointerY, 0
    } catch {
        ; An obscured/minimized/closing window is simply not clicked.
    }
}

TapSignature(markerX, markerY) {
    return PixelGetColor(markerX, markerY) = 0x13C7A5
        && PixelGetColor(markerX + 1, markerY) = 0xD32B79
        && PixelGetColor(markerX, markerY + 1) = 0xF4C842
        && PixelGetColor(markerX + 1, markerY + 1) = 0x6752D1
}

Notice(message) {
    ToolTip message
    SetTimer () => ToolTip(), -2500
}
