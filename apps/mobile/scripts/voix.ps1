param([string]$texte, [string]$sortie)
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('Microsoft Hortense Desktop')
$s.Rate = 0
$s.SetOutputToWaveFile($sortie)
$s.Speak($texte)
$s.Dispose()
