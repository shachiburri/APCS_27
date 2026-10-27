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

F8::RunOnGame("toggle")
F9::RunOnGame("stop")

RunOnGame(action) {
    static busy := false
    if busy
        return
    busy := true
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
    }
}

Notice(message) {
    ToolTip message
    SetTimer () => ToolTip(), -2500
}
