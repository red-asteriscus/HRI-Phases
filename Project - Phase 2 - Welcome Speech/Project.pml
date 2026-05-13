<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="welcome" src="welcome/welcome.dlg" />
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="intro" src="intro/intro.dlg" />
        <Dialog name="ready" src="ready/ready.dlg" />
        <Dialog name="Speech" src="Speech/Speech.dlg" />
    </Dialogs>
    <Resources>
        <File name="suit picture" src="html/pics/suit_picture.png" />
        <File name="welcome" src="html/css/welcome.css" />
        <File name="welcome" src="html/js/welcome.js" />
        <File name="welcome" src="html/pages/welcome.html" />
        <File name="applause2" src="sounds/applause2.ogg" />
        <File name="alex_kizenkov-cyber-punk-logo-502648" src="sounds/intro.ogg" />
        <File name="cartoon-music-soundtrack-arcade-game-positive-selection-bling-489760" src="sounds/gamepositive.ogg" />
        <File name="cartoon-music-soundtrack-video-game-bonus-points-512990" src="sounds/bonuspts.ogg" />
        <File name="cartoon-music-soundtrack-video-game-collect-item-pop-amp-flutter-512992" src="sounds/itempop.ogg" />
        <File name="freesound_community-computer-glitch-corrupted-file-96176" src="sounds/glitch.ogg" />
    </Resources>
    <Topics>
        <Topic name="welcome_enu" src="welcome/welcome_enu.top" topicName="phase2_welcome" language="en_US" />
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="intro_enu" src="intro/intro_enu.top" topicName="intro" language="en_US" />
        <Topic name="ready_enu" src="ready/ready_enu.top" topicName="ready" language="en_US" />
        <Topic name="Speech_enu" src="Speech/Speech_enu.top" topicName="Speech" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
