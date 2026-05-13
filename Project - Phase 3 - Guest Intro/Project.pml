<?xml version="1.0" encoding="UTF-8" ?>
<Package name="Project" format_version="4">
    <Manifest src="manifest.xml" />
    <BehaviorDescriptions>
        <BehaviorDescription name="behavior" src="behavior_1" xar="behavior.xar" />
    </BehaviorDescriptions>
    <Dialogs>
        <Dialog name="ExampleDialog" src="behavior_1/ExampleDialog/ExampleDialog.dlg" />
        <Dialog name="guest1intro" src="guest1intro/guest1intro.dlg" />
        <Dialog name="guest1wait" src="guest1wait/guest1wait.dlg" />
        <Dialog name="1guest2" src="1guest2/1guest2.dlg" />
        <Dialog name="guest2wait" src="guest2wait/guest2wait.dlg" />
        <Dialog name="finished" src="finished/finished.dlg" />
    </Dialogs>
    <Resources>
        <File name="suit picture" src="html/pics/suit_picture.png" />
        <File name="introducing_guest" src="html/css/introducing_guest.css" />
        <File name="introducing_guest" src="html/js/introducing_guest.js" />
        <File name="introducing_guest" src="html/pages/introducing_guest.html" />
        <File name="applause2" src="sounds/applause2.ogg" />
        <File name="bonuspts" src="sounds/bonuspts.ogg" />
        <File name="gamepositive" src="sounds/gamepositive.ogg" />
        <File name="glitch" src="sounds/glitch.ogg" />
        <File name="intro" src="sounds/intro.ogg" />
        <File name="itempop" src="sounds/itempop.ogg" />
    </Resources>
    <Topics>
        <Topic name="ExampleDialog_enu" src="behavior_1/ExampleDialog/ExampleDialog_enu.top" topicName="ExampleDialog" language="en_US" />
        <Topic name="guest1intro_enu" src="guest1intro/guest1intro_enu.top" topicName="guest1intro" language="en_US" />
        <Topic name="guest1wait_enu" src="guest1wait/guest1wait_enu.top" topicName="guest1wait" language="en_US" />
        <Topic name="1guest2_enu" src="1guest2/1guest2_enu.top" topicName="1guest2" language="en_US" />
        <Topic name="guest2wait_enu" src="guest2wait/guest2wait_enu.top" topicName="guest2wait" language="en_US" />
        <Topic name="finished_enu" src="finished/finished_enu.top" topicName="finished" language="en_US" />
    </Topics>
    <IgnoredPaths />
    <Translations auto-fill="en_US">
        <Translation name="translation_en_US" src="translations/translation_en_US.ts" language="en_US" />
    </Translations>
</Package>
